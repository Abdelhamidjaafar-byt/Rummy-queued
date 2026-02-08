import { createClient } from '@supabase/supabase-js';

// Helper to safely access env vars in browser without crashing on 'process' reference
const getEnv = (key: string) => {
  try {
    return process.env[key];
  } catch (e) {
    return undefined;
  }
};

const supabaseUrl = getEnv('SUPABASE_URL') || 'https://wnvgdflbmoipjqexcuqc.supabase.co';
const supabaseAnonKey = getEnv('SUPABASE_ANON_KEY') || 'sb_publishable_l0NJamx0YJzCtWR5CjE_qg_cOWTD-Y4';

export const isSupabaseConfigured = !!supabaseUrl && !!supabaseAnonKey;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);