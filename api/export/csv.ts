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
