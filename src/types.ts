export type EducationBoard = 
  | 'DHA' // Dhaka
  | 'RAJ' // Rajshahi
  | 'COM' // Comilla
  | 'CTG' // Chittagong
  | 'BAR' // Barisal
  | 'SYL' // Sylhet
  | 'DIN' // Dinajpur
  | 'MYM' // Mymensingh
  | 'JES' // Jessore
  | 'MAD' // Madrasah
  | 'TEC'; // Technical

export type ExamType = 'SSC' | 'DAKHIL' | 'VOCATIONAL';

export interface SubjectItem {
  code: string;
  nameBn: string;
  nameEn: string;
  fee: number; // Board official fee per subject/paper
  category: 'General' | 'Science' | 'Commerce' | 'Humanities' | 'Islamic' | 'Technical';
}

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
  id: string; // e.g. ABD-2026-10492
  receiptId: string; // e.g. RCP-10492
  createdAt: string;
  updatedAt: string;
  
  // Student Info
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
  
  // Subjects & Fee
  subjects: string[]; // Subject codes e.g. ['101', '107']
  subjectNamesBn?: string[];
  officialFee: number;
  platformFee: number;
  totalFee: number;
  
  // Payment Info
  paymentMethod: PaymentMethod;
  paymentSenderPhone: string;
  trxId: string;
  paymentStatus: 'Paid' | 'Reviewing' | 'Unverified' | 'Failed';
  
  // Order Processing Status
  orderStatus: OrderStatus;
  adminNotes?: string;
  
  // Teletalk Auto SMS Commands & Board Replies
  teletalkSmsCommand1?: string; // e.g. RSC DHA 123456 101,107
  boardReply1?: string; // TeleTalk 1st SMS reply received from board
  teletalkPin?: string; // PIN received back
  teletalkSmsCommand2?: string; // e.g. RSC YES 87654321 01712345678
  screenshotUrl?: string;
}

export interface Notice {
  id: string;
  titleBn: string;
  titleEn: string;
  date: string;
  category: 'Official' | 'Update' | 'Guide';
  contentBn: string;
  contentEn: string;
  isImportant?: boolean;
}

export interface FAQItem {
  questionBn: string;
  answerBn: string;
  category: 'General' | 'Payment' | 'Process' | 'Result';
}

export interface CustomerReview {
  id: string;
  name: string;
  board: string;
  rollMasked: string;
  commentBn: string;
  rating: number;
  date: string;
}
