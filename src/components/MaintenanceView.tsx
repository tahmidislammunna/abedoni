import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Clock, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  HelpCircle, 
  MessageSquare, 
  ExternalLink, 
  AlertTriangle, 
  Zap, 
  Smartphone, 
  Home, 
  Lock, 
  FileText, 
  ChevronDown,
  ChevronUp,
  GraduationCap,
  Heart,
  Calendar,
  RefreshCw,
  Award,
  Check,
  Info,
  BookOpen,
  Bell,
  Users,
  CheckCircle,
  Shield,
  Star
} from 'lucide-react';
import { AppSettings } from '../data/appSettings';

interface MaintenanceViewProps {
  settings: AppSettings;
  onOpenAdminAuth?: () => void;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}

export const MaintenanceView: React.FC<MaintenanceViewProps> = ({
  settings
}) => {
  const launchDateStr = settings.maintenanceLaunchDate || '2026-08-01T10:00:00';
  const headline = settings.maintenanceHeadline || 'SSC Board Challenge 2026';
  const subheadline = settings.maintenanceSubheadline || 'SSC পরীক্ষার ফলাফল প্রকাশের পর পরই আবেদনী (Abedoni) পোর্টালে অনলাইন আবেদন প্রসেসিং সেবা আনুষ্ঠানিকভাবে উন্মুক্ত করা হবে।';
  const noticeText = settings.maintenanceNoticeText || 'আবেদন পোর্টাল বর্তমানে প্রাক-উদ্বোধন (Pre-Launch) মোডে রয়েছে। ফল প্রকাশের পরই অনলাইন আবেদন নেওয়া শুরু হবে।';
  const lastUpdatedText = settings.lastUpdatedText || '২৭ জুলাই, ২০২৬ (আজ)';

  // Calculate countdown time
  const calculateTimeLeft = (): TimeLeft => {
    const target = new Date(launchDateStr).getTime();
    const now = new Date().getTime();
    const difference = target - now;

    if (difference <= 0 || isNaN(difference)) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
      isExpired: false
    };
  };

  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  useEffect(() => {
    // Set document title for SEO
    document.title = `${headline} - প্রাক-উদ্বোধন (Pre-Launch) | আবেদনী (Abedoni)`;

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [launchDateStr, headline]);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const faqs = [
    {
      q: 'বোর্ড চ্যালেঞ্জ বা খাতা পুনঃমূল্যায়ন আবেদন কবে শুরু হবে?',
      a: 'শিক্ষা বোর্ড সমূহের প্রচলিত নিয়ম অনুযায়ী, SSC পরীক্ষার অফিশিয়াল ফলাফল প্রকাশের ঠিক পরের দিন থেকেই বোর্ড চ্যালেঞ্জের অনলাইন আবেদন কার্যক্রম শুরু হয়। নির্দিষ্ট সময়সীমা বোর্ডের অফিশিয়াল বিজ্ঞপ্তির মাধ্যমে জানিয়ে দেওয়া হয়।'
    },
    {
      q: 'আবেদনী (Abedoni) পোর্টালে কীভাবে সহজে আবেদন করা যাবে?',
      a: 'আমাদের পোর্টালে আবেদন করার প্রক্রিয়া অত্যন্ত সহজ ও দ্রুত। আপনাকে শুধু আপনার শিক্ষা বোর্ড, রোল নম্বর, রেজিস্ট্রেশন নম্বর এবং বিষয় কোড নির্বাচন করতে হবে। এরপর বিকাশ, নগদ বা রকেট অ্যাকাউন্ট থেকে নির্ধারিত ফি জমা দিলেই ডিজিটাল রসিদ পাওয়া যাবে।'
    },
    {
      q: 'আমার কি নিজস্ব টেলিটক (Teletalk) সিমের প্রয়োজন আছে?',
      a: 'একদমই না! আবেদনী প্ল্যাটফর্মের সবচেয়ে বড় সুবিধা হলো—আপনার নিজস্ব কোনো টেলিটক সিম, বিশেষ মেসেজ ফরম্যাট বা SMS ব্যালেন্সের প্রয়োজন নেই। আমাদের সেন্ট্রাল প্রসেসিং সিস্টেমের সাহায্যে আপনার আবেদন সরাসরি শিক্ষা বোর্ডের সার্ভারে জমা করা হয়।'
    },
    {
      q: 'বোর্ড চ্যালেঞ্জে আবেদনের মোট কত ফি লাগবে?',
      a: 'শিক্ষা বোর্ডের অফিশিয়াল সার্কুলার প্রকাশিত হওয়ার পর আবেদনের নির্ধারিত ফি ও চার্জ সংক্রান্ত বিস্তারিত তথ্য পোর্টালে জানিয়ে দেওয়া হবে।'
    },
    {
      q: 'খাতা পুনর্নিরীক্ষণ বা মূল্যায়ন কীভাবে পরিচালিত হয়?',
      a: 'শিক্ষা বোর্ড সমূহের খাতা পুনর্নিরীক্ষণ (বোর্ড চ্যালেঞ্জ) প্রক্রিয়া সংশ্লিষ্ট শিক্ষা বোর্ড কর্তৃক ঘোষিত নীতিমালা ও নিয়মাবলি মেনে পরিচালিত হয়। চলতি পরীক্ষার বছরের জন্য নির্ধারিত অফিশিয়াল নীতি অনুযায়ী বোর্ড কর্তৃপক্ষ খাতার পুনঃমূল্যায়ন কার্যক্রম সম্পন্ন করে থাকে।'
    },
    {
      q: 'আবেদনী কি কোনো সরকারি বা শিক্ষা বোর্ডের অফিশিয়াল ওয়েবসাইট?',
      a: 'না। আবেদনী (Abedoni) একটি সম্পূর্ণ স্বাধীন ডিজিটাল আবেদন সহায়তাকারী প্ল্যাটফর্ম। আমরা কোনো সরকারি বিভাগ বা শিক্ষা বোর্ডের অফিসিয়াল অঙ্গপ্রতিষ্ঠান নই। আমরা শিক্ষার্থীদের তথ্য গ্রহণ করে কারিগরি উপায়ে তাদের ডিজিটাল আবেদন প্রক্রিয়ায় সহায়তা প্রদান করি।'
    }
  ];

  return (
    <div className="min-h-screen text-slate-800 font-bn relative overflow-hidden pb-12 selection:bg-blue-200 selection:text-blue-900 bg-gradient-to-b from-slate-50 via-white to-blue-50/40">
      
      {/* Dynamic Background Mesh Radial Glow Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[720px] bg-gradient-to-b from-blue-500/12 via-indigo-500/8 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-20 right-10 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-40 left-10 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            HERO SECTION (SAAS QUALITY FIRST SCREEN)
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section className="min-h-[calc(100vh-2rem)] lg:min-h-[88vh] flex flex-col justify-center pt-4 sm:pt-8 pb-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            
            {/* LEFT COLUMN: HERO CONTENT & COUNTDOWN TIMER */}
            <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
              
              {/* Logo & Status Badge Header */}
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5"
              >
                <div className="flex items-center gap-2 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-200/90 shadow-xs">
                  <img 
                    src={settings.logoIconUrl || "https://raw.githubusercontent.com/tahmidislammunna/tm/0a4f98323c65fd4013d3a2fd8d66b2e2d750e5d5/favicon-logo-icon.svg"} 
                    alt="Abedoni Logo" 
                    className="w-5 h-5 object-contain"
                  />
                  <span className="font-extrabold text-slate-900 text-xs sm:text-sm">আবেদনী (Abedoni)</span>
                </div>

                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-900 text-xs font-bold shadow-xs backdrop-blur-md">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                  </span>
                  <span className="tracking-wide">প্রাক-উদ্বোধন (Pre-Launch)</span>
                </div>
              </motion.div>

              {/* Main Headline */}
              <motion.h1 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black text-slate-900 tracking-tight leading-[1.12]"
              >
                {headline}
              </motion.h1>

              {/* Subtitle Directly Underneath Heading */}
              <motion.div 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="space-y-0.5"
              >
                <p className="text-blue-700 font-black text-xs sm:text-base lg:text-lg tracking-wider uppercase flex items-center justify-center lg:justify-start gap-2">
                  <Clock className="w-4 h-4 text-blue-600 animate-spin shrink-0" style={{ animationDuration: '9s' }} />
                  <span>Expected Application Opening Time</span>
                </p>
                <p className="text-xs sm:text-sm text-slate-500 font-semibold">
                  আবেদন উন্মুক্ত হওয়ার সম্ভাব্য সময়সীমা
                </p>
              </motion.div>

              {/* Subheadline Text */}
              <motion.p 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-xs sm:text-sm lg:text-base text-slate-600 font-medium leading-relaxed max-w-xl mx-auto lg:mx-0"
              >
                {subheadline}
              </motion.p>

              {/* GLASSMORPHISM COUNTDOWN TIMER (VISUAL CENTERPIECE ABOVE THE FOLD) */}
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.25 }}
                className="bg-white/85 backdrop-blur-2xl border border-blue-200/90 rounded-3xl p-4 sm:p-6 shadow-xl shadow-blue-900/10 text-center lg:text-left relative overflow-hidden ring-1 ring-blue-500/10"
              >
                {/* Top Gradient Accent Line */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-500 to-amber-500" />

                <div className="space-y-3.5">
                  {timeLeft.isExpired ? (
                    <div className="bg-emerald-50 border border-emerald-300 p-5 rounded-2xl text-emerald-950 font-black text-base sm:text-xl animate-pulse shadow-xs flex flex-col items-center justify-center gap-2 text-center">
                      <Sparkles className="w-7 h-7 text-emerald-600" />
                      <span>🎉 ফলাফল প্রকাশিত হয়েছে! অনলাইন আবেদন প্রসেস চালু হচ্ছে...</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5">
                      {/* Days Card */}
                      <motion.div 
                        whileHover={{ y: -2 }}
                        className="bg-gradient-to-b from-blue-50/90 to-indigo-50/70 border border-blue-200/90 rounded-2xl p-3 sm:p-4 text-center relative overflow-hidden"
                      >
                        <div className="text-2xl sm:text-4xl font-black text-blue-900 font-mono tracking-tight drop-shadow-xs">
                          {String(timeLeft.days).padStart(2, '0')}
                        </div>
                        <div className="text-[10px] sm:text-xs font-extrabold text-blue-700 mt-1 tracking-wide uppercase">
                          দিন (Days)
                        </div>
                      </motion.div>

                      {/* Hours Card */}
                      <motion.div 
                        whileHover={{ y: -2 }}
                        className="bg-gradient-to-b from-indigo-50/90 to-blue-50/70 border border-indigo-200/90 rounded-2xl p-3 sm:p-4 text-center relative overflow-hidden"
                      >
                        <div className="text-2xl sm:text-4xl font-black text-indigo-900 font-mono tracking-tight drop-shadow-xs">
                          {String(timeLeft.hours).padStart(2, '0')}
                        </div>
                        <div className="text-[10px] sm:text-xs font-extrabold text-indigo-700 mt-1 tracking-wide uppercase">
                          ঘণ্টা (Hours)
                        </div>
                      </motion.div>

                      {/* Minutes Card */}
                      <motion.div 
                        whileHover={{ y: -2 }}
                        className="bg-gradient-to-b from-emerald-50/90 to-teal-50/70 border border-emerald-200/90 rounded-2xl p-3 sm:p-4 text-center relative overflow-hidden"
                      >
                        <div className="text-2xl sm:text-4xl font-black text-emerald-900 font-mono tracking-tight drop-shadow-xs">
                          {String(timeLeft.minutes).padStart(2, '0')}
                        </div>
                        <div className="text-[10px] sm:text-xs font-extrabold text-emerald-700 mt-1 tracking-wide uppercase">
                          মিনিট (Minutes)
                        </div>
                      </motion.div>

                      {/* Seconds Card */}
                      <motion.div 
                        whileHover={{ y: -2 }}
                        className="bg-gradient-to-b from-amber-50/90 to-orange-50/70 border border-amber-200/90 rounded-2xl p-3 sm:p-4 text-center relative overflow-hidden"
                      >
                        <div className="text-2xl sm:text-4xl font-black text-amber-900 font-mono tracking-tight drop-shadow-xs animate-pulse">
                          {String(timeLeft.seconds).padStart(2, '0')}
                        </div>
                        <div className="text-[10px] sm:text-xs font-extrabold text-amber-700 mt-1 tracking-wide uppercase">
                          সেকেন্ড (Seconds)
                        </div>
                      </motion.div>
                    </div>
                  )}

                  <div className="bg-slate-100/90 border border-slate-200/90 p-2.5 rounded-xl flex items-center gap-2 text-xs text-slate-700 font-semibold leading-relaxed">
                    <Bell className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>{noticeText}</span>
                  </div>
                </div>
              </motion.div>

              {/* Minimal Trust Badges */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.35 }}
                className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-1 text-xs text-slate-600 font-bold"
              >
                <div className="flex items-center gap-1.5 bg-white/80 px-3 py-1 rounded-full border border-slate-200 shadow-2xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Trusted Digital Platform</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/80 px-3 py-1 rounded-full border border-slate-200 shadow-2xs">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span>Fast Online Process</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/80 px-3 py-1 rounded-full border border-slate-200 shadow-2xs">
                  <Lock className="w-4 h-4 text-blue-600" />
                  <span>Encrypted Data</span>
                </div>
              </motion.div>

            </div>

            {/* RIGHT COLUMN: FLOATING PRODUCT SHOWCASE MOCKUPS */}
            <div className="lg:col-span-5 relative flex items-center justify-center pt-4 lg:pt-0">
              <div className="relative w-full max-w-md lg:max-w-none aspect-[16/11] sm:aspect-[4/3] lg:aspect-square flex items-center justify-center">
                
                {/* Soft Radial Ambient Glow */}
                <div className="absolute w-72 h-72 sm:w-80 sm:h-80 bg-gradient-to-tr from-blue-400/25 via-indigo-400/20 to-amber-300/25 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse" style={{ animationDuration: '6s' }} />

                {/* CENTER / LARGEST CARD (Main Web Application Screenshot) */}
                <motion.div 
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                  className="w-[88%] sm:w-[84%] bg-white rounded-2xl sm:rounded-3xl p-1.5 sm:p-2 border border-slate-200/90 shadow-2xl shadow-blue-900/15 relative z-10 overflow-hidden ring-1 ring-slate-900/5"
                >
                  {/* Subtle Web Window Top Bar */}
                  <div className="bg-slate-100/90 px-3 py-1.5 rounded-t-xl flex items-center justify-between border-b border-slate-200/70 mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-400 inline-block" />
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 font-semibold bg-white px-2 py-0.5 rounded-md border border-slate-200/60">
                      abedoni.com • Portal App
                    </span>
                    <span className="w-3" />
                  </div>

                  <img 
                    src="https://raw.githubusercontent.com/tahmidislammunna/tm/refs/heads/main/mainwebapp%20panel.jpeg" 
                    alt="Abedoni Main Application Portal" 
                    className="w-full h-auto rounded-xl object-cover shadow-xs"
                  />
                </motion.div>

                {/* UPPER RIGHT CARD (Student Review Screenshot) */}
                <motion.div 
                  animate={{ y: [0, 10, 0], rotate: [0.5, -1, 0.5] }}
                  transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                  className="absolute -top-2 sm:-top-4 -right-1 sm:-right-3 w-[54%] sm:w-[50%] bg-white/95 backdrop-blur-md rounded-2xl p-1.5 sm:p-2 border border-white/80 shadow-xl shadow-slate-900/15 z-20"
                >
                  <div className="bg-blue-600 text-white text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 mb-1 shadow-2xs">
                    <Star className="w-3 h-3 text-amber-300 fill-amber-300" />
                    <span>Verified Review</span>
                  </div>
                  <img 
                    src="https://raw.githubusercontent.com/tahmidislammunna/tm/refs/heads/main/student%20review.png" 
                    alt="Student Review" 
                    className="w-full h-auto rounded-xl object-cover border border-slate-100"
                  />
                </motion.div>

                {/* LOWER LEFT CARD (Local Shop vs Abedoni Comparison) */}
                <motion.div 
                  animate={{ y: [0, -10, 0], rotate: [-0.5, 1, -0.5] }}
                  transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                  className="absolute -bottom-3 sm:-bottom-6 -left-1 sm:-left-3 w-[58%] sm:w-[54%] bg-white/95 backdrop-blur-md rounded-2xl p-1.5 sm:p-2 border border-white/80 shadow-xl shadow-slate-900/15 z-20"
                >
                  <div className="bg-slate-900 text-amber-300 text-[9px] sm:text-[10px] font-extrabold px-2 py-0.5 rounded-full inline-flex items-center gap-1 mb-1 shadow-2xs">
                    <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span>Shop vs Abedoni</span>
                  </div>
                  <img 
                    src="https://raw.githubusercontent.com/tahmidislammunna/tm/refs/heads/main/differencebetweenlocalvsabedoniteam.png" 
                    alt="Local Shop vs Abedoni Comparison" 
                    className="w-full h-auto rounded-xl object-cover border border-slate-100"
                  />
                </motion.div>

                {/* FLOATING MICRO UI BADGES */}
                <motion.div 
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -bottom-1 right-2 z-30 bg-emerald-500 text-white font-extrabold text-[10px] sm:text-xs px-3 py-1.5 rounded-full shadow-lg border border-emerald-400 flex items-center gap-1.5"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Automated System</span>
                </motion.div>

              </div>
            </div>

          </div>
        </section>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            EVERYTHING BELOW REMAINS EXACTLY AS INTENDED
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}

        {/* LIVE DYNAMIC STATUS DASHBOARD CARD */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-white/90 backdrop-blur-xl border border-slate-200/90 p-5 sm:p-7 rounded-3xl shadow-md space-y-3.5"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-slate-900 text-sm sm:text-base flex items-center gap-2">
              <ActivityIndicator />
              <span>লাইভ পোর্টাল ও সার্ভিস স্ট্যাটাস (Live Portal Dashboard)</span>
            </h3>
            <span className="text-[10px] sm:text-xs font-mono font-bold bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full border border-slate-200">
              স্বয়ংক্রিয় মনিটরিং
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-0.5">
            
            {/* Item 1: Website Status */}
            <div className="bg-slate-50/90 p-3.5 rounded-2xl border border-slate-200/80 space-y-1">
              <div className="text-[11px] text-slate-500 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
                <span>Website Status:</span>
              </div>
              <p className="font-extrabold text-slate-900 text-xs sm:text-sm flex items-center gap-1">
                <span className="text-emerald-600">🟢</span>
                <span>Pre-Launch Ready</span>
              </p>
              <p className="text-[10px] text-slate-500 font-medium">পোর্টালে চূড়ান্ত প্রস্তুতি চলমান</p>
            </div>

            {/* Item 2: Application Opening */}
            <div className="bg-slate-50/90 p-3.5 rounded-2xl border border-slate-200/80 space-y-1">
              <div className="text-[11px] text-slate-500 font-bold flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>Application Opening:</span>
              </div>
              <p className="font-extrabold text-slate-900 text-xs sm:text-sm flex items-center gap-1">
                <span className="text-blue-600">📅</span>
                <span>Opens after SSC Result</span>
              </p>
              <p className="text-[10px] text-slate-500 font-medium">ফলাফল ঘোষণার পর ২৪ ঘণ্টায় চালু</p>
            </div>

            {/* Item 3: System Status */}
            <div className="bg-slate-50/90 p-3.5 rounded-2xl border border-slate-200/80 space-y-1">
              <div className="text-[11px] text-slate-500 font-bold flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span>System Status:</span>
              </div>
              <p className="font-extrabold text-slate-900 text-xs sm:text-sm flex items-center gap-1">
                <span className="text-emerald-600">⚡</span>
                <span>Systems Operational</span>
              </p>
              <p className="text-[10px] text-slate-500 font-medium">সার্ভার ও এপিআই প্রস্তুত</p>
            </div>

            {/* Item 4: Dynamic Last Updated */}
            <div className="bg-slate-50/90 p-3.5 rounded-2xl border border-slate-200/80 space-y-1">
              <div className="text-[11px] text-slate-500 font-bold flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Last Updated:</span>
              </div>
              <p className="font-extrabold text-slate-900 text-xs sm:text-sm truncate">
                {lastUpdatedText}
              </p>
              <p className="text-[10px] text-slate-500 font-medium">লাইভ অ্যাডমিন আপডেট</p>
            </div>

          </div>
        </motion.div>

        {/* NON-AFFILIATION DISCLAIMER BANNER */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="bg-amber-50/90 border border-amber-200/90 p-4 sm:p-6 rounded-3xl text-amber-950 text-xs sm:text-sm leading-relaxed space-y-1.5 shadow-xs"
        >
          <div className="flex items-center gap-2 font-black text-amber-900 text-xs sm:text-sm">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>আইনি স্বাতন্ত্র্য বার্তা ও সতর্কীকরণ ঘোষণা (Non-Affiliation Notice):</span>
          </div>
          <p className="text-amber-950/90 leading-relaxed font-medium">
            আবেদনী (Abedoni) একটি সম্পূর্ণ স্বাধীন ডিজিটাল আবেদন সহায়তাকারী অনলাইন প্ল্যাটফর্ম। আমরা বাংলাদেশ সরকার, শিক্ষা মন্ত্রণালয়, মাধ্যমিক ও উচ্চমাধ্যমিক শিক্ষা বোর্ড কিংবা টেলিটক বাংলাদেশ লিমিটেডের অনুমোদিত বা অফিসিয়াল কোনো অঙ্গপ্রতিষ্ঠান নই।
          </p>
        </motion.div>

        {/* EDUCATIONAL & GUIDANCE SECTION */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <div className="text-center space-y-1.5">
            <span className="bg-blue-100 text-blue-900 text-[11px] font-extrabold px-3 py-1 rounded-full border border-blue-200/80">
              জরুরি সাধারণ দিকনির্দেশনা
            </span>
            <h2 className="text-xl sm:text-3xl font-black text-slate-900">
              বোর্ড চ্যালেঞ্জ বা খাতা পুনর্নিরীক্ষণ নির্দেশিকা
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
              SSC পরীক্ষার ফলাফল প্রকাশের পর যেসকল শিক্ষার্থী তাদের ফলাফলে পুনঃমূল্যায়ন চান, তাদের জন্য প্রয়োজনীয় নির্দেশনাবলী।
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Who Should Apply */}
            <div className="bg-emerald-50/90 border border-emerald-200/90 rounded-3xl p-5 sm:p-7 space-y-3 shadow-xs">
              <div className="flex items-center gap-2.5 text-emerald-900 font-black text-base sm:text-lg border-b border-emerald-200/80 pb-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <h3>কাদের আবেদন করা সুবিধাজনক?</h3>
              </div>
              <ul className="space-y-2.5 text-xs sm:text-sm text-emerald-950 font-medium leading-relaxed">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>যাদের প্রাপ্ত নম্বর ও পরীক্ষার প্রত্যাশার মাঝে সুস্পষ্ট গরমিল অনুভব করেন।</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>অন্যান্য সব বিষয়ে কাঙ্ক্ষিত ফলাফল পাওয়া সত্ত্বেও কোনো নির্দিষ্ট বিষয়ে অপ্রত্যাশিত ফলাফল আসলে।</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>ফলাফলের সুনির্দিষ্ট পর্যালোচনার প্রয়োজন মনে করলে নির্ধারিত সময়ের মধ্যে আবেদন করা যেতে পারে।</span>
                </li>
              </ul>
            </div>

            {/* Important Reminders */}
            <div className="bg-rose-50/90 border border-rose-200/90 rounded-3xl p-5 sm:p-7 space-y-3 shadow-xs">
              <div className="flex items-center gap-2.5 text-rose-900 font-black text-base sm:text-lg border-b border-rose-200/80 pb-2.5">
                <Info className="w-5 h-5 text-rose-600 shrink-0" />
                <h3>গুরুত্বপূর্ণ লক্ষণীয় বিষয়সমূহ</h3>
              </div>
              <ul className="space-y-2.5 text-xs sm:text-sm text-rose-950 font-medium leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-rose-600 font-bold">•</span>
                  <span>অযথা বা পর্যাপ্ত ভিত্তি ছাড়া আবেদন না করার পরামর্শ দেওয়া হচ্ছে।</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-600 font-bold">•</span>
                  <span>শিক্ষা বোর্ড কর্তৃক নির্ধারিত অফিশিয়াল নোটিশ ও সময়সীমা ভালোভাবে পড়ে আবেদন করুন।</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-600 font-bold">•</span>
                  <span>বোর্ড চ্যালেঞ্জের ফলাফল শিক্ষা বোর্ডের অফিশিয়াল নিয়ম অনুযায়ী পুনঃপ্রকাশিত হবে।</span>
                </li>
              </ul>
            </div>

          </div>

          {/* NEUTRAL & ACCURATE BOARD EVALUATION STATEMENT */}
          <div className="bg-slate-100/90 border border-slate-200 p-5 sm:p-6 rounded-3xl space-y-1.5 text-slate-800 text-xs sm:text-sm leading-relaxed">
            <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
              <span>শিক্ষা বোর্ডের অফিশিয়াল খাতা পুনঃমূল্যায়ন পদ্ধতি সম্পর্কিত তথ্য:</span>
            </h4>
            <p className="text-slate-700 leading-relaxed font-medium">
              শিক্ষা বোর্ড সমূহের খাতা পুনর্নিরীক্ষণ (বোর্ড চ্যালেঞ্জ) প্রক্রিয়া সংশ্লিষ্ট শিক্ষা বোর্ড কর্তৃক ঘোষিত নির্দেশিকা ও নীতিমালা অনুযায়ী পরিচালিত হয়। চলতি পরীক্ষার বছরের জন্য প্রযোজ্য অফিশিয়াল নীতি অনুযায়ী শিক্ষাবোর্ড কর্তৃপক্ষ খাতার পুনঃমূল্যায়ন প্রক্রিয়া সম্পন্ন করে থাকে।
            </p>
          </div>

          {/* MOTIVATIONAL STUDENT MESSAGE SECTION */}
          <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-8 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-5 shadow-xl relative overflow-hidden">
            <div className="space-y-2 text-center sm:text-left z-10">
              <div className="inline-flex items-center gap-2 bg-blue-800/80 px-3 py-1 rounded-full text-[11px] font-bold text-blue-200 border border-blue-700">
                <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
                <span>SSC পরীক্ষা ২০২৬ পরীক্ষার্থীদের জন্য শুভেচ্ছা বার্তা</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                সকল শিক্ষার্থীর প্রতি আমাদের আন্তরিক শুভকামনা!
              </h3>
              <p className="text-xs sm:text-sm text-blue-100 max-w-lg leading-relaxed font-medium">
                তোমাদের কঠোর পরিশ্রম ও প্রচেষ্টার প্রতি আমাদের সম্মান রইল। আত্মবিশ্বাসী থেকো এবং ফলাফল প্রকাশের পর প্রয়োজন মনে করলেই কেবল ঠাণ্ডা মাথায় বোর্ড চ্যালেঞ্জের সিদ্ধান্ত গ্রহণ করো।
              </p>
            </div>
            <div className="shrink-0 z-10">
              <a 
                href={settings.facebookPageUrl || 'https://facebook.com/abedoni.bd'} 
                target="_blank" 
                rel="noreferrer"
                className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-5 py-3 rounded-2xl transition inline-flex items-center gap-2 text-xs sm:text-sm shadow-lg cursor-pointer hover:scale-105"
              >
                <Heart className="w-4 h-4 text-rose-600 fill-rose-600" />
                <span>আমাদের পেজে যুক্ত থাকুন</span>
              </a>
            </div>
          </div>
        </motion.div>

        {/* WHY CHOOSE ABEDONI - FEATURE CARDS */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <div className="text-center space-y-1.5">
            <span className="bg-emerald-100 text-emerald-900 text-[11px] font-extrabold px-3 py-1 rounded-full border border-emerald-200/80">
              কেন আবেদনী ব্যবহার করবেন?
            </span>
            <h2 className="text-xl sm:text-3xl font-black text-slate-900">
              সহজ, আধুনিক ও বিশ্বস্ত অনলাইন প্রসেসিং সুবিধা
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
              শিক্ষার্থীদের মূল্যবান সময় বাঁচাতে ও কম্পিউটার দোকানে দীর্ঘ লাইনের ঝামেলা এড়াতে আমাদের প্রসেসিং সেবা।
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            
            {/* Card 1 */}
            <motion.div 
              whileHover={{ y: -4 }}
              className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-lg transition space-y-2.5 group relative"
            >
              <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg group-hover:scale-105 transition-transform">
                <Home className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">ঘরে বসেই সহজ আবেদন</h3>
              <p className="text-slate-600 text-xs leading-relaxed font-medium">
                কম্পিউটারের দোকানে ঘণ্টার পর ঘণ্টা অপেক্ষা না করে ঘরে বসেই মোবাইল ফোন থেকে মাত্র ৫ মিনিটে প্রসেস করুন।
              </p>
            </motion.div>

            {/* Card 2 */}
            <motion.div 
              whileHover={{ y: -4 }}
              className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-lg transition space-y-2.5 group relative"
            >
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-lg group-hover:scale-105 transition-transform">
                <Smartphone className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">টেলিটক সিমের প্রয়োজন নেই</h3>
              <p className="text-slate-600 text-xs leading-relaxed font-medium">
                টেলিটক সিম বা ব্যালেন্স ছাড়াই আপনার বিকাশ, নগদ বা রকেট ওয়ালেট দিয়ে নিমিষে ফি পরিশোধ করা সম্ভব।
              </p>
            </motion.div>

            {/* Card 3 */}
            <motion.div 
              whileHover={{ y: -4 }}
              className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-lg transition space-y-2.5 group relative"
            >
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg group-hover:scale-105 transition-transform">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">অটোমেটেড ফি ক্যালকুলেটর</h3>
              <p className="text-slate-600 text-xs leading-relaxed font-medium">
                শিক্ষা বোর্ড ও বিষয় সিলেক্ট করলেই মোট ফি স্বয়ংক্রিয়ভাবে নির্ভুলভাবে হিসাব করে দেখা যায়।
              </p>
            </motion.div>

            {/* Card 4 */}
            <motion.div 
              whileHover={{ y: -4 }}
              className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-lg transition space-y-2.5 group relative"
            >
              <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-lg group-hover:scale-105 transition-transform">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">নিরাপদ তথ্য সুরক্ষা</h3>
              <p className="text-slate-600 text-xs leading-relaxed font-medium">
                শিক্ষার্থীদের রোল, রেজিস্ট্রেশন ও পেমেন্ট হিস্ট্রি সর্বোচ্চ এনক্রিপশন ও নিরাপত্তার সাথে সংরক্ষিত হয়।
              </p>
            </motion.div>

            {/* Card 5 */}
            <motion.div 
              whileHover={{ y: -4 }}
              className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-lg transition space-y-2.5 group relative"
            >
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-lg group-hover:scale-105 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">ডিজিটাল পেমেন্ট রসিদ</h3>
              <p className="text-slate-600 text-xs leading-relaxed font-medium">
                আবেদন সম্পন্ন হওয়ামাত্রই অনলাইন ডিজিটাল রিসিপ্ট ও ট্র্যাকিং নম্বর তাৎক্ষণিক ডাউনলোড বা সেভ করা যাবে।
              </p>
            </motion.div>

            {/* Card 6 */}
            <motion.div 
              whileHover={{ y: -4 }}
              className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-lg transition space-y-2.5 group relative"
            >
              <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-lg group-hover:scale-105 transition-transform">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">লাইভ সাপোর্ট হেল্পডেস্ক</h3>
              <p className="text-slate-600 text-xs leading-relaxed font-medium">
                আবেদন সম্পর্কিত যেকোনো প্রশ্ন, জটিলতা বা জানার বিষয় থাকলে সরাসরি হোয়াটসঅ্যাপে সাপোর্ট দলের সহায়তা নিন।
              </p>
            </motion.div>

          </div>
        </motion.div>

        {/* FREQUENTLY ASKED QUESTIONS (FAQ) */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <div className="text-center space-y-1.5">
            <span className="bg-purple-100 text-purple-900 text-[11px] font-extrabold px-3 py-1 rounded-full border border-purple-200">
              সাধারণ জিজ্ঞাসা ও তথ্য
            </span>
            <h2 className="text-xl sm:text-3xl font-black text-slate-900">
              প্রচলিত প্রশ্নাবলী (FAQ)
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm max-w-lg mx-auto leading-relaxed">
              বোর্ড চ্যালেঞ্জ ও প্রাক-উদ্বোধন সংক্রান্ত পরীক্ষার্থীদের বহুল জিজ্ঞাসিত প্রশ্নসমূহের স্পষ্ট উত্তর।
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-3">
            {faqs.map((faq, idx) => (
              <div 
                key={idx}
                className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs transition"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-3 font-extrabold text-slate-900 text-xs sm:text-sm cursor-pointer hover:bg-slate-50 transition"
                >
                  <span className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>{faq.q}</span>
                  </span>
                  {openFaqIndex === idx ? (
                    <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>

                <AnimatePresence>
                  {openFaqIndex === idx && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="border-t border-slate-100 bg-slate-50/80 p-4 sm:p-5 text-xs text-slate-700 leading-relaxed font-medium"
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CONTACT & SOCIAL SECTION */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-6 sm:p-10 rounded-3xl text-center space-y-5 shadow-xl"
        >
          <div className="max-w-xl mx-auto space-y-2">
            <h3 className="text-xl sm:text-2xl font-black">আমাদের কমিউনিটিতে যুক্ত থাকুন</h3>
            <p className="text-xs sm:text-sm text-blue-100 leading-relaxed font-medium">
              ফলাফল প্রকাশের সুনির্দিষ্ট সময়সূচী, অফিশিয়াল আপডেট ও যেকোনো সহায়তার জন্য সোশ্যাল মিডিয়া ও হেল্পডেস্কে চোখ রাখুন।
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <a 
              href={settings.facebookPageUrl || 'https://facebook.com/abedoni.bd'}
              target="_blank" 
              rel="noreferrer"
              className="bg-white text-blue-700 hover:bg-blue-50 font-extrabold px-5 py-3 rounded-2xl transition inline-flex items-center gap-2 text-xs sm:text-sm shadow-md cursor-pointer hover:scale-105"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Facebook Page</span>
            </a>

            <a 
              href={`https://wa.me/88${settings.whatsappNumber || '01577777092'}`}
              target="_blank" 
              rel="noreferrer"
              className="bg-emerald-500 hover:bg-emerald-400 text-white font-extrabold px-5 py-3 rounded-2xl transition inline-flex items-center gap-2 text-xs sm:text-sm shadow-md cursor-pointer hover:scale-105"
            >
              <MessageSquare className="w-4 h-4 fill-white" />
              <span>WhatsApp Helpdesk ({settings.whatsappNumber || '01577777092'})</span>
            </a>
          </div>

          <div className="pt-3 border-t border-white/10 text-xs text-blue-200 flex flex-wrap items-center justify-center gap-4 font-medium">
            <span>📧 ইমেইল: {settings.officialEmail || 'abedoni.bd@gmail.com'}</span>
            <span>⏰ হেল্পডেস্ক: {settings.supportHours || 'সকাল ৭:০০ - রাত ১১:০০'}</span>
          </div>
        </motion.div>

        {/* PUBLIC FOOTER */}
        <div className="pt-6 border-t border-slate-200 text-center space-y-2 text-xs text-slate-500">
          <p>© 2026 আবেদনী (Abedoni) • সর্বস্বত্ব সংরক্ষিত।</p>
          <p className="text-[11px] text-slate-400 max-w-xl mx-auto leading-relaxed">
            Abedoni is an independent online application assistance service portal. Not affiliated with Bangladesh Education Boards or TeleTalk Bangladesh Ltd.
          </p>
        </div>

      </div>
    </div>
  );
};

// Helper Pulsing Live Activity Indicator
const ActivityIndicator = () => (
  <span className="relative flex h-2.5 w-2.5">
    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
  </span>
);
