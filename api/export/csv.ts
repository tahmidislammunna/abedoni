import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../_lib/supabase';
import { BoardChallengeOrder } from '../_lib/types';

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
