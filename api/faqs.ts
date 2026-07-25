import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from './_lib/supabase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { data, error } = await supabase
      .from('faqs')
      .select('*')
      .order('id', { ascending: true });

    if (!error && data) {
      const mapped = data.map(f => ({
        questionBn: f.question_bn,
        answerBn: f.answer_bn,
        category: f.category,
      }));
      return res.status(200).json(mapped);
    }
  } catch (err) {
    console.error('Error fetching faqs:', err);
  }

  return res.status(200).json([]);
}
