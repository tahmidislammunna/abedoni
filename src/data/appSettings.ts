export interface AppSettings {
  siteName: string;
  heroHeadline: string;
  heroSubheadline: string;
  bkashNumber: string;
  nagadNumber: string;
  rocketNumber: string;
  officialBoardFee: number;
  abedoniServiceFee: number;
  smsFeePerSubject: number;
  whatsappNumber: string;
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
}

export const DEFAULT_APP_SETTINGS: AppSettings = {
  siteName: 'আবেদনী (Abedoni)',
  heroHeadline: 'আবেদন হোক সহজ',
  heroSubheadline: 'টেলিটক সিমের কোনো ঝামেলা নেই, কম্পিউটারের দোকানে দ্বিগুণ টাকা দেওয়ার প্রয়োজন নেই। আবেদনী-এর মাধ্যমে শতভাগ নিশ্চয়তার সাথে SSC খাতা পুনঃমূল্যায়নের আবেদন করুন।',
  bkashNumber: '01720990882',
  nagadNumber: '01720990882',
  rocketNumber: '01720990882',
  officialBoardFee: 175,
  abedoniServiceFee: 99,
  smsFeePerSubject: 6,
  whatsappNumber: '01577777092',
  officialEmail: 'abedoni.bd@gmail.com',
  supportHours: 'সকাল ৭:০০ টা - রাত ১১:০০ টা (প্রতিদিন)',
  noticeBannerText: 'SSC Board Challenge 2026 আবেদনের পোর্টাল খোলা রয়েছে • টেলিটক সিম ছাড়াই ঘরে বসে ৫ মিনিটে আবেদন করুন',
  logoIconUrl: 'https://munna.pro.bd/tmassets/favicon-logo-icon.svg',
  logoWordmarkUrl: 'https://munna.pro.bd/tmassets/logo-with-wordmark.jpg',
  announcementPopupText: '',
  isMaintenanceMode: false,
  adminPin: '1234',
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
  return updated;
}
