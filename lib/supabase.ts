import { createClient } from '@supabase/supabase-js';

// Robustly try to get environment variables from various bundler formats
const getEnvVar = (key: string, viteKey: string, reactKey: string, nextKey: string, fallback: string) => {
  let value = '';
  
  // 1. Try standard process.env (Node/CRA/Next) - wrapped in try/catch for browsers without polyfill
  try {
    if (typeof process !== 'undefined' && process.env) {
      if (process.env[key]) value = process.env[key] as string;
      else if (process.env[reactKey]) value = process.env[reactKey] as string;
      else if (process.env[nextKey]) value = process.env[nextKey] as string;
    }
  } catch (e) {
    // process is not defined
  }

  // 2. Try Vite import.meta.env
  try {
    // @ts-ignore
    if (!value && import.meta && import.meta.env && import.meta.env[viteKey]) {
      // @ts-ignore
      value = import.meta.env[viteKey];
    }
  } catch (e) {
    // import.meta is not defined
  }

  return value || fallback;
};

// Configured with provided credentials as fallback
const supabaseUrl = getEnvVar(
  'SUPABASE_URL', 
  'VITE_SUPABASE_URL', 
  'REACT_APP_SUPABASE_URL', 
  'NEXT_PUBLIC_SUPABASE_URL', 
  'https://wnvgdflbmoipjqexcuqc.supabase.co'
);

const supabaseAnonKey = getEnvVar(
  'SUPABASE_ANON_KEY', 
  'VITE_SUPABASE_ANON_KEY', 
  'REACT_APP_SUPABASE_ANON_KEY', 
  'NEXT_PUBLIC_SUPABASE_ANON_KEY', 
  'sb_publishable_l0NJamx0YJzCtWR5CjE_qg_cOWTD-Y4'
);

export const isSupabaseConfigured = !!supabaseUrl && !!supabaseAnonKey;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);