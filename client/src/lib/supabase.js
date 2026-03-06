import { createClient } from '@supabase/supabase-js';

const supabaseUrl  = process.env.REACT_APP_SUPABASE_URL  || 'https://fdcxpgtmqlfjbgcyxokx.supabase.co';
const supabaseAnon = process.env.REACT_APP_SUPABASE_ANON || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkY3hwZ3RtcWxmamJnY3l4b2t4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3Nzg1ODMsImV4cCI6MjA4ODM1NDU4M30.Ugtu_ns8ynwXaK79bq5B9VY82SKkZTlJ9gfjq7u1i2o';

export const supabase = createClient(supabaseUrl, supabaseAnon);
