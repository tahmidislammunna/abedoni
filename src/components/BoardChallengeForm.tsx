import React, { useState } from 'react';
import { 
  Check, 
  Send, 
  MessageSquare, 
  Sparkles, 
  ShieldCheck, 
  AlertCircle,
  ExternalLink,
  BookOpen,
  Headphones,
  Zap,
  ChevronRight,
  HelpCircle
} from 'lucide-react';
import { 
  BOARDS_LIST, 
  SSC_SUBJECTS, 
  generateAssistanceRequestWhatsappMessage, 
  getWhatsappDirectUrl 
} from '../data/boardsAndSubjects';
import { EducationBoard } from '../types';
import { getAppSettings } from '../data/appSettings';

interface BoardChallengeFormProps {
  onOrderCompleted?: (order: any) => void;
  onTrackOrderClick?: () => void;
}

export const BoardChallengeForm: React.FC<BoardChallengeFormProps> = ({
  onTrackOrderClick
}) => {
  const settings = getAppSettings();

  // Mode Selection: 'self' ("নিজে করুন") | 'assisted' ("অভিজ্ঞদের সহায়তা নিন")
  const [activeMode, setActiveMode] = useState<'self' | 'assisted'>('self');

  // Self Mode Calculator State
  const [selfSelectedSubjects, setSelfSelectedSubjects] = useState<string[]>([]);

  // Assisted Mode Clean Form Fields
  const [phone, setPhone] = useState('');
  const [board, setBoard] = useState<EducationBoard>('DHA');
  const [selectedSubjectCodes, setSelectedSubjectCodes] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Submission Completion State
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedLeadId, setSubmittedLeadId] = useState('');
  const [submittedWhatsappUrl, setSubmittedWhatsappUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fee Calculations
  const boardFeePerSub = settings.officialBoardFee || 150;
  const platformFee = settings.abedoniServiceFee || 49;

  const handleToggleSubjectAssisted = (code: string) => {
    if (selectedSubjectCodes.includes(code)) {
      setSelectedSubjectCodes(selectedSubjectCodes.filter(c => c !== code));
    } else {
      setSelectedSubjectCodes([...selectedSubjectCodes, code]);
    }
  };

  const handleToggleSubjectSelf = (code: string) => {
    if (selfSelectedSubjects.includes(code)) {
      setSelfSelectedSubjects(selfSelectedSubjects.filter(c => c !== code));
    } else {
      setSelfSelectedSubjects([...selfSelectedSubjects, code]);
    }
  };

  const getSelectedSubjectNames = (codes: string[]) => {
    return codes.map(code => {
      const subj = SSC_SUBJECTS.find(s => s.code === code);
      return subj ? `${subj.nameBn} (${subj.code})` : code;
    });
  };

  const handleAssistedWhatsAppTrigger = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!phone.trim() || phone.trim().length < 11) {
      setErrorMessage('অনুগ্রহ করে আপনার সঠিক ১১ সংখ্যার হোয়াটসঅ্যাপ / মোবাইল নম্বর দিন।');
      return;
    }

    setIsSubmitting(true);

    const boardObj = BOARDS_LIST.find(b => b.code === board);
    const boardName = boardObj ? boardObj.nameBn : board;
    const subjectNames = getSelectedSubjectNames(selectedSubjectCodes);

    const totalAmt = selectedSubjectCodes.length > 0
      ? (selectedSubjectCodes.length * boardFeePerSub) + platformFee
      : 0;

    let leadId = '';
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phone.trim(),
          board,
          subjects: selectedSubjectCodes,
          isLead: true,
          orderStatus: 'Pending',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        leadId = data.order?.id || '';
      }
    } catch (err) {
      console.error('Failed to create lead record:', err);
    } finally {
      setIsSubmitting(false);
    }

    const encodedMsg = generateAssistanceRequestWhatsappMessage(
      phone,
      boardName,
      subjectNames,
      totalAmt
    );

    let finalEncodedMsg = encodedMsg;
    if (leadId) {
      const decoded = decodeURIComponent(encodedMsg);
      const withLeadId = `${decoded}\n\n📌 **অর্ডার / লিড আইডি:** ${leadId}`;
      finalEncodedMsg = encodeURIComponent(withLeadId);
    }

    const targetUrl = getWhatsappDirectUrl(settings.whatsappNumber || '01577777092', finalEncodedMsg);
    
    setSubmittedLeadId(leadId);
    setSubmittedWhatsappUrl(targetUrl);
    setIsSubmitted(true);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 font-bn">
      
      {/* Page Title & Mission Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 bg-blue-100/90 text-blue-900 text-xs font-black px-3.5 py-1 rounded-full border border-blue-200">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>SSC 2026 Board Challenge Assistance Platform</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900">
          SSC ফলাফল পুনঃনিরীক্ষণ (বোর্ড চ্যালেঞ্জ)
        </h1>
        <p className="text-slate-600 text-xs sm:text-sm max-w-2xl mx-auto">
          অফিশিয়াল অনলাইন পোর্টালে নিজে আবেদন করার ফ্রি গাইড অথবা আবেদনী-এর মাত্র ৳49 সার্ভিস ফি-তে অভিজ্ঞ অনলাইন সহায়তা সেবা।
        </p>
      </div>

      {/* Primary Option Switcher Tabs */}
      <div className="bg-white/70 backdrop-blur-xl p-2 rounded-3xl border border-white/80 shadow-lg grid grid-cols-1 sm:grid-cols-2 gap-2">
        
        <button
          type="button"
          onClick={() => setActiveMode('self')}
          className={`p-4 rounded-2xl transition-all flex items-center justify-center gap-3 cursor-pointer ${
            activeMode === 'self'
              ? 'bg-emerald-600 text-white shadow-md font-black'
              : 'bg-transparent text-slate-700 hover:bg-slate-100/80 font-bold'
          }`}
        >
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
            activeMode === 'self' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
          }`}>
            <BookOpen className="w-5 h-5" />
          </div>
          <div className="text-left">
            <div className="text-sm sm:text-base leading-tight">১. নিজে করুন (ফ্রি গাইড)</div>
            <div className={`text-[11px] font-normal leading-tight ${activeMode === 'self' ? 'text-emerald-100' : 'text-slate-500'}`}>
              অফিশিয়াল পোর্টালের সম্পূর্ণ নির্দেশিকা
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveMode('assisted')}
          className={`p-4 rounded-2xl transition-all flex items-center justify-center gap-3 cursor-pointer ${
            activeMode === 'assisted'
              ? 'bg-blue-600 text-white shadow-md font-black'
              : 'bg-transparent text-slate-700 hover:bg-slate-100/80 font-bold'
          }`}
        >
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
            activeMode === 'assisted' ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-800'
          }`}>
            <Headphones className="w-5 h-5" />
          </div>
          <div className="text-left">
            <div className="text-sm sm:text-base leading-tight">২. অভিজ্ঞদের সহায়তা নিন (৳49)</div>
            <div className={`text-[11px] font-normal leading-tight ${activeMode === 'assisted' ? 'text-blue-100' : 'text-slate-500'}`}>
              আবেদনী টিমের ওয়াটসঅ্যাপ সাপোর্ট
            </div>
          </div>
        </button>

      </div>

      {/* ========================================================================= */}
      {/* OPTION 1: "নিজে করুন" (FREE ONLINE APPLICATION STEP-BY-STEP GUIDE)         */}
      {/* ========================================================================= */}
      {activeMode === 'self' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          
          {/* Hero Banner for Self Mode */}
          <div className="bg-emerald-900 text-white rounded-[32px] p-6 sm:p-8 border border-emerald-800 shadow-xl space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="bg-emerald-500/20 text-emerald-300 text-xs font-black px-3 py-1 rounded-full border border-emerald-400/30 uppercase tracking-wider">
                ১০০% ফ্রি অনলাইন গাইড
              </span>
              <a
                href="https://munna.pro.bd/result"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black px-4 py-2 rounded-xl text-xs transition cursor-pointer shadow-md"
              >
                <span>অফিশিয়াল পোর্টালে যান</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <h2 className="text-xl sm:text-3xl font-extrabold text-white">
              নিজে কীভাবে রেজাল্ট পুনঃনিরীক্ষণ (Board Challenge) আবেদন করবেন?
            </h2>

            <p className="text-emerald-100 text-xs sm:text-sm leading-relaxed max-w-2xl">
              SSC 2026-এর রেজাল্ট পুনঃনিরীক্ষণ প্রক্রিয়া এখন সম্পূর্ণ অনলাইনভিত্তিক। নিজ ডিভাইস বা কম্পিউটার থেকে মাত্র ৫ টি ধাপে নিজেই সফলভাবে অফিশিয়াল পোর্টালে আবেদন সম্পন্ন করতে পারবেন।
            </p>
          </div>

          {/* 5 Clear Step Cards */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Zap className="w-5 h-5 text-emerald-600" />
              <span>ধাপে ধাপে অফিশিয়াল অনলাইন আবেদনের নিয়মাবলী</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Step 1 */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center gap-2 text-emerald-700 font-black text-sm">
                  <span className="w-7 h-7 bg-emerald-100 rounded-lg flex items-center justify-center font-bold">১</span>
                  <span>অফিশিয়াল অনলাইন পোর্টালে প্রবেশ করুন</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  শিক্ষা বোর্ডের অফিশিয়াল রেজাল্ট পুনঃনিরীক্ষণ পোর্টালে অথবা নির্দিষ্ট শিক্ষাবোর্ডের ওয়েবসাইট লিংক ভিজিট করুন।
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center gap-2 text-emerald-700 font-black text-sm">
                  <span className="w-7 h-7 bg-emerald-100 rounded-lg flex items-center justify-center font-bold">২</span>
                  <span>রোল, রেজিস্ট্রেশন ও বোর্ড সিলেক্ট করুন</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  পোর্টালে আপনার সঠিক SSC রোল নম্বর, রেজিস্ট্রেশন নম্বর এবং নির্দিষ্ট শিক্ষা বোর্ড সিলেক্ট করুন।
                </p>
              </div>

              {/* Step 3 */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center gap-2 text-emerald-700 font-black text-sm">
                  <span className="w-7 h-7 bg-emerald-100 rounded-lg flex items-center justify-center font-bold">৩</span>
                  <span>বিষয়সমূহ ও সক্রিয় মোবাইল নম্বর দিন</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  যেসব বিষয় চ্যালেঞ্জ করতে চান সেগুলো সিলেক্ট করুন এবং পরবর্তীতে আপডেট পেতে নিজের সক্রিয় মোবাইল নম্বর দিন।
                </p>
              </div>

              {/* Step 4 */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center gap-2 text-emerald-700 font-black text-sm">
                  <span className="w-7 h-7 bg-emerald-100 rounded-lg flex items-center justify-center font-bold">৪</span>
                  <span>অফিশিয়াল বোর্ড ফি পরিশোধ করুন</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  প্রতি বিষয় ৳{boardFeePerSub} টাকা হিসেবে অনলাইন গেটওয়ের মাধ্যমে বিকাশ/নগদ/রকেট বা কার্ড দিয়ে অফিশিয়াল ফি পরিশোধ করুন।
                </p>
              </div>

            </div>

            {/* Step 5 Wide Banner */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-3">
              <div className="w-8 h-8 bg-emerald-600 text-white font-black rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                ৫
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-900 text-sm">আবেদন সাবমিশন ও রসিদ সংরক্ষণ করুন</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  পেমেন্ট সম্পন্ন হওয়ার পর সাবমিশন সম্পন্ন করুন এবং স্ক্রিনে আসা চূড়ান্ত আবেদন স্লিপ বা ট্র্যাকিং কপিটি প্রিন্ট বা পিডিএফ আকারে সেভ করে রাখুন।
                </p>
              </div>
            </div>

          </div>

          {/* Interactive Self-Applier Fee Estimator Widget */}
          <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-slate-200 shadow-md space-y-4">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  নিজে আবেদন করার ফি হিসাব করুন
                </h3>
                <p className="text-xs text-slate-500">
                  অফিশিয়াল ফি প্রতি বিষয় ৳{boardFeePerSub}। নিজে আবেদন করলে আবেদনী সার্ভিস ফি ৳০!
                </p>
              </div>
              <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-2.5 py-1 rounded-full">
                ৳০ আবেদনী ফি
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="md:col-span-2 space-y-3">
                <label className="block text-xs font-bold text-slate-800">
                  যেসব বিষয় চ্যালেঞ্জ করতে চান সিলেক্ট করুন ({selfSelectedSubjects.length}টি সিলেক্টেড):
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 bg-slate-50 rounded-2xl border border-slate-200">
                  {SSC_SUBJECTS.map(subj => {
                    const isChecked = selfSelectedSubjects.includes(subj.code);
                    return (
                      <button
                        key={subj.code}
                        type="button"
                        onClick={() => handleToggleSubjectSelf(subj.code)}
                        className={`p-2 rounded-xl text-xs font-bold border transition text-left flex items-center justify-between cursor-pointer ${
                          isChecked
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <span className="truncate pr-1">{subj.nameBn.split(' ')[0]} ({subj.code})</span>
                        {isChecked && <Check className="w-3.5 h-3.5 text-white shrink-0 stroke-[3]" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Fee Result Card */}
              <div className="bg-slate-900 text-white p-5 rounded-2xl flex flex-col justify-between space-y-3">
                <div>
                  <span className="text-xs text-slate-400 font-bold block mb-2 border-b border-slate-800 pb-1">
                    অফিশিয়াল খরচের হিসাব
                  </span>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-300">
                      <span>অফিশিয়াল বোর্ড ফি:</span>
                      <span className="font-mono font-bold">৳{selfSelectedSubjects.length * boardFeePerSub}</span>
                    </div>
                    <div className="flex justify-between text-emerald-400">
                      <span>আবেদনী সার্ভিস ফি:</span>
                      <span className="font-mono font-bold">৳০ (ফ্রি গাইড)</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">সর্বমোট প্রদেয় ফি:</span>
                  <span className="text-2xl font-black text-emerald-400 font-mono">
                    ৳{selfSelectedSubjects.length * boardFeePerSub}
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* Switch CTA Banner: Need Assistance? */}
          <div className="bg-blue-50 border-2 border-blue-200 p-6 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="space-y-1 text-center sm:text-left">
              <span className="bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase">
                সহায়তা সেবা
              </span>
              <h3 className="text-base sm:text-lg font-black text-blue-950">
                নিজে আবেদন করতে কোনো জটিলতা বা ভয় পাচ্ছেন?
              </h3>
              <p className="text-xs text-blue-800 max-w-xl">
                আবেদনী-এর অভিজ্ঞ সাপোর্টিং টিম মাত্র <strong>৳{platformFee} সার্ভিস ফি</strong>-তে নিখুঁতভাবে অনলাইন পোর্টালে আপনার আবেদন সহায়তায় কাজ করবে।
              </p>
            </div>

            <button
              type="button"
              onClick={() => setActiveMode('assisted')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-black px-6 py-3.5 rounded-2xl text-xs sm:text-sm transition flex items-center gap-2 cursor-pointer shrink-0 shadow-lg shadow-blue-600/25"
            >
              <span>অভিজ্ঞদের সহায়তা নিন (৳{platformFee})</span>
            </button>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* OPTION 2: "অভিজ্ঞদের সহায়তা নিন" (CLEAN & DIRECT WHATSAPP TRIGGER FLOW)    */}
      {/* ========================================================================= */}
      {activeMode === 'assisted' && (
        isSubmitted ? (
          <div className="bg-emerald-50/90 border-2 border-emerald-400 rounded-[32px] p-8 sm:p-12 text-center space-y-6 animate-in zoom-in-95 shadow-xl">
            <div className="w-20 h-20 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-600/30">
              <Check className="w-12 h-12 stroke-[3]" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-4xl font-black text-emerald-950">
                আবেদন সম্পন্ন হয়েছে।
              </h2>
              <p className="text-base sm:text-lg text-emerald-900 font-bold max-w-md mx-auto">
                আমাদের প্রতিনিধি যোগাযোগ করবে।
              </p>
              {submittedLeadId && (
                <div className="inline-block bg-white text-emerald-950 font-mono text-xs sm:text-sm font-black px-4 py-1.5 rounded-full border border-emerald-300 mt-2 shadow-2xs">
                  অর্ডার / লিড আইডি: #{submittedLeadId}
                </div>
              )}
            </div>

            {/* Requested Button */}
            <div className="pt-2">
              <a
                href={submittedWhatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black px-8 py-4 sm:py-5 rounded-2xl text-base sm:text-lg shadow-xl shadow-emerald-600/30 transition-all hover:scale-[1.02] cursor-pointer w-full sm:w-auto"
              >
                <MessageSquare className="w-6 h-6 fill-white/20" />
                <span>অভিজ্ঞদের সাথে কথা বলুন</span>
              </a>
            </div>

            <div className="pt-4 border-t border-emerald-200/80">
              <button
                type="button"
                onClick={() => {
                  setIsSubmitted(false);
                  setPhone('');
                  setSelectedSubjectCodes([]);
                }}
                className="text-xs sm:text-sm text-slate-600 hover:text-slate-900 font-bold underline cursor-pointer"
              >
                নতুন তথ্য সাবমিট করুন
              </button>
            </div>
          </div>
        ) : (
          <form 
            onSubmit={handleAssistedWhatsAppTrigger} 
            className="bg-white/80 backdrop-blur-2xl p-6 sm:p-10 rounded-[32px] border border-slate-200 shadow-xl space-y-6 animate-in fade-in duration-200"
          >
            <div className="border-b border-slate-200/80 pb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
                  <Headphones className="w-6 h-6 text-blue-600" />
                  <span>২. অভিজ্ঞদের সহায়তা নিন (৳{platformFee})</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  আপনার নম্বর ও পছন্দের বিষয় সিলেক্ট করে তথ্য সাবমিট করুন।
                </p>
              </div>
              <span className="bg-blue-100 text-blue-800 text-xs font-black px-3 py-1 rounded-full border border-blue-200 shrink-0">
                Abedoni Assistance
              </span>
            </div>

            {errorMessage && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm p-4 rounded-2xl flex items-center gap-2 shadow-xs">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Form Fields */}
            <div className="space-y-5 text-xs sm:text-sm">
              
              {/* Field 1: WhatsApp / Mobile Number */}
              <div>
                <label className="block font-bold text-slate-800 mb-1.5 text-sm">
                  ১. হোয়াটসঅ্যাপ / মোবাইল নম্বর *
                </label>
                <input
                  type="tel"
                  required
                  maxLength={11}
                  placeholder="যেমন: 01712345678"
                  value={phone}
                  onChange={e => {
                    setPhone(e.target.value.replace(/[^0-9]/g, ''));
                    if (errorMessage) setErrorMessage('');
                  }}
                  className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-4 font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white text-base shadow-xs"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  * এই নম্বরে আবেদনী টিম সরাসরি আপনাকে হোয়াটসঅ্যাপ মেসেজে আবেদন প্রক্রিয়ায় সাহায্য করবে।
                </p>
              </div>

              {/* Field 2: Education Board Selection */}
              <div>
                <label className="block font-bold text-slate-800 mb-1.5 text-sm">
                  শিক্ষা বোর্ড
                </label>
                <select
                  value={board}
                  onChange={e => setBoard(e.target.value as EducationBoard)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-3.5 font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 shadow-xs cursor-pointer"
                >
                  {BOARDS_LIST.map(b => (
                    <option key={b.code} value={b.code}>{b.nameBn}</option>
                  ))}
                </select>
              </div>

              {/* Field 3: Subjects to Challenge */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block font-bold text-slate-800 text-sm">
                    ২. যেসব বিষয়ে চ্যালেঞ্জ করতে চান
                  </label>
                  <span className="text-xs text-blue-700 font-extrabold bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                    {selectedSubjectCodes.length}টি বিষয় নির্বাচন করেছেন
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-64 overflow-y-auto p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  {SSC_SUBJECTS.map(subj => {
                    const isChecked = selectedSubjectCodes.includes(subj.code);
                    return (
                      <button
                        key={subj.code}
                        type="button"
                        onClick={() => handleToggleSubjectAssisted(subj.code)}
                        className={`p-3 rounded-xl text-xs font-bold border transition text-left flex items-center justify-between cursor-pointer ${
                          isChecked
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <span className="truncate pr-1">{subj.nameBn} ({subj.code})</span>
                        {isChecked && <Check className="w-4 h-4 text-white shrink-0 stroke-[3]" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Clear Separation of Fees Notice */}
              <div className="bg-slate-900 text-white p-5 rounded-2xl space-y-2 text-xs">
                <div className="flex justify-between items-center text-slate-300">
                  <span>আবেদনী অনলাইন সাপোর্ট চার্জ:</span>
                  <span className="font-mono font-bold text-emerald-400 text-sm">৳{platformFee} BDT</span>
                </div>
                <div className="flex justify-between items-center text-slate-400 border-t border-slate-800 pt-2">
                  <span>অফিশিয়াল বোর্ড ফি (বোর্ডের পাওনা):</span>
                  <span className="font-mono font-bold text-slate-200">৳{boardFeePerSub} / বিষয় (আলাদা পরিশোধযোগ্য)</span>
                </div>
              </div>

            </div>

            {/* Trigger Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 px-6 rounded-2xl text-base transition flex items-center justify-center gap-3 cursor-pointer shadow-xl shadow-emerald-600/25 disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
                <span>{isSubmitting ? 'সাবমিট হচ্ছে...' : 'আবেদন সাবমিট করুন'}</span>
              </button>
            </div>

          </form>
        )
      )}

    </div>
  );
};
