import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  'https://ybxquqshnghsdosqiqiu.supabase.co';

const supabaseAnonKey = 
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlieHF1cXNobmdoc2Rvc3FpcWl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ5NjgxMTUsImV4cCI6MjEwMDU0NDExNX0._kV8KqLLqN2p6QzM4wzj4Jkc5_wKlP_-qozJsSVi75c';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
