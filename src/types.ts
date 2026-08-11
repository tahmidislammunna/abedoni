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
  id: string; // e.g. ABD-2026-10492
  receiptId: string; // e.g. RCP-10492
  createdAt: string;
  updatedAt: string;
  
  // Lead / Order Finalized Flag
  isFinalized?: boolean;

  // Student Info
  studentName: string;
  fatherName?: string;
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
  paymentStatus: 'Paid' | 'Reviewing' | 'Unverified' | 'Failed' | 'Pending';
  
  // Order Processing Status
  orderStatus: OrderStatus;
  adminNotes?: string;
  
  // Optional Legacy / Screenshot fields
  teletalkSmsCommand1?: string;
  boardReply1?: string;
  teletalkPin?: string;
  teletalkSmsCommand2?: string;
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
