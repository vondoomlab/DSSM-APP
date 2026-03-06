const { supabaseAdmin } = require('../utils/supabase');

// Credit cost per route
const CREDIT_COSTS = {
  '/api/ask':      1,
  '/api/classify': 2,
  '/api/score':    2,
  '/api/predict':  3,
};

/**
 * requireAuth — verifies Supabase JWT, checks + deducts credits.
 * If Supabase is not configured, passes through (dev mode).
 */
async function requireAuth(req, res, next) {
  // Dev mode: if no Supabase configured, allow all requests
  if (!supabaseAdmin) {
    req.user = null;
    req.credits = null;
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Login required. Please sign in to use DSSM Intelligence.' });
  }

  const token = authHeader.replace('Bearer ', '');

  try {
    // Verify the JWT and get the user
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ error: 'Session expired. Please sign in again.' });
    }

    // Admin bypass — unlimited access, no credit deduction
    if (process.env.ADMIN_EMAIL && user.email === process.env.ADMIN_EMAIL) {
      req.user = user;
      req.isAdmin = true;
      req.creditsUsed = 0;
      req.creditsRemaining = Infinity;
      return next();
    }

    // Get credit balance — auto-create row with 2 free credits if first time
    let { data: creditRow, error: creditErr } = await supabaseAdmin
      .from('credits')
      .select('balance')
      .eq('user_id', user.id)
      .single();

    if (!creditRow || creditErr?.code === 'PGRST116') {
      // First login — no credits row yet, create one now
      const { data: newRow, error: insertErr } = await supabaseAdmin
        .from('credits')
        .upsert(
          { user_id: user.id, balance: 2, total_purchased: 0, updated_at: new Date().toISOString() },
          { onConflict: 'user_id' }
        )
        .select('balance')
        .single();
      if (insertErr || !newRow) {
        return res.status(500).json({ error: 'Could not initialise credit balance.' });
      }
      creditRow = newRow;
    } else if (creditErr) {
      return res.status(500).json({ error: 'Could not read credit balance.' });
    }

    const cost = CREDIT_COSTS[req.baseUrl] || CREDIT_COSTS[req.path] || 1;
    if (creditRow.balance < cost) {
      return res.status(402).json({
        error: 'Not enough credits.',
        balance: creditRow.balance,
        required: cost,
      });
    }

    // Deduct credits
    const { error: deductErr } = await supabaseAdmin
      .from('credits')
      .update({
        balance: creditRow.balance - cost,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);

    if (deductErr) {
      return res.status(500).json({ error: 'Credit deduction failed.' });
    }

    // Log usage
    await supabaseAdmin.from('usage_log').insert({
      user_id: user.id,
      route: req.path,
      credits_used: cost,
    });

    req.user = user;
    req.creditsUsed = cost;
    req.creditsRemaining = creditRow.balance - cost;
    next();

  } catch (err) {
    console.error('Auth middleware error:', err.message);
    res.status(500).json({ error: 'Authentication error.' });
  }
}

module.exports = { requireAuth, CREDIT_COSTS };
