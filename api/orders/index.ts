import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../_lib/supabase';
import { BoardChallengeOrder } from '../_lib/types';
import { 
  OFFICIAL_FEE_PER_SUBJECT, 
  ABEDONI_PLATFORM_FEE_PER_ORDER, 
  generateFirstSmsCommand,
  SSC_SUBJECTS
} from '../_lib/boardsAndSubjects';

function dbRowToOrder(row: any): BoardChallengeOrder {
  let subjectsArr: string[] = [];
  if (Array.isArray(row.subjects)) {
    subjectsArr = row.subjects;
  } else if (typeof row.subjects === 'string') {
    try { subjectsArr = JSON.parse(row.subjects); } catch { subjectsArr = []; }
  }

  let subjectNamesBnArr: string[] = [];
  if (Array.isArray(row.subject_names_bn)) {
    subjectNamesBnArr = row.subject_names_bn;
  } else if (typeof row.subject_names_bn === 'string') {
    try { subjectNamesBnArr = JSON.parse(row.subject_names_bn); } catch { subjectNamesBnArr = []; }
  }

  return {
    id: row.id,
    receiptId: row.receipt_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    studentName: row.student_name,
    fatherName: row.father_name || '',
    motherName: row.mother_name || '',
    roll: row.roll,
    reg: row.reg,
    board: row.board,
    exam: row.exam || 'SSC',
    year: Number(row.year || 2026),
    phone: row.phone,
    whatsapp: row.whatsapp || row.phone,
    email: row.email || '',
    subjects: subjectsArr,
    subjectNamesBn: subjectNamesBnArr,
    officialFee: Number(row.official_fee || 0),
    platformFee: Number(row.platform_fee || 0),
    totalFee: Number(row.total_fee || 0),
    paymentMethod: row.payment_method || 'bKash',
    paymentSenderPhone: row.payment_sender_phone || row.phone,
    trxId: row.trx_id,
    paymentStatus: row.payment_status || 'Reviewing',
    orderStatus: row.order_status || 'Pending',
    adminNotes: row.admin_notes || '',
    teletalkSmsCommand1: row.teletalk_sms_command1 || '',
    boardReply1: row.board_reply1 || '',
    teletalkPin: row.teletalk_pin || '',
    teletalkSmsCommand2: row.teletalk_sms_command2 || '',
    screenshotUrl: row.screenshot_url || '',
  };
}

function orderToDbRow(order: Partial<BoardChallengeOrder>): Record<string, any> {
  const row: Record<string, any> = {};
  if (order.id !== undefined) row.id = order.id;
  if (order.receiptId !== undefined) row.receipt_id = order.receiptId;
  if (order.createdAt !== undefined) row.created_at = order.createdAt;
  if (order.updatedAt !== undefined) row.updated_at = order.updatedAt;
  if (order.studentName !== undefined) row.student_name = order.studentName;
  if (order.fatherName !== undefined) row.father_name = order.fatherName;
  if (order.motherName !== undefined) row.mother_name = order.motherName;
  if (order.roll !== undefined) row.roll = order.roll;
  if (order.reg !== undefined) row.reg = order.reg;
  if (order.board !== undefined) row.board = order.board;
  if (order.exam !== undefined) row.exam = order.exam;
  if (order.year !== undefined) row.year = order.year;
  if (order.phone !== undefined) row.phone = order.phone;
  if (order.whatsapp !== undefined) row.whatsapp = order.whatsapp;
  if (order.email !== undefined) row.email = order.email;
  if (order.subjects !== undefined) row.subjects = order.subjects;
  if (order.subjectNamesBn !== undefined) row.subject_names_bn = order.subjectNamesBn;
  if (order.officialFee !== undefined) row.official_fee = order.officialFee;
  if (order.platformFee !== undefined) row.platform_fee = order.platformFee;
  if (order.totalFee !== undefined) row.total_fee = order.totalFee;
  if (order.paymentMethod !== undefined) row.payment_method = order.paymentMethod;
  if (order.paymentSenderPhone !== undefined) row.payment_sender_phone = order.paymentSenderPhone;
  if (order.trxId !== undefined) row.trx_id = order.trxId;
  if (order.paymentStatus !== undefined) row.payment_status = order.paymentStatus;
  if (order.orderStatus !== undefined) row.order_status = order.orderStatus;
  if (order.adminNotes !== undefined) row.admin_notes = order.adminNotes;
  if (order.teletalkSmsCommand1 !== undefined) row.teletalk_sms_command1 = order.teletalkSmsCommand1;
  if (order.boardReply1 !== undefined) row.board_reply1 = order.boardReply1;
  if (order.teletalkPin !== undefined) row.teletalk_pin = order.teletalkPin;
  if (order.teletalkSmsCommand2 !== undefined) row.teletalk_sms_command2 = order.teletalkSmsCommand2;
  if (order.screenshotUrl !== undefined) row.screenshot_url = order.screenshotUrl;
  return row;
}

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
