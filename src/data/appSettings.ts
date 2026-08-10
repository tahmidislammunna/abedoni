import { fetchAppSettingsFromSupabase, saveAppSettingsToSupabase } from '../lib/supabase';

export interface ModeratorUser {
  id: string;
  username: string;
  pin: string;
  name: string;
  role: 'moderator' | 'operator' | 'support';
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface AppSettings {
  siteName: string;
  heroHeadline: string;
  heroSubheadline: string;
  bkashNumber: string;
  nagadNumber: string;
  rocketNumber: string;
  banglaQrImageUrl?: string;
  banglaQrAccountInfo?: string;
  officialBoardFee: number;
  abedoniServiceFee: number;
  smsFeePerSubject: number;
  whatsappNumber: string;
  facebookPageUrl?: string;
  officialEmail: string;
  supportHours: string;
  noticeBannerText: string;
  logoIconUrl: string;
  logoWordmarkUrl: string;
  announcementPopupText?: string;
  isMaintenanceMode?: boolean;
  maintenanceLaunchDate?: string;
  maintenanceHeadline?: string;
  maintenanceSubheadline?: string;
  maintenanceNoticeText?: string;
  lastUpdatedText?: string;
  privacyPolicyText?: string;
  termsText?: string;
  refundPolicyText?: string;
  adminPin?: string;
  moderatorUsers?: ModeratorUser[];
  whatsappTemplateStudentToAdmin?: string;
  whatsappTemplateReceived?: string;
  whatsappTemplateProcessing?: string;
  whatsappTemplatePin?: string;
  whatsappTemplateCompleted?: string;
  whatsappTemplateIssue?: string;
}

export const DEFAULT_APP_SETTINGS: AppSettings = {
  siteName: 'আবেদনী (Abedoni)',
  heroHeadline: 'SSC 2026 অনলাইন বোর্ড চ্যালেঞ্জ ও সহায়তা',
  heroSubheadline: 'অনলাইন পোর্টাল এর মাধ্যমে ফলাফল পুনঃনিরীক্ষণের সম্পূর্ণ নিয়ম ফ্রিতে জানুন। নিজে করতে না পারলে আবেদনী-এর সহায়তা সার্ভিস নিয়ে নিশ্চিন্তে আবেদন সম্পন্ন করুন।',
  bkashNumber: '01720990882',
  nagadNumber: '01720990882',
  rocketNumber: '01720990882',
  banglaQrImageUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/c8/%E0%A6%AC%E0%A6%BE%E0%A6%82%E0%A6%B2%E0%A6%BE_%E0%A6%95%E0%A6%BF%E0%A6%89%E0%A6%86%E0%A6%B0.svg',
  banglaQrAccountInfo: 'Account Name: MD. MOSTAKIM HOSSAIN, BRANCH: MOHAMMADPUR Dutch Bangla Bank, (TID - 30167769)',
  officialBoardFee: 175,
  abedoniServiceFee: 49,
  smsFeePerSubject: 0,
  whatsappNumber: '01577777092',
  facebookPageUrl: 'https://facebook.com/abedoni.bd',
  officialEmail: 'abedoni.bd@gmail.com',
  supportHours: 'সকাল ৭:০০ টা - রাত ১১:০০ টা (প্রতিদিন)',
  noticeBannerText: 'SSC Board Challenge 2026 অনলাইন পোর্টাল সেবা • সম্পূর্ণ ফ্রি গাইডলাইন অথবা মাত্র ৳৪৯ সার্ভিস ফি-তে অভিজ্ঞ সাপোর্ট',
  logoIconUrl: 'https://raw.githubusercontent.com/tahmidislammunna/tm/0a4f98323c65fd4013d3a2fd8d66b2e2d750e5d5/favicon-logo-icon.svg',
  logoWordmarkUrl: 'https://raw.githubusercontent.com/tahmidislammunna/tm/refs/heads/main/logo-with-wordmark.jpg',
  announcementPopupText: '',
  isMaintenanceMode: true,
  maintenanceLaunchDate: '2026-08-01T10:00:00',
  maintenanceHeadline: 'SSC Board Challenge 2026',
  maintenanceSubheadline: 'SSC পরীক্ষার ফলাফল প্রকাশের পর পরই আবেদনী (Abedoni) পোর্টালে অনলাইন আবেদন সেবা আনুষ্ঠানিকভাবে উন্মুক্ত করা হবে।',
  maintenanceNoticeText: 'আবেদন পোর্টাল বর্তমানে প্রাক-উদ্বোধন (Pre-Launch) মোডে রয়েছে। ফল প্রকাশের পর পর সঙ্গেই থাকুন।',
  lastUpdatedText: '২৭ জুলাই, ২০২৬ (আজ)',
  adminPin: '1234',
  moderatorUsers: [
    {
      id: 'mod-1',
      username: 'moderator',
      pin: 'mod123',
      name: 'প্রধান মডারেটর (Moderator)',
      role: 'moderator',
      status: 'active',
      createdAt: '2026-01-01'
    }
  ],
  whatsappTemplateStudentToAdmin: `আসসালামু আলাইকুম!

আমি আবেদনের ডিজিটাল ট্র্যাকিং বোর্ডে অর্ডার সম্পন্ন করেছি।

📌 **অর্ডার বিবরণী:**
• **অর্ডার আইডি:** {orderId}
• **শিক্ষার্থীর নাম:** {studentName}
• **রোল নম্বর:** {rollNumber}
• **শিক্ষা বোর্ড:** {boardName}
• **মোট পরিশোধিত ফি:** ৳{totalFee}
• **পেমেন্ট মাধ্যম:** {paymentMethod}
• **ট্রানজেকশন ID:** {trxId}

অনুগ্রহ করে আমার আবেদনটি বোর্ড চ্যালেঞ্জ সিস্টেমের টেলিটক পোর্টালে সাবমিট করে দিন। ধন্যবাদ!`,
  whatsappTemplateReceived: `প্রিয় {studentName}, আবেদনী (Abedoni)-তে আপনার {boardName} বোর্ডের SSC বোর্ড চ্যালেঞ্জ ফি (৳{totalFee}) সফলভাবে প্রাপ্ত হয়েছে। Order ID: {orderId}। ট্র্যাকিং লিংক: {siteUrl}`,
  whatsappTemplateProcessing: `প্রিয় {studentName}, আপনার বোর্ড চ্যালেঞ্জ আবেদনটি (ID: {orderId}, Roll: {rollNumber}) সফলভাবে প্রসেসিংয়ে রয়েছে (Written Processing by Abedoni)। কোনো চিন্তা নেই, খুব দ্রুতই টেলিটকে জমা দেওয়া হবে।`,
  whatsappTemplatePin: `প্রিয় {studentName}, আপনার আবেদনী আবেদনের ১ম ধাপ টেলিটক সার্ভারে সাবমিট করা হয়েছে। TeleTalk PIN: {teletalkPin}। ২য় কনফার্মেশন চূড়ান্ত করা হচ্ছে।`,
  whatsappTemplateCompleted: `অভিনন্দন {studentName}! আপনার SSC বোর্ড চ্যালেঞ্জ আবেদনটি সফলভাবে শিক্ষা বোর্ডে জমা হয়েছে। Order ID: {orderId}। আপনার অনলাইন ডিজিটাল ট্র্যাকিং রসিদ দেখতে ভিজিট করুন: {siteUrl}`,
  whatsappTemplateIssue: `প্রিয় {studentName}, আপনার আবেদনের প্রদানকৃত TrxID ({trxId}) বা পেমেন্ট তথ্যে অসঙ্গতি পাওয়া গেছে। অনুগ্রহ করে সঠিক তথ্যের স্ক্রিনশট পাঠিয়ে আমাদের সাথে যোগাযোগ করুন। Order ID: {orderId}`,
};

const SETTINGS_KEY = 'abedoni_app_settings_v1';

export function getAppSettings(): AppSettings {
  try {
    const cached = localStorage.getItem(SETTINGS_KEY);
    if (cached) {
      return { ...DEFAULT_APP_SETTINGS, ...JSON.parse(cached) };
    }
  } catch (e) {
    console.error('Failed to parse app settings from localStorage', e);
  }
  return DEFAULT_APP_SETTINGS;
}

export function saveAppSettings(newSettings: Partial<AppSettings>): AppSettings {
  const current = getAppSettings();
  const updated = { ...current, ...newSettings };
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save app settings to localStorage', e);
  }

  // Asynchronously save to Supabase Database
  saveAppSettingsToSupabase(newSettings).then((dbUpdated) => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(dbUpdated));
    } catch {}
  }).catch((err) => {
    console.warn('Background Supabase save error:', err);
  });

  return updated;
}

export async function syncAppSettingsWithSupabase(): Promise<AppSettings> {
  try {
    const remoteSettings = await fetchAppSettingsFromSupabase();
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(remoteSettings));
    return remoteSettings;
  } catch (err) {
    return getAppSettings();
  }
}
