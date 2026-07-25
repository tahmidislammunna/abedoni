import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = 
  (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_URL) ||
  (typeof process !== 'undefined' && process.env?.SUPABASE_URL) ||
  'https://ybxquqshnghsdosqiqiu.supabase.co';

const supabaseAnonKey = 
  (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_ANON_KEY) ||
  (typeof process !== 'undefined' && process.env?.SUPABASE_ANON_KEY) ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlieHF1cXNobmdoc2Rvc3FpcWl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ5NjgxMTUsImV4cCI6MjEwMDU0NDExNX0._kV8KqLLqN2p6QzM4wzj4Jkc5_wKlP_-qozJsSVi75c';

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export async function fetchAppSettingsFromSupabase() {
  try {
    const { data, error } = await supabase
      .from('app_settings')
      .select('settings')
      .eq('id', 'main')
      .maybeSingle();

    if (!error && data?.settings) {
      return data.settings;
    }
  } catch (err) {
    console.warn('Failed to fetch app settings from Supabase:', err);
  }
  return null;
}

export async function saveAppSettingsToSupabase(newSettings: any) {
  try {
    const { data, error } = await supabase
      .from('app_settings')
      .select('settings')
      .eq('id', 'main')
      .maybeSingle();

    const current = (data && data.settings) || {};
    const updated = { ...current, ...newSettings };

    await supabase
      .from('app_settings')
      .upsert({ id: 'main', settings: updated, updated_at: new Date().toISOString() });

    return updated;
  } catch (err) {
    console.error('Failed to save app settings to Supabase:', err);
  }
  return newSettings;
}
