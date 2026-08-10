import { EducationBoard, SubjectItem } from '../types';

export const BOARDS_LIST: { code: EducationBoard; nameBn: string; nameEn: string; codeSms: string }[] = [
  { code: 'DHA', nameBn: 'ঢাকা বোর্ড (Dhaka)', nameEn: 'Dhaka', codeSms: 'DHA' },
  { code: 'RAJ', nameBn: 'রাজশাহী বোর্ড (Rajshahi)', nameEn: 'Rajshahi', codeSms: 'RAJ' },
  { code: 'COM', nameBn: 'কুমিল্লা বোর্ড (Comilla)', nameEn: 'Comilla', codeSms: 'COM' },
  { code: 'CTG', nameBn: 'চট্টগ্রাম বোর্ড (Chittagong)', nameEn: 'Chittagong', codeSms: 'CTG' },
  { code: 'BAR', nameBn: 'বরিশাল বোর্ড (Barisal)', nameEn: 'Barisal', codeSms: 'BAR' },
  { code: 'SYL', nameBn: 'সিলেট বোর্ড (Sylhet)', nameEn: 'Sylhet', codeSms: 'SYL' },
  { code: 'DIN', nameBn: 'দিনাজপুর বোর্ড (Dinajpur)', nameEn: 'Dinajpur', codeSms: 'DIN' },
  { code: 'MYM', nameBn: 'ময়মনসিংহ বোর্ড (Mymensingh)', nameEn: 'Mymensingh', codeSms: 'MYM' },
  { code: 'JES', nameBn: 'যশোর বোর্ড (Jessore)', nameEn: 'Jessore', codeSms: 'JES' },
  { code: 'MAD', nameBn: 'মাদ্রাসা বোর্ড (Madrasah)', nameEn: 'Madrasah', codeSms: 'MAD' },
  { code: 'TEC', nameBn: 'কারিগরি বোর্ড (Technical)', nameEn: 'Technical', codeSms: 'TEC' },
];

// Standard Board Challenge official fee per subject/paper in BDT (BDT 175)
export const OFFICIAL_FEE_PER_SUBJECT = 175;
export const ABEDONI_PLATFORM_FEE_PER_ORDER = 100;

export const SSC_SUBJECTS: SubjectItem[] = [
  // General
  { code: '101', nameBn: 'বাংলা (Bangla First & Second)', nameEn: 'Bangla (1st & 2nd Paper)', fee: 175, category: 'General' },
  { code: '107', nameBn: 'ইংরেজি (English First & Second)', nameEn: 'English (1st & 2nd Paper)', fee: 175, category: 'General' },
  { code: '109', nameBn: 'গণিত (Mathematics)', nameEn: 'Mathematics', fee: 175, category: 'General' },
  { code: '154', nameBn: 'তথ্য ও যোগাযোগ প্রযুক্তি (ICT)', nameEn: 'ICT', fee: 175, category: 'General' },
  { code: '111', nameBn: 'ইসলাম ও নৈতিক শিক্ষা (Islam)', nameEn: 'Islamic Studies', fee: 175, category: 'General' },
  { code: '112', nameBn: 'হিন্দুধর্ম ও নৈতিক শিক্ষা (Hinduism)', nameEn: 'Hindu Studies', fee: 175, category: 'General' },
  { code: '127', nameBn: 'বিজ্ঞান (General Science)', nameEn: 'General Science', fee: 175, category: 'General' },
  { code: '150', nameBn: 'বাংলাদেশ ও বিশ্বপরিচয় (BGS)', nameEn: 'Bangladesh & Global Studies', fee: 175, category: 'General' },

  // Science
  { code: '136', nameBn: 'পদার্থবিজ্ঞান (Physics)', nameEn: 'Physics', fee: 175, category: 'Science' },
  { code: '137', nameBn: 'রসায়ন (Chemistry)', nameEn: 'Chemistry', fee: 175, category: 'Science' },
  { code: '138', nameBn: 'জীববিজ্ঞান (Biology)', nameEn: 'Biology', fee: 175, category: 'Science' },
  { code: '126', nameBn: 'উচ্চতর গণিত (Higher Mathematics)', nameEn: 'Higher Mathematics', fee: 175, category: 'Science' },

  // Business Studies / Commerce
  { code: '146', nameBn: 'হিসাববিজ্ঞান (Accounting)', nameEn: 'Accounting', fee: 175, category: 'Commerce' },
  { code: '143', nameBn: 'ব্যবসায় উদ্যোগ (Business Ent.)', nameEn: 'Business Entrepreneurship', fee: 175, category: 'Commerce' },
  { code: '152', nameBn: 'ফিন্যান্স ও ব্যাংকিং (Finance & Banking)', nameEn: 'Finance & Banking', fee: 175, category: 'Commerce' },

  // Humanities & Others
  { code: '110', nameBn: 'ভূগোল ও পরিবেশ (Geography)', nameEn: 'Geography & Environment', fee: 175, category: 'Humanities' },
  { code: '153', nameBn: 'বাংলাদেশের ইতিহাস ও বিশ্বসভ্যতা', nameEn: 'History of Bangladesh', fee: 175, category: 'Humanities' },
  { code: '140', nameBn: 'পৌরনীতি ও নাগরিকতা (Civics)', nameEn: 'Civics & Citizenship', fee: 175, category: 'Humanities' },
  { code: '134', nameBn: 'কৃষি শিক্ষা (Agriculture)', nameEn: 'Agriculture Studies', fee: 175, category: 'General' },
  { code: '151', nameBn: 'গার্হস্থ্য বিজ্ঞান (Home Science)', nameEn: 'Home Science', fee: 175, category: 'General' },
];

