import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from './_lib/supabase';
import { DEFAULT_APP_SETTINGS, AppSettings } from './_lib/appSettings';

async function fetchAppSettingsFromSupabase(): Promise<AppSettings> {
  try {
    const { data, error } = await supabase
      .from('app_settings')
      .select('settings')
      .eq('id', 'main')
      .maybeSingle();

    if (error) {
      console.warn('Supabase fetchAppSettings warning:', error.message);
      return DEFAULT_APP_SETTINGS;
    }

    if (data && data.settings) {
      return { ...DEFAULT_APP_SETTINGS, ...data.settings };
    }
  } catch (err) {
    console.warn('Failed to fetch app settings from Supabase:', err);
  }
  return DEFAULT_APP_SETTINGS;
}

async function saveAppSettingsToSupabase(newSettings: Partial<AppSettings>): Promise<AppSettings> {
  const current = await fetchAppSettingsFromSupabase();
  const updated = { ...current, ...newSettings };

  try {
    const { error } = await supabase
      .from('app_settings')
      .upsert({ id: 'main', settings: updated, updated_at: new Date().toISOString() });

    if (error) {
      console.error('Supabase saveAppSettings error:', error.message);
    }
  } catch (err) {
    console.error('Failed to save app settings to Supabase:', err);
  }

  return updated;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    try {
      const settings = await fetchAppSettingsFromSupabase();
      return res.status(200).json(settings);
    } catch {
      return res.status(200).json(DEFAULT_APP_SETTINGS);
    }
  }

  if (req.method === 'POST') {
    try {
      const newSettings = req.body;
      const updated = await saveAppSettingsToSupabase(newSettings);
      return res.status(200).json({ success: true, settings: updated });
    } catch {
      return res.status(500).json({ error: 'Failed to update app settings' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
