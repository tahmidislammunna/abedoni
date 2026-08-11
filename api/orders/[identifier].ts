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

export type EducationBoard = 
  | 'DHA' | 'RAJ' | 'COM' | 'CTG' | 'BAR' 
  | 'SYL' | 'DIN' | 'MYM' | 'JES' | 'MAD' | 'TEC';

export type ExamType = 'SSC' | 'DAKHIL' | 'VOCATIONAL';

export type OrderStatus = 
  | 'Pending Lead'
  | 'Pending' 
  | 'Contacted'
  | 'Payment Pending'
  | 'Payment Verified' 
  | 'Finalized'
  | 'Processing' 
  | 'Completed' 
  | 'Cancelled';

export type PaymentMethod = 'Bangla QR' | 'bKash' | 'Nagad' | 'Rocket' | 'Upay';

export interface BoardChallengeOrder {
  id: string;
  receiptId: string;
  createdAt: string;
  updatedAt: string;
  isFinalized?: boolean;
  studentName: string;
  fatherName: string;
  motherName?: string;
  roll: string;
  reg: string;
  board: EducationBoard;
  exam: ExamType;
  year: number;
  phone: string;
  whatsapp: string;
  email?: string;
  subjects: string[];
  subjectNamesBn?: string[];
  officialFee: number;
  platformFee: number;
  totalFee: number;
  paymentMethod: PaymentMethod;
  paymentSenderPhone: string;
  trxId: string;
  paymentStatus: 'Paid' | 'Reviewing' | 'Unverified' | 'Failed';
  orderStatus: OrderStatus;
  adminNotes?: string;
  teletalkSmsCommand1?: string;
  boardReply1?: string;
  teletalkPin?: string;
  teletalkSmsCommand2?: string;
  screenshotUrl?: string;
}

function generateSecondSmsCommand(pin: string, contactPhone: string): string {
  return `RSC YES ${pin.trim()} ${contactPhone.trim()}`;
}

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
    receiptId: row.receipt_id || `RCP-${row.id.replace(/\D/g, '')}`,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    isFinalized: Boolean(row.is_finalized || row.order_status === 'Finalized' || row.order_status === 'Completed' || row.order_status === 'Processing' || row.order_status === 'Payment Verified' || (row.roll && row.reg && row.student_name && row.student_name !== 'পেন্ডিং লিড')),
    studentName: row.student_name || 'পেন্ডিং লিড',
    fatherName: row.father_name || '',
    motherName: row.mother_name || '',
    roll: row.roll || '',
    reg: row.reg || '',
    board: row.board || 'DHA',
    exam: row.exam || 'SSC',
    year: Number(row.year || 2026),
    phone: row.phone || '',
    whatsapp: row.whatsapp || row.phone || '',
    email: row.email || '',
    subjects: subjectsArr,
    subjectNamesBn: subjectNamesBnArr,
    officialFee: Number(row.official_fee || (subjectsArr.length * 150)),
    platformFee: Number(row.platform_fee || 49),
    totalFee: Number(row.total_fee || (subjectsArr.length * 150 + 49)),
    paymentMethod: row.payment_method || 'bKash',
    paymentSenderPhone: row.payment_sender_phone || row.phone || '',
    trxId: row.trx_id || 'PENDING_TRX',
    paymentStatus: row.payment_status || 'Pending',
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
    const { 
      orderStatus, 
      paymentStatus, 
      isFinalized,
      teletalkPin, 
      boardReply1, 
      adminNotes,
      studentName,
      fatherName,
      motherName,
      roll,
      reg,
      board,
      phone,
      whatsapp,
      trxId,
      paymentSenderPhone,
      paymentMethod,
      totalFee,
      officialFee,
      platformFee,
      subjects,
      subjectNamesBn
    } = req.body || {};

    try {
      const { data, error: fetchErr } = await supabase.from('orders').select('*').eq('id', cleanIdentifier).maybeSingle();
      if (fetchErr || !data) {
        return res.status(404).json({ error: 'অর্ডারটি পাওয়া যায়নি' });
      }

      const currentOrder = dbRowToOrder(data);

      const finalPhone = phone !== undefined ? phone : currentOrder.phone;
      const finalPin = teletalkPin !== undefined ? teletalkPin : currentOrder.teletalkPin;
      const finalBoard = board !== undefined ? board : currentOrder.board;
      const finalRoll = roll !== undefined ? roll : currentOrder.roll;
      const finalReg = reg !== undefined ? reg : currentOrder.reg;
      const finalSubjects = subjects !== undefined ? subjects : currentOrder.subjects;

      const finalIsFinalized = isFinalized !== undefined 
        ? Boolean(isFinalized) 
        : (orderStatus === 'Finalized' || orderStatus === 'Completed' ? true : currentOrder.isFinalized);

      const updatedOrder: BoardChallengeOrder = {
        ...currentOrder,
        updatedAt: new Date().toISOString(),
        isFinalized: finalIsFinalized,
        orderStatus: orderStatus || (finalIsFinalized ? 'Finalized' : currentOrder.orderStatus),
        paymentStatus: paymentStatus || currentOrder.paymentStatus,
        teletalkPin: finalPin,
        boardReply1: boardReply1 !== undefined ? boardReply1 : currentOrder.boardReply1,
        adminNotes: adminNotes !== undefined ? adminNotes : currentOrder.adminNotes,
        studentName: studentName !== undefined ? studentName : currentOrder.studentName,
        fatherName: fatherName !== undefined ? fatherName : currentOrder.fatherName,
        motherName: motherName !== undefined ? motherName : currentOrder.motherName,
        roll: finalRoll,
        reg: finalReg,
        board: finalBoard,
        phone: finalPhone,
        whatsapp: whatsapp !== undefined ? whatsapp : (phone || currentOrder.whatsapp),
        trxId: trxId !== undefined ? trxId : currentOrder.trxId,
        paymentSenderPhone: paymentSenderPhone !== undefined ? paymentSenderPhone : currentOrder.paymentSenderPhone,
        paymentMethod: paymentMethod !== undefined ? paymentMethod : currentOrder.paymentMethod,
        officialFee: officialFee !== undefined ? Number(officialFee) : currentOrder.officialFee,
        platformFee: platformFee !== undefined ? Number(platformFee) : currentOrder.platformFee,
        totalFee: totalFee !== undefined ? Number(totalFee) : currentOrder.totalFee,
        subjects: finalSubjects,
        subjectNamesBn: subjectNamesBn !== undefined ? subjectNamesBn : currentOrder.subjectNamesBn,
      };

      const dbRow = orderToDbRow(updatedOrder);
      const { error: updateErr } = await supabase.from('orders').update(dbRow).eq('id', cleanIdentifier);

      if (updateErr) {
        return res.status(500).json({ error: updateErr.message });
      }

      return res.status(200).json({
        success: true,
        message: 'অর্ডার তথ্য সফলভাবে আপডেট হয়েছে',
        order: updatedOrder,
      });
    } catch (err) {
      return res.status(500).json({ error: 'আপডেট করতে ব্যর্থ হয়েছে' });
    }
  }

  // DELETE /api/orders/:identifier
  if (req.method === 'DELETE') {
    try {
      const { error } = await supabase.from('orders').delete().eq('id', cleanIdentifier);
      if (error) {
        return res.status(500).json({ error: error.message });
      }
      return res.status(200).json({ success: true, message: 'আবেদনটি সফলভাবে ডিলিট করা হয়েছে' });
    } catch (err) {
      return res.status(500).json({ error: 'ডিলিট করতে সমস্যা হয়েছে' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
