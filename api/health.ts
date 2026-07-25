import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from './_lib/supabase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let supabaseStatus = 'disconnected';
  let count = 0;

  try {
    const { count: dbCount, error } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true });
    if (!error && dbCount !== null) {
      supabaseStatus = 'connected';
      count = dbCount;
    }
  } catch {
    // ignore
  }

  return res.status(200).json({
    status: 'ok',
    app: 'আবেদনী - Abedoni',
    service: 'SSC Board Challenge 2026',
    database: 'Supabase PostgreSQL',
    supabaseStatus,
    ordersCount: count,
  });
}
