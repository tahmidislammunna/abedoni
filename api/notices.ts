import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from './_lib/supabase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { data, error } = await supabase
      .from('notices')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      const mapped = data.map(n => ({
        id: n.id,
        titleBn: n.title_bn,
        titleEn: n.title_en || '',
        date: n.date,
        category: n.category,
        contentBn: n.content_bn,
        contentEn: n.content_en || '',
        isImportant: n.is_important,
      }));
      return res.status(200).json(mapped);
    }
  } catch (err) {
    console.error('Error fetching notices:', err);
  }

  return res.status(200).json([]);
}
