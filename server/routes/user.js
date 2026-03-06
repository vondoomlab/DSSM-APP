const express = require('express');
const router  = express.Router();
const { supabaseAdmin } = require('../utils/supabase');
const { CREDIT_COSTS } = require('../middleware/auth');

// Helper: get or auto-create a user's credits row (2 free credits on first access)
async function getOrCreateCredits(user_id) {
  // Try to get existing row
  const { data, error } = await supabaseAdmin
    .from('credits')
    .select('balance, total_purchased, created_at')
    .eq('user_id', user_id)
    .single();

  if (data && !error) {
    console.log(`[credits] found row for ${user_id.substring(0,8)}… balance=${data.balance}`);
    return { data, error: null };
  }

  console.log(`[credits] no row found (code=${error?.code}), auto-creating for ${user_id.substring(0,8)}…`);

  // No row yet — upsert 2 free credits
  const { data: newRow, error: insertErr } = await supabaseAdmin
    .from('credits')
    .upsert(
      { user_id, balance: 2, total_purchased: 0, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    )
    .select('balance, total_purchased, created_at')
    .single();

  if (insertErr) {
    console.error(`[credits] upsert FAILED for ${user_id.substring(0,8)}…`, insertErr);
  } else {
    console.log(`[credits] created row with balance=${newRow?.balance}`);
  }

  return { data: newRow, error: insertErr };
}

// GET /api/user/credits — returns current balance
router.get('/credits', async (req, res) => {
  if (!supabaseAdmin) return res.json({ balance: null, dev: true });

  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Not authenticated' });

  const { data: { user }, error: authErr } = await supabaseAdmin.auth.getUser(token);
  if (authErr || !user) {
    console.error('[credits] auth.getUser failed:', authErr?.message);
    return res.status(401).json({ error: 'Invalid session' });
  }

  console.log(`[credits] fetching for user ${user.id.substring(0,8)}… email=${user.email}`);

  const { data, error: dbErr } = await getOrCreateCredits(user.id);
  if (dbErr || !data) {
    console.error('[credits] getOrCreate returned error:', dbErr);
    return res.status(500).json({ error: 'Could not load credits', detail: dbErr?.message });
  }

  const isAdmin = process.env.ADMIN_EMAIL && user.email === process.env.ADMIN_EMAIL;

  res.json({
    balance:         data.balance,
    total_purchased: data.total_purchased,
    member_since:    data.created_at,
    credit_costs:    CREDIT_COSTS,
    is_admin:        isAdmin || false,
  });
});

// GET /api/user/usage — returns last 20 usage events
router.get('/usage', async (req, res) => {
  if (!supabaseAdmin) return res.json({ usage: [] });

  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Not authenticated' });

  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) return res.status(401).json({ error: 'Invalid session' });

  const { data, error: dbErr } = await supabaseAdmin
    .from('usage_log')
    .select('route, credits_used, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20);

  if (dbErr) return res.status(500).json({ error: 'DB error' });
  res.json({ usage: data });
});

// POST /api/user/add-credits — admin endpoint to manually add credits
router.post('/add-credits', async (req, res) => {
  if (!supabaseAdmin) return res.json({ ok: true, dev: true });

  const { user_id, amount, admin_secret } = req.body;

  if (admin_secret !== process.env.ADMIN_SECRET) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const { data: current } = await getOrCreateCredits(user_id);
  if (!current) return res.status(404).json({ error: 'User not found' });

  const { error } = await supabaseAdmin
    .from('credits')
    .update({
      balance:         current.balance + amount,
      total_purchased: current.total_purchased + amount,
      updated_at:      new Date().toISOString(),
    })
    .eq('user_id', user_id);

  if (error) return res.status(500).json({ error: 'Update failed' });
  res.json({ ok: true, new_balance: current.balance + amount });
});

module.exports = router;
