import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../src/lib/supabase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      const mapped = data.map(r => ({
        id: r.id,
        name: r.name,
        board: r.board,
        rollMasked: r.roll_masked,
        commentBn: r.comment_bn,
        rating: r.rating,
        date: r.date,
      }));
      return res.status(200).json(mapped);
    }
  } catch (err) {
    console.error('Error fetching reviews:', err);
  }

  return res.status(200).json([]);
}
