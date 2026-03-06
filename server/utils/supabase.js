// Polyfill fetch/Headers for Node.js < 18
require('cross-fetch/polyfill');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl  = process.env.SUPABASE_URL;
const serviceKey   = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.warn('⚠️  Supabase credentials missing — auth/credits disabled');
}

// Admin client — bypasses Row Level Security, server-side only
const supabaseAdmin = supabaseUrl && serviceKey
  ? createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })
  : null;

module.exports = { supabaseAdmin };
