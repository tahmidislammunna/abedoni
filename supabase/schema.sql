-- =======================================================
-- ABEDONI - SUPABASE PRODUCTION DATABASE SCHEMA & SEED DATA
-- Project ID: ybxquqshnghsdosqiqiu
-- =======================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY, -- e.g. ABD-2026-10842
    receipt_id TEXT NOT NULL, -- e.g. RCP-10842
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Student Info
    student_name TEXT NOT NULL,
    father_name TEXT,
    mother_name TEXT,
    roll TEXT NOT NULL,
    reg TEXT NOT NULL,
    board TEXT NOT NULL,
    exam TEXT NOT NULL DEFAULT 'SSC',
    year INT NOT NULL DEFAULT 2026,
    phone TEXT NOT NULL,
    whatsapp TEXT,
    email TEXT,

    -- Subjects & Fee
    subjects JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of subject codes ['101', '107']
    subject_names_bn JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of Bengali subject names
    official_fee NUMERIC(10,2) NOT NULL DEFAULT 0,
    platform_fee NUMERIC(10,2) NOT NULL DEFAULT 99,
    total_fee NUMERIC(10,2) NOT NULL DEFAULT 0,

    -- Payment Info
    payment_method TEXT NOT NULL DEFAULT 'bKash',
    payment_sender_phone TEXT NOT NULL,
    trx_id TEXT NOT NULL,
    payment_status TEXT NOT NULL DEFAULT 'Reviewing', -- 'Paid' | 'Reviewing' | 'Unverified' | 'Failed'

    -- Order Status & Admin Controls
    order_status TEXT NOT NULL DEFAULT 'Pending', -- 'Pending' | 'Payment Verified' | 'Processing' | 'SMS Sent' | 'Completed' | 'Updated' | 'Cancelled'
    admin_notes TEXT,

    -- Teletalk Integration
    teletalk_sms_command1 TEXT,
    board_reply1 TEXT,
    teletalk_pin TEXT,
    teletalk_sms_command2 TEXT,
    screenshot_url TEXT
);

