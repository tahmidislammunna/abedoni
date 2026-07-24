import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Smartphone, 
  Receipt, 
  MessageSquare, 
  Clock, 
  Sparkles, 
  Calculator, 
  HelpCircle, 
  Star, 
  UserCheck, 
  FileSpreadsheet, 
  Building2, 
  GraduationCap, 
  Compass, 
  Zap,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { BOARDS_LIST, SSC_SUBJECTS, OFFICIAL_FEE_PER_SUBJECT, ABEDONI_PLATFORM_FEE_PER_ORDER } from '../data/boardsAndSubjects';
import { FAQ_LIST, REVIEWS_LIST, NOTICES } from '../data/mockData';
import { getAppSettings } from '../data/appSettings';

interface HomeViewProps {
  onStartApplication: () => void;
  onTrackOrder: () => void;
  onNavigateTab: (tab: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onStartApplication,
  onTrackOrder,
  onNavigateTab,
}) => {
  const settings = getAppSettings();
  
  // Soft Typewriter Headline Sequence State
  const typewriterPhrases = ['আবেদন হোক সহজ', 'আবেদন হোক নিরাপদ', 'আবেদন হোক দ্রুত'];
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [currentTypedText, setCurrentTypedText] = useState('');
  const [isDeletingText, setIsDeletingText] = useState(false);

  React.useEffect(() => {
    const targetPhrase = typewriterPhrases[phraseIndex];
    let timer: NodeJS.Timeout;

    if (!isDeletingText && currentTypedText.length < targetPhrase.length) {
      // Soft typing speed: ~110ms per char
      timer = setTimeout(() => {
        setCurrentTypedText(targetPhrase.slice(0, currentTypedText.length + 1));
      }, 110);
    } else if (!isDeletingText && currentTypedText.length === targetPhrase.length) {
      // Long wait pause after full phrase typed: 3800ms
      timer = setTimeout(() => {
        setIsDeletingText(true);
      }, 3800);
    } else if (isDeletingText && currentTypedText.length > 0) {
      // Soft backspacing: ~50ms per char
      timer = setTimeout(() => {
        setCurrentTypedText(targetPhrase.slice(0, currentTypedText.length - 1));
      }, 50);
    } else if (isDeletingText && currentTypedText.length === 0) {
      // Switch phrase and reset to typing
      setIsDeletingText(false);
      setPhraseIndex((prev) => (prev + 1) % typewriterPhrases.length);
    }

    return () => clearTimeout(timer);
  }, [currentTypedText, isDeletingText, phraseIndex]);

  // Live Fee Calculator State
  const [selectedBoard, setSelectedBoard] = useState('DHA');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(['101', '107']);

  const toggleSubject = (code: string) => {
    if (selectedSubjects.includes(code)) {
      if (selectedSubjects.length === 1) return; // keep at least 1
      setSelectedSubjects(selectedSubjects.filter(c => c !== code));
    } else {
      setSelectedSubjects([...selectedSubjects, code]);
    }
  };

  const boardFeePerSubject = settings.officialBoardFee || 175;
  const smsFeeTotal = settings.smsFeePerSubject || 6; // Fixed 6 taka total (2 SMS x 3 taka)
  const platformFee = settings.abedoniServiceFee || 99;

  const officialTotal = selectedSubjects.length * boardFeePerSubject;
  const grandTotal = officialTotal + smsFeeTotal + platformFee;

  return (
    <div className="space-y-16 pb-20">
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-white/50 backdrop-blur-2xl text-slate-900 rounded-[32px] sm:rounded-[40px] p-6 sm:p-12 lg:p-16 shadow-2xl border border-white/80">
        {/* Decorative Floating Graphic Orbs & Background Shapes */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-blue-400/30 to-indigo-500/20 rounded-full blur-3xl pointer-events-none animate-float-orb" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-gradient-to-tr from-emerald-400/25 to-teal-500/20 rounded-full blur-3xl pointer-events-none animate-float-orb" style={{ animationDelay: '3s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-100/30 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          
          {/* Animated Badge / Headline Sequence */}
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-emerald-100/90 via-teal-100/90 to-blue-100/90 border border-emerald-300/80 text-emerald-950 text-xs sm:text-sm font-black backdrop-blur-md shadow-sm transition-all duration-500 overflow-hidden min-h-[38px]">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-mono tracking-wide inline-flex items-center">
              <span>SSC Board Challenge 2026</span>
            </span>
          </div>

          {/* Main Headline with Soft Typewriter Effect */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-[1.25] font-bn">
            <span className="inline-flex items-center min-h-[1.25em] text-blue-700 bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-800 bg-clip-text text-transparent">
              <span>{currentTypedText}</span>
              <span className="w-0.5 h-8 sm:h-12 bg-blue-600 ml-1 inline-block animate-pulse rounded-full" />
            </span>
            <br />
            <span>ঘরে বসেই মাত্র <span className="text-emerald-600 font-black">৫ মিনিটে</span> বোর্ড চ্যালেঞ্জ করুন</span>
          </h1>

          {/* Subtitle */}
          <p className="text-slate-600 text-sm sm:text-lg font-medium max-w-2xl mx-auto leading-relaxed font-bn">
            {settings.heroSubheadline || 'টেলিটক সিমের কোনো ঝামেলা নেই, কম্পিউটারের দোকানে দ্বিগুণ টাকা দেওয়ার প্রয়োজন নেই। আবেদনী-এর মাধ্যমে শতভাগ নিশ্চয়তার সাথে SSC খাতা পুনঃমূল্যায়নের আবেদন করুন।'}
          </p>

          {/* CTA Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <button
              onClick={onStartApplication}
              className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm sm:text-base font-extrabold px-8 py-3.5 rounded-2xl shadow-xl shadow-blue-600/25 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>এখনই আবেদন করুন</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={onTrackOrder}
              className="w-full sm:w-auto bg-white/80 hover:bg-white text-slate-800 text-sm sm:text-base font-bold px-6 py-3.5 rounded-2xl border border-slate-200 backdrop-blur-md shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Receipt className="w-5 h-5 text-emerald-600" />
              <span>আবেদন স্ট্যাটাস ও রসিদ</span>
            </button>
          </div>

          {/* Trust Highlights */}
          <div className="pt-6 border-t border-slate-200/60 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs sm:text-sm text-slate-700">
            <div className="flex items-center justify-center gap-2 bg-white/70 backdrop-blur-md p-3 rounded-2xl border border-white/60 shadow-xs font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>TeleTalk SIM লাগবে না</span>
            </div>
            <div className="flex items-center justify-center gap-2 bg-white/70 backdrop-blur-md p-3 rounded-2xl border border-white/60 shadow-xs font-bold">
              <Receipt className="w-4 h-4 text-blue-600 shrink-0" />
              <span>ডিজিটাল রসিদ পাবেন</span>
            </div>
            <div className="flex items-center justify-center gap-2 bg-white/70 backdrop-blur-md p-3 rounded-2xl border border-white/60 shadow-xs font-bold">
              <MessageSquare className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>WhatsApp লাইভ প্রুফ</span>
            </div>
            <div className="flex items-center justify-center gap-2 bg-white/70 backdrop-blur-md p-3 rounded-2xl border border-white/60 shadow-xs font-bold">
              <Clock className="w-4 h-4 text-amber-600 shrink-0" />
              <span>সকাল ৭টা - রাত ১১টা সাপোর্ট</span>
            </div>
          </div>

        </div>
      </section>


      {/* 2. LIVE FEE CALCULATOR INTERACTIVE WIDGET */}
      <section className="bg-white/50 backdrop-blur-2xl rounded-[32px] p-6 sm:p-10 border border-white/80 shadow-xl relative overflow-hidden">
        {/* Subtle Accent Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-100/40 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-4xl mx-auto space-y-6 relative z-10">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-100/90 text-blue-900 text-xs font-extrabold border border-blue-200">
              <Calculator className="w-3.5 h-3.5 text-blue-600" />
              <span>স্বচ্ছ পেমেন্ট ক্যালকুলেটর</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-bn">
              কত বিষয় চ্যালেঞ্জ করবেন? খরচ হিসাব করুন
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm font-bn">
              বোর্ডের অফিশিয়াল ফি ৳{boardFeePerSubject}/বিষয় + SMS চার্জ ৳{smsFeeTotal} (২টি SMS) + মাত্র <strong className="font-extrabold text-blue-700">৳{platformFee}</strong> আবেদনী সার্ভিস চার্জ। কোনো গোপন খরচ নেই।
            </p>
          </div>

          {/* Calculator Card */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Step 1: Select Board & Sample Subjects */}
            <div className="md:col-span-2 space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-800 mb-1 font-bn">
                  ১. শিক্ষা বোর্ড নির্বাচন করুন
                </label>
                <select
                  value={selectedBoard}
                  onChange={(e) => setSelectedBoard(e.target.value)}
                  className="w-full bg-white border border-slate-300 text-slate-900 text-xs sm:text-sm rounded-xl p-2.5 font-bn focus:ring-2 focus:ring-blue-500 shadow-xs font-bold"
                >
                  {BOARDS_LIST.map(b => (
                    <option key={b.code} value={b.code}>{b.nameBn}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-800 mb-2 font-bn">
                  ২. বিষয়সমূহ নির্বাচন করুন ({selectedSubjects.length}টি বিষয় সিলেক্টেড)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 bg-white rounded-xl border border-slate-200 backdrop-blur-xs">
                  {SSC_SUBJECTS.map(subj => {
                    const isChecked = selectedSubjects.includes(subj.code);
                    return (
                      <button
                        key={subj.code}
                        type="button"
                        onClick={() => toggleSubject(subj.code)}
                        className={`text-left p-2 rounded-lg text-xs font-bold border transition-all flex items-center justify-between cursor-pointer ${
                          isChecked 
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <span className="truncate pr-1">{subj.nameBn.split(' ')[0]} ({subj.code})</span>
                        {isChecked && <CheckCircle2 className="w-3.5 h-3.5 text-white shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Fee Calculation Breakdown */}
            <div className="bg-slate-900/95 backdrop-blur-xl text-white rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-xl border border-slate-800">
              <div className="space-y-3">
                <h3 className="text-xs sm:text-sm font-extrabold text-emerald-400 border-b border-slate-800 pb-2 font-bn">
                  খরচের পূর্ণাঙ্গ বিবরণী
                </h3>
                
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>বোর্ড ফি ({selectedSubjects.length} × ৳{boardFeePerSubject}):</span>
                    <span className="font-mono font-bold text-white">৳{officialTotal}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>SMS চার্জ (২টি SMS × ৳৩):</span>
                    <span className="font-mono font-bold text-amber-300">৳{smsFeeTotal}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>আবেদনী সার্ভিস চার্জ:</span>
                    <span className="font-mono font-bold text-emerald-400">৳{platformFee}</span>
                  </div>
                  <div className="border-t border-slate-800 pt-2 flex justify-between text-xs sm:text-sm font-black text-white">
                    <span>সর্বমোট টাকা:</span>
                    <span className="text-emerald-400 text-base sm:text-lg font-mono">৳{grandTotal}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={onStartApplication}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-3 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
              >
                <span>এই বিষয়ে আবেদন করুন</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      </section>


      {/* 3. WHY CHOOSE ABEDONI */}
      <section className="space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-bn">
            কেন কম্পিউটারের দোকানের চেয়ে আবেদনী সেরা?
          </h2>
          <p className="text-slate-600 text-sm font-bn">
            শিক্ষার্থীদের সময়, টাকা এবং মানসিক দুশ্চিন্তা দূর করতেই আমাদের এই উদ্যোগ।
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="bg-white/50 backdrop-blur-xl p-6 rounded-3xl border border-white/60 shadow-md hover:bg-white/70 transition-all space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
              <Smartphone className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 font-bn">TeleTalk SIM লাগবে না</h3>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-bn">
              নিজের কোনো টেলিটক সিম বা অতিরিক্ত টাকা দিয়ে সিম কেনার দরকার নেই। আমাদের প্যানেলের নিজস্ব সিম ব্যবহার করে প্রসেস করা হয়।
            </p>
          </div>

          <div className="bg-white/50 backdrop-blur-xl p-6 rounded-3xl border border-white/60 shadow-md hover:bg-white/70 transition-all space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
              <Receipt className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 font-bn">ডিজিটাল রসিদ ও লাইভ প্রমাণ</h3>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-bn">
              আবেদন সম্পন্ন হলেই আপনার ডিভাইসে ডিজিটাল রসিদ সেভ হবে এবং টেলিটক সাবমিশনের স্ক্রিনশট সরাসরি হোয়াটসঅ্যাপে পাবেন।
            </p>
          </div>

          <div className="bg-white/50 backdrop-blur-xl p-6 rounded-3xl border border-white/60 shadow-md hover:bg-white/70 transition-all space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 font-bn">সর্বনিম্ন খরচ ও নিরাপত্তা</h3>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-bn">
              দোকানদাররা ১৫০-৩০০ টাকা বাড়তি চায়। আবেদনীতে মাত্র <strong className="font-extrabold text-emerald-700">৳{platformFee}</strong> টাকা নির্দিষ্ট ফি। আপনার রোল ও রেজি নম্বর সম্পূর্ণ নিরাপদ।
            </p>
          </div>

        </div>
      </section>


      {/* 4. STEP-BY-STEP WORKFLOW */}
      <section className="bg-slate-900/90 backdrop-blur-2xl text-white rounded-[32px] p-8 sm:p-12 space-y-8 border border-slate-800 shadow-2xl">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-emerald-400 font-bold text-xs uppercase tracking-wider">সহজ ৪টি ধাপ</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white font-bn">
            কীভাবে আবেদন সম্পন্ন হবে?
          </h2>
          <p className="text-slate-400 text-sm font-bn">
            মাত্র ৫ মিনিটে যেকোনো স্থান থেকে আবেদন সম্পন্ন করতে পারবেন।
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10 space-y-3 relative">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-black flex items-center justify-center text-sm shadow-md shadow-blue-600/30">
              ১
            </div>
            <h3 className="text-base font-bold text-white font-bn">তথ্য প্রদান করুন</h3>
            <p className="text-slate-300 text-xs leading-relaxed font-bn">
              আপনার শিক্ষা বোর্ড, রোল, রেজিস্ট্রেশন নম্বর এবং যেসব বিষয়ে চ্যালেঞ্জ করতে চান তা সিলেক্ট করুন।
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10 space-y-3 relative">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-black flex items-center justify-center text-sm shadow-md shadow-emerald-600/30">
              ২
            </div>
            <h3 className="text-base font-bold text-white font-bn">পেমেন্ট সম্পন্ন করুন</h3>
            <p className="text-slate-300 text-xs leading-relaxed font-bn">
              অটো ক্যলকুলেটেড ফি আমাদের বিকাশ, নগদ বা রকেট নম্বরে পাঠিয়ে Transaction ID প্রদান করুন।
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10 space-y-3 relative">
            <div className="w-8 h-8 rounded-lg bg-purple-600 text-white font-black flex items-center justify-center text-sm shadow-md shadow-purple-600/30">
              ৩
            </div>
            <h3 className="text-base font-bold text-white font-bn">আমরা জমা দেব</h3>
            <p className="text-slate-300 text-xs leading-relaxed font-bn">
              আমাদের টিম দ্রুত নিজস্ব টেলিটক সিমের মাধ্যমে বোর্ডের সার্ভারে নিখুঁতভাবে আপনার আবেদন জমা দেবে।
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10 space-y-3 relative">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 font-black flex items-center justify-center text-sm shadow-md shadow-amber-500/30">
              ৪
            </div>
            <h3 className="text-base font-bold text-white font-bn">কনফার্মেশন ও রসিদ</h3>
            <p className="text-slate-300 text-xs leading-relaxed font-bn">
              তাত্ক্ষণিক ডিজিটাল রসিদ পাবেন এবং টেলিটকের কনফার্মেশন স্ক্রিনশট হোয়াটসঅ্যাপে পৌঁছে যাবে।
            </p>
          </div>

        </div>

        <div className="text-center pt-4">
          <button
            onClick={onStartApplication}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-8 py-3.5 rounded-2xl text-sm transition-all shadow-lg hover:shadow-emerald-500/20 cursor-pointer inline-flex items-center gap-2"
          >
            <span>এখনই ৫ মিনিটে আবেদন শুরু করুন</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>


      {/* 5. ABEDONI VS COMPUTER SHOP COMPARISON */}
      <section className="bg-white/40 backdrop-blur-2xl rounded-[32px] p-6 sm:p-10 border border-white/60 shadow-xl space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-bn">তুলনামূলক পার্থক্য</h2>
          <p className="text-slate-600 text-sm font-bn">কেন শিক্ষার্থীরা প্রতিনিয়ত আবেদনী বেছে নিচ্ছে</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-white/40 bg-white/60 text-slate-700">
                <th className="p-3.5 font-bold font-bn">সুবিধা / বৈশিষ্ট্য</th>
                <th className="p-3.5 font-bold text-blue-700 bg-blue-100/50 font-bn">আবেদনী (Abedoni)</th>
                <th className="p-3.5 font-bold text-slate-500 font-bn">কম্পিউটারের দোকান</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/40">
              <tr>
                <td className="p-3.5 font-medium text-slate-900 font-bn">টেলিটক সিমের প্রয়োজনীয়তা</td>
                <td className="p-3.5 text-emerald-700 font-bold bg-blue-50/40 font-bn flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> প্রয়োজন নেই
                </td>
                <td className="p-3.5 text-slate-600 font-bn">দোকানের সিমে ভরসা করতে হয়</td>
              </tr>
              <tr>
                <td className="p-3.5 font-medium text-slate-900 font-bn">সার্ভিস চার্জ / অতিরিক্ত খরচ</td>
                <td className="p-3.5 text-emerald-700 font-bold bg-blue-50/40 font-bn">মাত্র ৳<strong className="font-extrabold text-emerald-800">{platformFee}</strong> (নির্ধারিত)</td>
                <td className="p-3.5 text-slate-600 font-bn">৳১৫০ থেকে ৳৩০০ টাকা দাবি করে</td>
              </tr>
              <tr>
                <td className="p-3.5 font-medium text-slate-900 font-bn">ডিজিটাল রসিদ ও ট্র্যাকিং</td>
                <td className="p-3.5 text-emerald-700 font-bold bg-blue-50/40 font-bn flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> সাথে সাথে পাওয়া যায়
                </td>
                <td className="p-3.5 text-slate-600 font-bn">হাতে কোনো আসল রসিদ দেয় না</td>
              </tr>
              <tr>
                <td className="p-3.5 font-medium text-slate-900 font-bn">সাবমিশন প্রুফ / স্ক্রিনশট</td>
                <td className="p-3.5 text-emerald-700 font-bold bg-blue-50/40 font-bn flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> WhatsApp এ অফিশিয়াল প্রুফ
                </td>
                <td className="p-3.5 text-slate-600 font-bn">ঠিকমতো করল কিনা অনিশ্চয়তা থাকে</td>
              </tr>
              <tr>
                <td className="p-3.5 font-medium text-slate-900 font-bn">সময় ও যাতায়াত</td>
                <td className="p-3.5 text-emerald-700 font-bold bg-blue-50/40 font-bn">ঘরে বসে মাত্র ৫ মিনিট</td>
                <td className="p-3.5 text-slate-600 font-bn">দোকানে গিয়ে লাইনে দাঁড়াতে হয়</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>


      {/* 6. STUDENT REVIEWS */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-200/60 pb-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 font-bn">শিক্ষার্থীদের অভিজ্ঞতা ও রিভিউ</h2>
            <p className="text-slate-600 text-xs sm:text-sm font-bn">গত বছর সমূহের সফল আবেদনকারীদের মতামত</p>
          </div>
          <div className="flex items-center gap-1 bg-amber-100/80 text-amber-900 px-3.5 py-1.5 rounded-full border border-amber-200 text-xs font-bold shadow-xs">
            <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
            <span>৪.৯ / ৫.০ (১০,০০০+ শিক্ষার্থী)</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {REVIEWS_LIST.map(rev => (
            <div key={rev.id} className="bg-white/50 backdrop-blur-xl p-5 rounded-3xl border border-white/60 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm font-bn">{rev.name}</h4>
                  <p className="text-[11px] text-slate-500 font-bn">{rev.board} • রোল: {rev.rollMasked}</p>
                </div>
                <div className="flex text-amber-400">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                  ))}
                </div>
              </div>
              <p className="text-slate-700 text-xs leading-relaxed font-bn italic">
                "{rev.commentBn}"
              </p>
              <p className="text-[10px] text-slate-400 font-medium">{rev.date}</p>
            </div>
          ))}
        </div>
      </section>


      {/* 7. FUTURE VISION & ROADMAP */}
      <section className="bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-900 text-white rounded-3xl p-8 sm:p-12 space-y-6">
        <div className="max-w-3xl space-y-3">
          <span className="text-emerald-400 font-bold text-xs uppercase tracking-wider">ভবিষ্যৎ পরিকল্পনা</span>
          <h2 className="text-2xl sm:text-4xl font-black text-white font-bn">
            বাংলাদেশের এক নম্বর ডিজিটাল অ্যাপ্লিকেশন প্ল্যাটফর্ম
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-bn">
            আবেদনী কেবল বোর্ড চ্যালেঞ্জের মধ্যে সীমাবদ্ধ থাকছে না। খুব শীঘ্রই ভর্তি পরীক্ষা, সরকারি আবেদন, পাসপোর্ট, এবং ড্রাইভিং লাইসেন্সসহ যাবতীয় গুরুত্বপূর্ণ আবেদন সহজ করতে আসছে আবেদনী।
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-semibold">
          <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-xl border border-white/10 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-emerald-400" />
            <span>একাদশ ও বিশ্ববিদ্যালয় ভর্তি</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-xl border border-white/10 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-blue-400" />
            <span>সরকারি চাকরি আবেদন</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-xl border border-white/10 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-amber-400" />
            <span>পাসপোর্ট ও এনআইডি সেবা</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-xl border border-white/10 flex items-center gap-2">
            <Compass className="w-5 h-5 text-purple-400" />
            <span>ড্রাইভিং লাইসেন্স ও ভিসা</span>
          </div>
        </div>
      </section>

    </div>
  );
};
