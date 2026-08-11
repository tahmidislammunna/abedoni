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
  | 'Pending' 
  | 'Payment Verified' 
  | 'Processing' 
  | 'SMS Sent' 
  | 'Completed' 
  | 'Updated' 
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

const BOARDS_LIST = [
  { code: 'DHA', codeSms: 'DHA' },
  { code: 'RAJ', codeSms: 'RAJ' },
  { code: 'COM', codeSms: 'COM' },
  { code: 'CTG', codeSms: 'CTG' },
  { code: 'BAR', codeSms: 'BAR' },
  { code: 'SYL', codeSms: 'SYL' },
  { code: 'DIN', codeSms: 'DIN' },
  { code: 'MYM', codeSms: 'MYM' },
  { code: 'JES', codeSms: 'JES' },
  { code: 'MAD', codeSms: 'MAD' },
  { code: 'TEC', codeSms: 'TEC' },
];

const OFFICIAL_FEE_PER_SUBJECT = 150;
const ABEDONI_PLATFORM_FEE_PER_ORDER = 49;

const SSC_SUBJECTS = [
  { code: '101', nameBn: 'বাংলা (Bangla First & Second)' },
  { code: '107', nameBn: 'ইংরেজি (English First & Second)' },
  { code: '109', nameBn: 'গণিত (Mathematics)' },
  { code: '154', nameBn: 'তথ্য ও যোগাযোগ প্রযুক্তি (ICT)' },
  { code: '111', nameBn: 'ইসলাম ও নৈতিক শিক্ষা (Islam)' },
  { code: '112', nameBn: 'হিন্দুধর্ম ও নৈতিক শিক্ষা (Hinduism)' },
  { code: '127', nameBn: 'বিজ্ঞান (General Science)' },
  { code: '150', nameBn: 'বাংলাদেশ ও বিশ্বপরিচয় (BGS)' },
  { code: '136', nameBn: 'পদার্থবিজ্ঞান (Physics)' },
  { code: '137', nameBn: 'রসায়ন (Chemistry)' },
  { code: '138', nameBn: 'জীববিজ্ঞান (Biology)' },
  { code: '126', nameBn: 'উচ্চতর গণিত (Higher Mathematics)' },
  { code: '146', nameBn: 'হিসাববিজ্ঞান (Accounting)' },
  { code: '143', nameBn: 'ব্যবসায় উদ্যোগ (Business Ent.)' },
  { code: '152', nameBn: 'ফিন্যান্স ও ব্যাংকিং (Finance & Banking)' },
  { code: '110', nameBn: 'ভূগোল ও পরিবেশ (Geography)' },
  { code: '153', nameBn: 'বাংলাদেশের ইতিহাস ও বিশ্বসভ্যতা' },
  { code: '140', nameBn: 'পৌরনীতি ও নাগরিকতা (Civics)' },
  { code: '134', nameBn: 'কৃষি শিক্ষা (Agriculture)' },
  { code: '151', nameBn: 'গার্হস্থ্য বিজ্ঞান (Home Science)' },
];

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
    isFinalized: Boolean(row.is_finalized || row.order_status === 'Finalized' || row.order_status === 'Completed'),
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
    orderStatus: row.order_status || 'Pending Lead',
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
  if (order.isFinalized !== undefined) row.is_finalized = order.isFinalized;
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
  if (!Array.isArray(codes)) return [];
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
            (o.roll && o.roll.includes(q)) ||
            (o.reg && o.reg.includes(q)) ||
            (o.phone && o.phone.includes(q)) ||
            (o.studentName && o.studentName.toLowerCase().includes(q)) ||
            (o.trxId && o.trxId.toLowerCase().includes(q))
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

  // POST /api/orders (Create Lead or Full Order)
  if (req.method === 'POST') {
    try {
      const body = req.body || {};
      
      if (!body.phone && !body.roll) {
        return res.status(400).json({ error: 'অন্তত মোবাইল নম্বর প্রদান করুন।' });
      }

      const randomSuffix = Math.floor(10000 + Math.random() * 90000).toString();
      const orderId = body.id || `ABD-2026-${randomSuffix}`;
      const receiptId = `RCP-${randomSuffix}`;
      const now = new Date().toISOString();

      const subjectsList = Array.isArray(body.subjects) ? body.subjects : [];
      const numSubjects = subjectsList.length;
      const officialFee = body.officialFee || (numSubjects * OFFICIAL_FEE_PER_SUBJECT);
      const platformFee = body.platformFee || ABEDONI_PLATFORM_FEE_PER_ORDER;
      const totalFee = body.totalFee || (officialFee + platformFee);

      const isLead = Boolean(!body.studentName || !body.roll || !body.reg || body.isLead || body.orderStatus === 'Pending Lead');

      const newOrder: BoardChallengeOrder = {
        id: orderId,
        receiptId: receiptId,
        createdAt: now,
        updatedAt: now,
        isFinalized: Boolean(body.isFinalized || (!isLead && body.orderStatus === 'Finalized')),
        studentName: body.studentName ? body.studentName.trim() : 'পেন্ডিং লিড (হোয়াটসঅ্যাপ)',
        fatherName: body.fatherName ? body.fatherName.trim() : '',
        motherName: body.motherName ? body.motherName.trim() : '',
        roll: body.roll ? body.roll.trim() : '',
        reg: body.reg ? body.reg.trim() : '',
        board: body.board || 'DHA',
        exam: body.exam || 'SSC',
        year: 2026,
        phone: body.phone ? body.phone.trim() : '',
        whatsapp: body.whatsapp ? body.whatsapp.trim() : (body.phone ? body.phone.trim() : ''),
        email: body.email ? body.email.trim() : '',
        subjects: subjectsList,
        subjectNamesBn: body.subjectNamesBn || mapSubjectNames(subjectsList),
        officialFee,
        platformFee,
        totalFee,
        paymentMethod: body.paymentMethod || 'bKash',
        paymentSenderPhone: body.paymentSenderPhone ? body.paymentSenderPhone.trim() : (body.phone ? body.phone.trim() : ''),
        trxId: body.trxId ? body.trxId.trim().toUpperCase() : 'PENDING_TRX',
        paymentStatus: body.paymentStatus || (isLead ? 'Pending' : 'Reviewing'),
        orderStatus: body.orderStatus || (isLead ? 'Pending Lead' : 'Pending'),
        adminNotes: body.adminNotes || (isLead ? 'ওয়েবসাইট থেকে লিড জমা হয়েছে। হোয়াটসঅ্যাপে যোগাযোগের অপেক্ষায়।' : 'নতুন আবেদন সাবমিট হয়েছে।'),
      };

      const dbRow = orderToDbRow(newOrder);
      const { error } = await supabase.from('orders').insert(dbRow);

      if (error) {
        console.error('Failed to insert order into Supabase:', error.message);
        return res.status(500).json({ error: `ডাটাবেজে সংরক্ষণ করতে সমস্যা হয়েছে: ${error.message}` });
      }

      return res.status(201).json({
        success: true,
        message: isLead ? 'লিড তথ্য সফলভাবে গৃহীত হয়েছে!' : 'আবেদন সফলভাবে গৃহীত হয়েছে!',
        order: newOrder,
      });
    } catch (err) {
      console.error('Error creating order:', err);
      return res.status(500).json({ error: 'আবেদন প্রসেস করতে সাময়িক সমস্যা হয়েছে।' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
