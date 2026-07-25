import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../_lib/supabase';
import { BoardChallengeOrder } from '../_lib/types';
import { generateSecondSmsCommand } from '../_lib/boardsAndSubjects';

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
