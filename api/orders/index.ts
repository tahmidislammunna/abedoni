import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase, dbRowToOrder, orderToDbRow } from '../_lib/supabase';
import { BoardChallengeOrder } from '../_lib/types';
import { 
  OFFICIAL_FEE_PER_SUBJECT, 
  ABEDONI_PLATFORM_FEE_PER_ORDER, 
  generateFirstSmsCommand,
  SSC_SUBJECTS
} from '../_lib/boardsAndSubjects';

const mapSubjectNames = (codes: string[]): string[] => {
  return codes.map(code => {
    const match = SSC_SUBJECTS.find(s => s.code === code);
    return match ? match.nameBn : `বিষয় কোড: ${code}`;
  });
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // GET /api/orders (List / Search)
  if (req.method === 'GET') {
    const { search, status, board } = req.query;

    try {
      let query = supabase.from('orders').select('*');

      if (status && typeof status === 'string' && status !== 'ALL') {
        query = query.eq('order_status', status);
      }

      if (board && typeof board === 'string' && board !== 'ALL') {
        query = query.eq('board', board);
      }

      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (!error && data) {
        let result = data.map(dbRowToOrder);

        if (search && typeof search === 'string') {
          const q = search.trim().toLowerCase();
          result = result.filter(o => 
            o.id.toLowerCase().includes(q) ||
            o.receiptId.toLowerCase().includes(q) ||
            o.roll.includes(q) ||
            o.reg.includes(q) ||
            o.phone.includes(q) ||
            o.studentName.toLowerCase().includes(q) ||
            o.trxId.toLowerCase().includes(q)
          );
        }

        return res.status(200).json(result);
      } else if (error) {
        console.error('Supabase query error in GET /api/orders:', error.message);
      }
    } catch (err) {
      console.error('Error in GET /api/orders:', err);
    }

    return res.status(200).json([]);
  }

  // POST /api/orders (Create Order)
  if (req.method === 'POST') {
    try {
      const body = req.body || {};
      
      if (!body.studentName || !body.roll || !body.reg || !body.board || !body.phone || !body.subjects || body.subjects.length === 0) {
        return res.status(400).json({ error: 'সকল প্রয়োজনীয় ফিল্ড পূরণ করুন।' });
      }

      const randomSuffix = Math.floor(10000 + Math.random() * 90000).toString();
      const orderId = `ABD-2026-${randomSuffix}`;
      const receiptId = `RCP-${randomSuffix}`;
      const now = new Date().toISOString();

      const numSubjects = body.subjects.length;
      const officialFee = numSubjects * OFFICIAL_FEE_PER_SUBJECT;
      const platformFee = ABEDONI_PLATFORM_FEE_PER_ORDER;
      const totalFee = officialFee + platformFee;

      const smsCmd1 = generateFirstSmsCommand(body.board, body.roll, body.subjects);

      const newOrder: BoardChallengeOrder = {
        id: orderId,
        receiptId: receiptId,
        createdAt: now,
        updatedAt: now,
        studentName: body.studentName.trim(),
        fatherName: body.fatherName ? body.fatherName.trim() : '',
        motherName: body.motherName ? body.motherName.trim() : '',
        roll: body.roll.trim(),
        reg: body.reg.trim(),
        board: body.board,
        exam: body.exam || 'SSC',
        year: 2026,
        phone: body.phone.trim(),
        whatsapp: body.whatsapp ? body.whatsapp.trim() : body.phone.trim(),
        email: body.email ? body.email.trim() : '',
        subjects: body.subjects,
        subjectNamesBn: mapSubjectNames(body.subjects),
        officialFee,
        platformFee,
        totalFee,
        paymentMethod: body.paymentMethod || 'bKash',
        paymentSenderPhone: body.paymentSenderPhone ? body.paymentSenderPhone.trim() : body.phone.trim(),
        trxId: body.trxId ? body.trxId.trim().toUpperCase() : 'PENDING_TRX',
        paymentStatus: 'Reviewing',
        orderStatus: 'Pending',
        teletalkSmsCommand1: smsCmd1,
        adminNotes: 'নতুন আবেদন সাবমিট হয়েছে। Written Reviewing by Abedoni',
      };

      const dbRow = orderToDbRow(newOrder);
      const { error } = await supabase.from('orders').insert(dbRow);

      if (error) {
        console.error('Failed to insert order into Supabase:', error.message);
        return res.status(500).json({ error: `ডাটাবেজে সংরক্ষণ করতে সমস্যা হয়েছে: ${error.message}` });
      }

      return res.status(201).json({
        success: true,
        message: 'আবেদন সফলভাবে গৃহীত হয়েছে!',
        order: newOrder,
      });
    } catch (err) {
      console.error('Error creating order:', err);
      return res.status(500).json({ error: 'আবেদন প্রসেস করতে সাময়িক সমস্যা হয়েছে।' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
