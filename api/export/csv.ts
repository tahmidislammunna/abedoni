import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase, dbRowToOrder } from '../../src/lib/supabase';
import { BoardChallengeOrder } from '../../src/types';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let ordersList: BoardChallengeOrder[] = [];

  try {
    const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (!error && data) {
      ordersList = data.map(dbRowToOrder);
    }
  } catch (err) {
    console.error('CSV export fetch error:', err);
  }

  const headers = 'Order ID,Receipt ID,Student Name,Roll,Reg,Board,Subjects,Total Fee,Payment Method,TrxID,Payment Status,Order Status,Phone,Teletalk SMS 1,Teletalk PIN,Created At\n';
  
  const rows = ordersList.map(o => {
    return [
      o.id,
      o.receiptId,
      `"${o.studentName}"`,
      o.roll,
      o.reg,
      o.board,
      `"${o.subjects.join(',')}"`,
      o.totalFee,
      o.paymentMethod,
      o.trxId,
      o.paymentStatus,
      o.orderStatus,
      o.phone,
      `"${o.teletalkSmsCommand1 || ''}"`,
      `"${o.teletalkPin || ''}"`,
      o.createdAt
    ].join(',');
  }).join('\n');

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="Abedoni_Board_Challenge_Orders_2026.csv"');
  return res.status(200).send('\uFEFF' + headers + rows);
}