-- Indexes for lightning fast searching
CREATE INDEX IF NOT EXISTS idx_orders_roll ON public.orders(roll);
CREATE INDEX IF NOT EXISTS idx_orders_phone ON public.orders(phone);
CREATE INDEX IF NOT EXISTS idx_orders_trx_id ON public.orders(trx_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_board ON public.orders(board);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

-- 3. APP SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.app_settings (
    id TEXT PRIMARY KEY DEFAULT 'main',
    settings JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. NOTICES TABLE
CREATE TABLE IF NOT EXISTS public.notices (
    id TEXT PRIMARY KEY,
    title_bn TEXT NOT NULL,
    title_en TEXT,
    date TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Official',
    content_bn TEXT NOT NULL,
    content_en TEXT,
    is_important BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. FAQS TABLE
CREATE TABLE IF NOT EXISTS public.faqs (
    id SERIAL PRIMARY KEY,
    question_bn TEXT NOT NULL,
    answer_bn TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'General',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.reviews (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    board TEXT NOT NULL,
    roll_masked TEXT NOT NULL,
    comment_bn TEXT NOT NULL,
    rating INT NOT NULL DEFAULT 5,
    date TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. AUTO-UPDATE UPDATED_AT TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_orders_updated_at ON public.orders;
CREATE TRIGGER set_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_app_settings_updated_at ON public.app_settings;
CREATE TRIGGER set_app_settings_updated_at
    BEFORE UPDATE ON public.app_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 8. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Allow public read/insert/update for standard web app usage
DROP POLICY IF EXISTS "Public access orders" ON public.orders;
CREATE POLICY "Public access orders" ON public.orders FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access app_settings" ON public.app_settings;
CREATE POLICY "Public access app_settings" ON public.app_settings FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access notices" ON public.notices;
CREATE POLICY "Public access notices" ON public.notices FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access faqs" ON public.faqs;
CREATE POLICY "Public access faqs" ON public.faqs FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access reviews" ON public.reviews;
CREATE POLICY "Public access reviews" ON public.reviews FOR ALL USING (true) WITH CHECK (true);

-- 9. INITIAL SEED DATA
INSERT INTO public.app_settings (id, settings)
VALUES (
    'main',
    '{
        "siteName": "আবেদনী (Abedoni)",
        "heroHeadline": "আবেদন হোক সহজ",
        "heroSubheadline": "টেলিটক সিমের কোনো ঝামেলা নেই, কম্পিউটারের দোকানে দ্বিগুণ টাকা দেওয়ার প্রয়োজন নেই। আবেদনী-এর মাধ্যমে শতভাগ নিশ্চয়তার সাথে SSC খাতা পুনঃমূল্যায়নের আবেদন করুন।",
        "bkashNumber": "01720990882",
        "nagadNumber": "01720990882",
        "rocketNumber": "01720990882",
        "officialBoardFee": 175,
        "abedoniServiceFee": 99,
        "smsFeePerSubject": 6,
        "whatsappNumber": "01577777092",
        "facebookPageUrl": "https://facebook.com/abedoni.bd",
        "officialEmail": "abedoni.bd@gmail.com",
        "supportHours": "সকাল ৭:০০ টা - রাত ১১:০০ টা (প্রতিদিন)",
        "noticeBannerText": "SSC Board Challenge 2026 আবেদনের পোর্টাল খোলা রয়েছে • টেলিটক সিম ছাড়াই ঘরে বসে ৫ মিনিটে আবেদন করুন",
        "logoIconUrl": "https://munna.pro.bd/tmassets/favicon-logo-icon.svg",
        "logoWordmarkUrl": "https://munna.pro.bd/tmassets/logo-with-wordmark.jpg",
        "announcementPopupText": "",
        "isMaintenanceMode": false,
        "adminPin": "1234",
        "whatsappTemplateStudentToAdmin": "আসসালামু আলাইকুম!\n\nআমি আবেদনের ডিজিটাল ট্র্যাকিং বোর্ডে অর্ডার সম্পন্ন করেছি।\n\n📌 **অর্ডার বিবরণী:**\n• **অর্ডার আইডি:** {orderId}\n• **শিক্ষার্থীর নাম:** {studentName}\n• **রোল নম্বর:** {rollNumber}\n• **শিক্ষা বোর্ড:** {boardName}\n• **মোট পরিশোধিত ফি:** ৳{totalFee}\n• **পেমেন্ট মাধ্যম:** {paymentMethod}\n• **ট্রানজেকশন ID:** {trxId}\n\nঅনুগ্রহ করে আমার আবেদনটি বোর্ড চ্যালেঞ্জ সিস্টেমের টেলিটক পোর্টালে সাবমিট করে দিন। ধন্যবাদ!",
        "whatsappTemplateReceived": "প্রিয় {studentName}, আবেদনী (Abedoni)-তে আপনার {boardName} বোর্ডের SSC বোর্ড চ্যালেঞ্জ ফি (৳{totalFee}) সফলভাবে প্রাপ্ত হয়েছে। Order ID: {orderId}। ট্র্যাকিং লিংক: {siteUrl}",
        "whatsappTemplateProcessing": "প্রিয় {studentName}, আপনার বোর্ড চ্যালেঞ্জ আবেদনটি (ID: {orderId}, Roll: {rollNumber}) সফলভাবে প্রসেসিংয়ে রয়েছে (Written Processing by Abedoni)। কোনো চিন্তা নেই, খুব দ্রুতই টেলিটকে জমা দেওয়া হবে।",
        "whatsappTemplatePin": "প্রিয় {studentName}, আপনার আবেদনী আবেদনের ১ম ধাপ টেলিটক সার্ভারে সাবমিট করা হয়েছে। TeleTalk PIN: {teletalkPin}। ২য় কনফার্মেশন চূড়ান্ত করা হচ্ছে।",
        "whatsappTemplateCompleted": "অভিনন্দন {studentName}! আপনার SSC বোর্ড চ্যালেঞ্জ আবেদনটি সফলভাবে শিক্ষা বোর্ডে জমা হয়েছে। Order ID: {orderId}। আপনার অনলাইন ডিজিটাল ট্র্যাকিং রসিদ দেখতে ভিজিট করুন: {siteUrl}",
        "whatsappTemplateIssue": "প্রিয় {studentName}, আপনার আবেদনের প্রদানকৃত TrxID ({trxId}) বা পেমেন্ট তথ্যে অসঙ্গতি পাওয়া গেছে। অনুগ্রহ করে সঠিক তথ্যের স্ক্রিনশট পাঠিয়ে আমাদের সাথে যোগাযোগ করুন। Order ID: {orderId}"
    }'::jsonb
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.notices (id, title_bn, title_en, date, category, content_bn, content_en, is_important)
VALUES 
(
    'NOT-001',
    'SSC 2026 বোর্ড চ্যালেঞ্জ আবেদনের সময়সীমা সংক্রান্ত জরুরি বিজ্ঞপ্তি',
    'Urgent Notice Regarding SSC 2026 Board Challenge Application Deadline',
    '২০২৬-০৭-২৪',
    'Official',
    'শিক্ষা বোর্ড সমূহের নির্দেশনা অনুযায়ী আগামী ৩০শে জুলাই রাত ১১:৫৯ মিনিট পর্যন্ত SSC ২০২৬ পরীক্ষার খাতা পুনঃমূল্যায়নের (বোর্ড চ্যালেঞ্জ) আবেদন জমা নেওয়া হবে। আবেদনের কোনো প্রকার বিলম্ব ফি ছাড়াই আমাদের প্ল্যাটফর্মে ঘরে বসে আবেদন করতে পারবেন।',
    'As per Education Board guidelines, SSC 2026 Board Challenge applications will remain open until July 30, 11:59 PM. Submit through Abedoni without delay.',
    true
),
(
    'NOT-002',
    'আবেদনের ডিজিটাল রসিদ ও মেসেজ কনফার্মেশন প্রসেস',
    'Digital Receipt & Message Confirmation Process',
    '২০২৬-০৭-২৩',
    'Guide',
    'আবেদনীতে অর্ডার সাবমিট করার পর প্রতি শিক্ষার্থী একটি ইউনিক Order ID সহ ডিজিটাল রসিদ পাবেন। আমাদের টিম টেলিটক সিম দিয়ে বোর্ডে আবেদন সম্পন্ন করে অফিশিয়াল কনফার্মেশন স্ক্রিনশট আপনাদের দেওয়া হোয়াটসঅ্যাপে পাঠিয়ে দেবে।',
    'Upon order submission on Abedoni, every student gets a digital receipt with a unique Order ID. Our dedicated team handles Teletalk submissions and delivers proof via WhatsApp.',
    false
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.faqs (question_bn, answer_bn, category)
VALUES 
('আমার কাছে টেলিটক (TeleTalk) সিম নেই, আমি কি আবেদনী মাধ্যমে আবেদন করতে পারব?', 'হ্যাঁ, অবশ্যই! আবেদনী প্ল্যাটফর্মের মূল উদ্দেশ্যই হলো আপনার টেলিটক সিমের প্রয়োজন দূর করা। আমাদের নিজস্ব টেলিটক সিমের ডেডিকেটেড প্যানেল দিয়ে আমরাই ৫ মিনিটে আপনার আবেদন সম্পন্ন করে দেব।', 'General'),
('বোর্ড চ্যালেঞ্জ আবেদন করতে মোট কত টাকা খরচ হবে?', 'শিক্ষা বোর্ডের অফিশিয়াল ফি প্রতি বিষয়ের (১ম ও ২য় পত্র মিলিয়ে ১ বিষয়) জন্য ১২৫ টাকা। আবেদনী প্ল্যাটফর্মের সার্ভিস চার্জ প্রতি অর্ডারে মাত্র ৮০ টাকা। উদাহরণস্বরূপ: ১টি বিষয়ের মোট খরচ ১২৫ + ৮০ = ২০৫ টাকা।', 'Payment'),
('আমি কীভাবে নিশ্চিত হব যে আমার আবেদনটি সত্যিই বোর্ডে জমা হয়েছে?', 'আবেদন সফল হওয়ার পরপরই অফিশিয়াল টেলিটক এসএমএস কনফার্মেশন বার্তা এবং স্ক্রিনশট আমরা সরাসরি আপনার হোয়াটসঅ্যাপ নম্বরে পাঠিয়ে দিই। তাছাড়া ওয়েবসাইটে Order ID দিয়ে যেকোনো সময় লাইভ ট্র্যাকিং করতে পারবেন।', 'Process'),
('টাকা পেমেন্ট করার পর আমাকে কী করতে হবে?', 'বিকাশ, নগদ বা রকেটে পেমেন্ট করার পর ট্রানজেকশন ID দিয়ে ফরম ফিলআপ সাবমিট করুন। পেমেন্ট পাওয়ার পর ১-ক্লিকে "WhatsApp-এ পাঠান" বাটনে চাপ দিলে আপনার যাবতীয় তথ্য আমাদের সাপোর্ট টিমে পৌঁছে যাবে।', 'Payment'),
('আবেদনের ফলাফল (Result) কখন এবং কোথায় প্রকাশিত হবে?', 'সাধারণত আবেদনের সময়সীমা শেষ হওয়ার ২০ থেকে ৩০ দিনের মধ্যে শিক্ষা বোর্ডের অফিশিয়াল ওয়েবসাইটে পুনঃমূল্যায়নের ফলাফল প্রকাশিত হয়। ফল প্রকাশের সাথে সাথে আমরা আপনার নিবন্ধিত মোবাইল নম্বরে SMS মারফত জানিয়ে দেব।', 'Result')
ON CONFLICT DO NOTHING;

INSERT INTO public.reviews (id, name, board, roll_masked, comment_bn, rating, date)
VALUES 
('REV-1', 'তানজিলা রহমান', 'ঢাকা বোর্ড', '142***', 'কম্পিউটারের দোকানে গিয়ে ৩০০ টাকা অতিরিক্ত চাওয়া হয়েছিল। আবেদনীতে ঘরে বসে মাত্র ৮০ টাকা সার্ভিস চার্জে ৫ মিনিটে ডিজিটাল রসিদ ও হোয়াটসঅ্যাপে সাবমিশন প্রুফ পেয়ে গেলাম!', 5, '২০২৬-০৭-২৩'),
('REV-2', 'রাকিবুল হাসান', 'কুমিল্লা বোর্ড', '581***', 'আমার কাছে টেলিটক সিম ছিল না। রাতে ভেবেছিলাম দোকান খুললে যাব। রাতে আবেদনী থেকে আবেদন করে ঘুমিয়ে গেছি, সকালে দেখি হোয়াটসঅ্যাপে টেলিটকের কনফার্মেশন মেসেজের ছবি পাঠানো হয়েছে! সেরা সার্ভিস।', 5, '২০২৬-০৭-২২'),
('REV-3', 'মোহাম্মদ আবদুল্লাহ', 'চট্টগ্রাম বোর্ড', '239***', '১০০% বিশ্বস্ত। রসিদ সাথে সাথে ডাউনলোড করতে পেরেছি এবং প্রসেসিং লাইভ ট্র্যাক করা গেছে।', 5, '২০২৬-০৭-২১')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.orders (
    id, receipt_id, created_at, updated_at, student_name, father_name, mother_name,
    roll, reg, board, exam, year, phone, whatsapp, email, subjects, subject_names_bn,
    official_fee, platform_fee, total_fee, payment_method, payment_sender_phone,
    trx_id, payment_status, order_status, teletalk_sms_command1, teletalk_pin,
    teletalk_sms_command2, admin_notes
)
VALUES
(
    'ABD-2026-10842', 'RCP-10842', '2026-07-24T08:30:00Z', '2026-07-24T09:15:00Z',
    'তানভীর আহমেদ মাহিন', 'রফিকুল ইসলাম', 'শাহানাজ বেগম', '142850', '1912408392',
    'DHA', 'SSC', 2026, '01712345678', '01712345678', 'tanvir.mahin@gmail.com',
    '["101", "107"]'::jsonb, '["বাংলা (Bangla First & Second)", "ইংরেজি (English First & Second)"]'::jsonb,
    350, 100, 450, 'bKash', '01712345678', '9K4M2L8PQ', 'Paid', 'SMS Sent',
    'RSC DHA 142850 101,107', '84920153', 'RSC YES 84920153 01712345678', 'TeleTalk SMS 1 & 2 sent successfully.'
),
(
    'ABD-2026-10843', 'RCP-10843', '2026-07-24T09:00:00Z', '2026-07-24T09:40:00Z',
    'নুসরাত জাহান মিম', 'মোজাফফর হোসেন', NULL, '239841', '2019482910',
    'CTG', 'SSC', 2026, '01898765432', '01898765432', NULL,
    '["109", "136"]'::jsonb, '["গণিত (Mathematics)", "পদার্থবিজ্ঞান (Physics)"]'::jsonb,
    350, 100, 450, 'Nagad', '01898765432', 'NGD882194A', 'Paid', 'Completed',
    'RSC CTG 239841 109,136', '91823746', 'RSC YES 91823746 01898765432', 'Completed & Confirmation screenshot sent via WhatsApp.'
)
ON CONFLICT (id) DO NOTHING;