/**
 * Generate 1st TeleTalk SMS command for board challenge
 * Format: RSC <BOARD_CODE> <ROLL> <SUB_CODES>
 * Example: RSC DHA 123456 101,107
 */
export function generateFirstSmsCommand(board: EducationBoard, roll: string, subjectCodes: string[]): string {
  const boardSmsCode = BOARDS_LIST.find(b => b.code === board)?.codeSms || board;
  const codesStr = subjectCodes.join(',');
  return `RSC ${boardSmsCode} ${roll.trim()} ${codesStr}`;
}

/**
 * Generate 2nd TeleTalk SMS command using PIN
 * Format: RSC YES <PIN> <PHONE>
 * Example: RSC YES 87654321 01712345678
 */
export function generateSecondSmsCommand(pin: string, contactPhone: string): string {
  return `RSC YES ${pin.trim()} ${contactPhone.trim()}`;
}

/**
 * Generate Assistance Request WhatsApp Message for 1-tap WhatsApp consultation CTA
 */
export function generateAssistanceRequestWhatsappMessage(
  phone: string,
  boardName: string,
  subjectNames: string[]
): string {
  const subjectsFormatted = subjectNames.length > 0
    ? subjectNames.map(s => `- ${s}`).join('\n')
    : '- কোনো বিষয় সিলেক্ট করা হয়নি (পরামর্শ প্রয়োজন)';

  const text = `আসসালামু আলাইকুম,
আমি SSC 2026 ফলাফল পুনঃনিরীক্ষণ / Board Challenge সম্পর্কে সহায়তা নিতে চাই।

নাম্বার: ${phone.trim() || 'প্রদান করা হয়নি'}
বোর্ড: ${boardName || 'প্রদান করা হয়নি'}
নির্বাচিত বিষয়:
${subjectsFormatted}

আমি Abedoni-এর অভিজ্ঞ Support Team-এর সহায়তা নিতে চাই।`;

  return encodeURIComponent(text);
}

/**
 * Generate 1-click WhatsApp direct URL
 */
export function getWhatsappDirectUrl(phone: string = '01577777092', textOrEncodedMessage: string = ''): string {
  const cleanPhone = phone.replace(/\D/g, '');
  const phoneWithCountry = cleanPhone.startsWith('88') ? cleanPhone : `88${cleanPhone}`;
  if (!textOrEncodedMessage) {
    return `https://wa.me/${phoneWithCountry}`;
  }
  const isEncoded = textOrEncodedMessage.includes('%');
  const msg = isEncoded ? textOrEncodedMessage : encodeURIComponent(textOrEncodedMessage);
  return `https://wa.me/${phoneWithCountry}?text=${msg}`;
}

