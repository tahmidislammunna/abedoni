import { EducationBoard, SubjectItem } from './types';

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

export function generateFirstSmsCommand(board: EducationBoard, roll: string, subjectCodes: string[]): string {
  const boardSmsCode = BOARDS_LIST.find(b => b.code === board)?.codeSms || board;
  const codesStr = subjectCodes.join(',');
  return `RSC ${boardSmsCode} ${roll.trim()} ${codesStr}`;
}

export function generateSecondSmsCommand(pin: string, contactPhone: string): string {
  return `RSC YES ${pin.trim()} ${contactPhone.trim()}`;
}
