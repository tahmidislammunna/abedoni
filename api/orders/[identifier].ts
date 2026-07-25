import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase, dbRowToOrder, orderToDbRow } from '../_lib/supabase';
import { BoardChallengeOrder } from '../_lib/types';
import { generateSecondSmsCommand } from '../_lib/boardsAndSubjects';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { identifier } = req.query;
  if (!identifier || typeof identifier !== 'string') {
    return res.status(400).json({ error: 'আইডেন্টিফায়ার প্রদান করুন' });
  }

  const cleanIdentifier = identifier.trim();

  // GET /api/orders/:identifier
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .or(`id.ilike.${cleanIdentifier},receipt_id.ilike.${cleanIdentifier},roll.eq.${cleanIdentifier},phone.eq.${cleanIdentifier},trx_id.ilike.${cleanIdentifier}`)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return res.status(200).json(dbRowToOrder(data[0]));
      }
    } catch (err) {
      console.error('Supabase lookup error:', err);
    }

    return res.status(404).json({ error: 'আবেদনটি খুঁজে পাওয়া যায়নি। অনুগ্রহ করে সঠিক Order ID, Roll বা TrxID দিন।' });
  }

  // PATCH /api/orders/:identifier
  if (req.method === 'PATCH') {
    const { orderStatus, paymentStatus, teletalkPin, boardReply1, adminNotes } = req.body || {};

    try {
      const { data, error: fetchErr } = await supabase.from('orders').select('*').eq('id', cleanIdentifier).maybeSingle();
      if (fetchErr || !data) {
        return res.status(404).json({ error: 'অর্ডারটি পাওয়া যায়নি' });
      }

      const currentOrder = dbRowToOrder(data);

      let updatedSmsCmd2 = currentOrder.teletalkSmsCommand2;
      if (teletalkPin && teletalkPin.trim() !== '') {
        updatedSmsCmd2 = generateSecondSmsCommand(teletalkPin.trim(), currentOrder.phone);
      }

      const updatedOrder: BoardChallengeOrder = {
        ...currentOrder,
        updatedAt: new Date().toISOString(),
        orderStatus: orderStatus || currentOrder.orderStatus,
        paymentStatus: paymentStatus || currentOrder.paymentStatus,
        teletalkPin: teletalkPin !== undefined ? teletalkPin : currentOrder.teletalkPin,
        boardReply1: boardReply1 !== undefined ? boardReply1 : currentOrder.boardReply1,
        teletalkSmsCommand2: updatedSmsCmd2,
        adminNotes: adminNotes !== undefined ? adminNotes : currentOrder.adminNotes,
      };

      const dbRow = orderToDbRow(updatedOrder);
      const { error: updateErr } = await supabase.from('orders').update(dbRow).eq('id', cleanIdentifier);

      if (updateErr) {
        return res.status(500).json({ error: updateErr.message });
      }

      return res.status(200).json({
        success: true,
        message: 'অর্ডার স্ট্যাটাস আপডেট হয়েছে',
        order: updatedOrder,
      });
    } catch (err) {
      return res.status(500).json({ error: 'আপডেট করতে ব্যর্থ হয়েছে' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