/**
 * Helper to replace template placeholder tags like {studentName}, {orderId}, etc.
 */
export function replaceTemplateVars(template: string, vars: Record<string, string | number>): string {
  if (!template) return '';
  let result = template;
  Object.keys(vars).forEach((key) => {
    const val = String(vars[key] ?? '');
    const regex = new RegExp(`\\{${key}\\}`, 'g');
    result = result.replace(regex, val);
  });
  return result;
}

/**
 * Pre-formatted WhatsApp text for student to send to Abedoni Support
 */
export function generateStudentWhatsappMessage(
  order: {
    id: string;
    studentName: string;
    roll: string;
    reg?: string;
    regNumber?: string;
    board: string;
    totalFee: number;
    trxId: string;
    paymentMethod: string;
    subjects?: any;
    subjectNamesBn?: string[];
  },
  customTemplate?: string
): string {
  const subjectsStr = Array.isArray(order.subjectNamesBn) && order.subjectNamesBn.length > 0
    ? order.subjectNamesBn.join(', ')
    : Array.isArray(order.subjects)
      ? order.subjects.map((s: any) => typeof s === 'string' ? s : `${s.name || s.nameBn || ''} (${s.code || ''})`).join(', ')
      : '';

  const vars = {
    orderId: order.id,
    studentName: order.studentName,
    rollNumber: order.roll,
    regNumber: order.reg || order.regNumber || 'N/A',
    boardName: order.board,
    totalFee: order.totalFee,
    paymentMethod: order.paymentMethod,
    trxId: order.trxId,
    subjects: subjectsStr,
    siteUrl: typeof window !== 'undefined' ? window.location.origin : '',
  };

  const templateToUse = customTemplate || `আসসালামু আলাইকুম!

আমি Abedoni অনলাইন সহায়তা পোর্টালে তথ্য প্রদান করেছি।

📌 **শিক্ষার্থী ও আবেদনের বিবরণী:**
• **অর্ডার আইডি:** {orderId}
• **শিক্ষার্থীর নাম:** {studentName}
• **রোল নম্বর:** {rollNumber}
• **রেজি নম্বর:** {regNumber}
• **শিক্ষা বোর্ড:** {boardName}
• **নির্বাচিত বিষয়:** {subjects}
• **পরিশোধিত সার্ভিস ফি:** ৳{totalFee} ({paymentMethod}, TrxID: {trxId})

অনুগ্রহ করে আমার ফলাফল পুনঃনিরীক্ষণ (Board Challenge) আবেদনটি অনলাইন পোর্টালে সম্পন্ন করতে সহায়তা করুন। ধন্যবাদ!`;

  return encodeURIComponent(replaceTemplateVars(templateToUse, vars));
}

/**
 * Official Abedoni Support Contact details & logos
 */
export const SUPPORT_CONFIG = {
  whatsappNumber: '01577777092',
  whatsappDisplay: '+8801577777092',
  facebookPageUrl: 'https://facebook.com/abedoni.bd',
  bkashNumber: '01720990882',
  nagadNumber: '01720990882',
  rocketNumber: '01720990882',
  banglaQrImageUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/c8/%E0%A6%AC%E0%A6%BE%E0%A6%82%E0%A6%B2%E0%A6%BE_%E0%A6%95%E0%A6%BF%E0%A6%89%E0%A6%86%E0%A6%B0.svg',
  banglaQrAccountInfo: 'Account Name: MD. MOSTAKIM HOSSAIN, BRANCH: MOHAMMADPUR Dutch Bangla Bank, (TID - 30167769)',
  supportHours: 'সকাল ৭:০০ টা - রাত ১১:০০ টা (প্রতিদিন)',
  officialEmail: 'abedoni.bd@gmail.com',
  logoIconUrl: 'https://raw.githubusercontent.com/tahmidislammunna/tm/0a4f98323c65fd4013d3a2fd8d66b2e2d750e5d5/favicon-logo-icon.svg',
  logoWordmarkUrl: 'https://raw.githubusercontent.com/tahmidislammunna/tm/refs/heads/main/logo-with-wordmark.jpg',
};

