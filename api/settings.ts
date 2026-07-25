import type { VercelRequest, VercelResponse } from '@vercel/node';
import { fetchAppSettingsFromSupabase, saveAppSettingsToSupabase } from '../src/lib/supabase';
import { DEFAULT_APP_SETTINGS } from '../src/data/appSettings';

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
