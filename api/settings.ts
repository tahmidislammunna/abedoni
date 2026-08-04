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

export interface AppSettings {
  siteName: string;
  heroHeadline: string;
  heroSubheadline: string;
  bkashNumber: string;
  nagadNumber: string;
  rocketNumber: string;
  banglaQrImageUrl?: string;
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
  privacyPolicyText?: string;
  termsText?: string;
  refundPolicyText?: string;
  adminPin?: string;
  whatsappTemplateStudentToAdmin?: string;
  whatsappTemplateReceived?: string;
  whatsappTemplateProcessing?: string;
  whatsappTemplatePin?: string;
  whatsappTemplateCompleted?: string;
  whatsappTemplateIssue?: string;
}

export const DEFAULT_APP_SETTINGS: AppSettings = {
  siteName: 'আবেদনী (Abedoni)',
  heroHeadline: 'আবেদন হোক সহজ',
  heroSubheadline: 'টেলিটক সিমের কোনো ঝামেলা নেই, কম্পিউটারের দোকানে দ্বিগুণ টাকা দেওয়ার প্রয়োজন নেই। আবেদনী-এর মাধ্যমে শতভাগ নিশ্চয়তার সাথে SSC খাতা পুনঃমূল্যায়নের আবেদন করুন।',
  bkashNumber: '01720990882',
  nagadNumber: '01720990882',
  rocketNumber: '01720990882',
  banglaQrImageUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/c8/%E0%A6%AC%E0%A6%BE%E0%A6%82%E0%A6%B2%E0%A6%BE_%E0%A6%95%E0%A6%BF%E0%A6%89%E0%A6%86%E0%A6%B0.svg',
  officialBoardFee: 175,
  abedoniServiceFee: 99,
  smsFeePerSubject: 6,
  whatsappNumber: '01577777092',
  facebookPageUrl: 'https://facebook.com/abedoni.bd',
  officialEmail: 'abedoni.bd@gmail.com',
  supportHours: 'সকাল ৭:০০ টা - রাত ১১:০০ টা (প্রতিদিন)',
  noticeBannerText: 'SSC Board Challenge 2026 আবেদনের পোর্টাল খোলা রয়েছে • টেলিটক সিম ছাড়াই ঘরে বসে ৫ মিনিটে আবেদন করুন',
  logoIconUrl: 'https://raw.githubusercontent.com/tahmidislammunna/tm/0a4f98323c65fd4013d3a2fd8d66b2e2d750e5d5/favicon-logo-icon.svg',
  logoWordmarkUrl: 'https://raw.githubusercontent.com/tahmidislammunna/tm/refs/heads/main/logo-with-wordmark.jpg',
  announcementPopupText: '',
  isMaintenanceMode: false,
  adminPin: '1234',
  whatsappTemplateStudentToAdmin: `আসসালামু আলাইকুম!\n\nআমি আবেদনের ডিজিটাল ট্র্যাকিং বোর্ডে অর্ডার সম্পন্ন করেছি।\n\n📌 **অর্ডার বিবরণী:**\n• **অর্ডার আইডি:** {orderId}\n• **শিক্ষার্থীর নাম:** {studentName}\n• **রোল নম্বর:** {rollNumber}\n• **শিক্ষা বোর্ড:** {boardName}\n• **মোট পরিশোধিত ফি:** ৳{totalFee}\n• **পেমেন্ট মাধ্যম:** {paymentMethod}\n• **ট্রানজেকশন ID:** {trxId}\n\nঅনুগ্রহ করে আমার আবেদনটি বোর্ড চ্যালেঞ্জ সিস্টেমের টেলিটক পোর্টালে সাবমিট করে দিন। ধন্যবাদ!`,
  whatsappTemplateReceived: `প্রিয় {studentName}, আবেদনী (Abedoni)-তে আপনার {boardName} বোর্ডের SSC বোর্ড চ্যালেঞ্জ ফি (৳{totalFee}) সফলভাবে প্রাপ্ত হয়েছে। Order ID: {orderId}। ট্র্যাকিং লিংক: {siteUrl}`,
  whatsappTemplateProcessing: `প্রিয় {studentName}, আপনার বোর্ড চ্যালেঞ্জ আবেদনটি (ID: {orderId}, Roll: {rollNumber}) সফলভাবে প্রসেসিংয়ে রয়েছে (Written Processing by Abedoni)। কোনো চিন্তা নেই, খুব দ্রুতই টেলিটকে জমা দেওয়া হবে।`,
  whatsappTemplatePin: `প্রিয় {studentName}, আপনার আবেদনী আবেদনের ১ম ধাপ টেলিটক সার্ভারে সাবমিট করা হয়েছে। TeleTalk PIN: {teletalkPin}। ২য় কনফার্মেশন চূড়ান্ত করা হচ্ছে।`,
  whatsappTemplateCompleted: `অভিনন্দন {studentName}! আপনার SSC বোর্ড চ্যালেঞ্জ আবেদনটি সফলভাবে শিক্ষা বোর্ডে জমা হয়েছে। Order ID: {orderId}। আপনার অনলাইন ডিজিটাল ট্র্যাকিং রসিদ দেখতে ভিজিট করুন: {siteUrl}`,
  whatsappTemplateIssue: `প্রিয় {studentName}, আপনার আবেদনের প্রদানকৃত TrxID ({trxId}) বা পেমেন্ট তথ্যে অসঙ্গতি পাওয়া গেছে। অনুগ্রহ করে সঠিক তথ্যের স্ক্রিনশট পাঠিয়ে আমাদের সাথে যোগাযোগ করুন। Order ID: {orderId}`,
};

async function fetchAppSettingsFromSupabase(): Promise<AppSettings> {
  try {
    const { data, error } = await supabase
      .from('app_settings')
      .select('settings')
      .eq('id', 'main')
      .maybeSingle();

    if (error) {
      console.warn('Supabase fetchAppSettings warning:', error.message);
      return DEFAULT_APP_SETTINGS;
    }

    if (data && data.settings) {
      return { ...DEFAULT_APP_SETTINGS, ...data.settings };
    }
  } catch (err) {
    console.warn('Failed to fetch app settings from Supabase:', err);
  }
  return DEFAULT_APP_SETTINGS;
}

async function saveAppSettingsToSupabase(newSettings: Partial<AppSettings>): Promise<AppSettings> {
  const current = await fetchAppSettingsFromSupabase();
  const updated = { ...current, ...newSettings };

  try {
    const { error } = await supabase
      .from('app_settings')
      .upsert({ id: 'main', settings: updated, updated_at: new Date().toISOString() });

    if (error) {
      console.error('Supabase saveAppSettings error:', error.message);
    }
  } catch (err) {
    console.error('Failed to save app settings to Supabase:', err);
  }

  return updated;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    try {
      const settings = await fetchAppSettingsFromSupabase();
      return res.status(200).json(settings);
    } catch {
      return res.status(200).json(DEFAULT_APP_SETTINGS);
    }
  }

  if (req.method === 'POST') {
    try {
      const newSettings = req.body;
      const updated = await saveAppSettingsToSupabase(newSettings);
      return res.status(200).json({ success: true, settings: updated });
    } catch {
      return res.status(500).json({ error: 'Failed to update app settings' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
