import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Receipt, 
  MessageSquare, 
  Sparkles, 
  Calculator, 
  Star, 
  FileSpreadsheet, 
  Building2, 
  GraduationCap, 
  Compass, 
  Zap,
  ChevronRight,
  AlertCircle,
  Check,
  Headphones,
  BookOpen,
  Smartphone,
  FileText,
  Laptop,
  Users,
  Bell,
  Coins
} from 'lucide-react';
import { 
  BOARDS_LIST, 
  SSC_SUBJECTS, 
  generateAssistanceRequestWhatsappMessage, 
  getWhatsappDirectUrl 
} from '../data/boardsAndSubjects';
import { CustomerReview, EducationBoard } from '../types';
import { getAppSettings } from '../data/appSettings';

interface HomeViewProps {
  onStartApplication: () => void;
  onTrackOrder: () => void;
  onNavigateTab: (tab: string) => void;
}

const DEFAULT_REVIEWS: CustomerReview[] = [
  {
    id: 'rev-1',
    name: 'তানজিল আহমেদ',
    board: 'ঢাকা বোর্ড',
    rollMasked: '108***',
    commentBn: 'আবেদনী টিম থেকে একদম বিনামূল্যে অফিশিয়াল অনলাইন আবেদনের সঠিক নিয়ম জেনে নিয়েছি। পরে তাদের ৳49 সার্ভিস চার্জে খুব সহজে আবেদন করিয়ে নিলাম!',
    rating: 5,
    date: '২০২৬-০৮-০১'
  },
  {
    id: 'rev-2',
    name: 'ফারজানা আক্তার',
    board: 'চট্টগ্রাম বোর্ড',
    rollMasked: '241***',
    commentBn: 'কম্পিউটারের দোকানে লাইনে না দাঁড়িয়ে ঘরে বসেই মাত্র ৳49 সার্ভিস ফি দিয়ে অফিশিয়াল অনলাইন পোর্টালে সঠিকভাবে সাহায্য পেলাম। দারুণ সার্ভিস!',
    rating: 5,
    date: '২০২৬-০৮-০১'
  },
  {
    id: 'rev-3',
    name: 'মো: শরিফুল ইসলাম',
    board: 'রাজশাহী বোর্ড',
    rollMasked: '315***',
    commentBn: 'হোয়াটসঅ্যাপে সাথে সাথে রেসপন্স পেয়েছি। কোনো বিভ্রান্তি ছাড়াই অনলাইন পোর্টালে নিজে আবেদন করার নিয়ম স্পষ্ট করে বুঝিয়ে দিয়েছেন।',
    rating: 5,
    date: '২০২৬-০৮-০১'
  }
];

export const HomeView: React.FC<HomeViewProps> = ({
  onStartApplication,
  onTrackOrder,
  onNavigateTab,
}) => {
  const settings = getAppSettings();
  const [reviews, setReviews] = useState<CustomerReview[]>(DEFAULT_REVIEWS);

  // Form State for SSC 2026 Board Challenge Flow
  const [whatsappPhone, setWhatsappPhone] = useState('');
  const [selectedBoard, setSelectedBoard] = useState<EducationBoard>('DHA');
  const [selectedSubjectCodes, setSelectedSubjectCodes] = useState<string[]>([]);
  const [isSubjectDropdownOpen, setIsSubjectDropdownOpen] = useState(false);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    fetch('/api/reviews')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setReviews(data.map(r => ({ ...r, date: '২০২৬-০৮-০১' })));
        }
      })
      .catch(() => {});
  }, []);

  const serviceFee = settings.abedoniServiceFee || 49;
  const boardFeePerSubject = settings.officialBoardFee || 150;

  const toggleSubjectCode = (code: string) => {
    if (selectedSubjectCodes.includes(code)) {
      setSelectedSubjectCodes(selectedSubjectCodes.filter(c => c !== code));
    } else {
      setSelectedSubjectCodes([...selectedSubjectCodes, code]);
    }
  };

  const getSelectedSubjectNames = () => {
    return selectedSubjectCodes.map(code => {
      const subj = SSC_SUBJECTS.find(s => s.code === code);
      return subj ? `${subj.nameBn} (${subj.code})` : code;
    });
  };

  const handleConsultationClick = async (e: React.MouseEvent) => {
    setValidationError('');
    if (!whatsappPhone.trim() || whatsappPhone.trim().length < 11) {
      e.preventDefault();
      setValidationError('অনুগ্রহ করে সঠিক ১১ সংখ্যার হোয়াটসঅ্যাপ / মোবাইল নম্বর দিন।');
      return;
    }

    const boardObj = BOARDS_LIST.find(b => b.code === selectedBoard);
    const boardName = boardObj ? boardObj.nameBn : selectedBoard;
    const subjectNames = getSelectedSubjectNames();

    const totalAmt = selectedSubjectCodes.length > 0
      ? (selectedSubjectCodes.length * boardFeePerSubject) + serviceFee
      : 0;

    let leadId = '';
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: whatsappPhone.trim(),
          board: selectedBoard,
          subjects: selectedSubjectCodes,
          isLead: true,
          orderStatus: 'Pending Lead',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        leadId = data.order?.id || '';
      }
    } catch (err) {
      console.error('Failed to create lead record:', err);
    }

    const encodedMsg = generateAssistanceRequestWhatsappMessage(
      whatsappPhone,
      boardName,
      subjectNames,
      totalAmt
    );

    // Add Lead ID to WhatsApp message if generated
    let finalEncodedMsg = encodedMsg;
    if (leadId) {
      const decoded = decodeURIComponent(encodedMsg);
      const withLeadId = `${decoded}\n\n📌 **অর্ডার / লিড আইডি:** ${leadId}`;
      finalEncodedMsg = encodeURIComponent(withLeadId);
    }

    const targetUrl = getWhatsappDirectUrl(settings.whatsappNumber || '01577777092', finalEncodedMsg);
    
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-16 pb-20 font-bn">
      
      {/* 1. HERO SECTION & MOBILE-FIRST BOARD CHALLENGE PLATFORM */}
      <section className="relative overflow-hidden bg-white/80 backdrop-blur-2xl text-slate-900 rounded-2xl sm:rounded-[36px] p-3.5 sm:p-7 lg:p-10 shadow-xl border border-white/80">
        
        {/* Background Ambient Glows */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-gradient-to-tr from-emerald-400/20 to-teal-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-start">
          
          {/* Headline & Descriptions - On mobile, only the headline shows, descriptions show on lg: */}
          <div className="lg:col-span-6 space-y-2 sm:space-y-4 text-center lg:text-left">
            
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100/90 border border-blue-200 text-blue-900 text-xs font-bold shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>SSC 2026 Online Student Assistance</span>
            </div>

            <h1 className="text-lg sm:text-3xl lg:text-5xl font-black tracking-tight text-slate-900 leading-snug">
              SSC 2026 বোর্ড চ্যালেঞ্জ করতে চান?
            </h1>

            {/* Mobile Subtitle */}
            <p className="text-xs sm:text-sm text-slate-700 font-bold leading-relaxed">
              নিজে আবেদন করতে কোনো জটিলতা বা ভয় পাচ্ছেন? <br className="hidden sm:inline" />
              আবেদনী-এর অভিজ্ঞ দিয়ে আবেদন করান।
            </p>

            {/* Desktop Only Extra Descriptions */}
            <div className="hidden lg:block space-y-3 pt-1">
              <p className="text-slate-800 text-base font-extrabold leading-relaxed">
                WhatsApp-এ চ্যাট করে অভিজ্ঞদের সহায়তায় আপনার Board Challenge-এর প্রক্রিয়াটি সম্পন্ন করুন।
              </p>

              <p className="text-slate-600 text-sm leading-relaxed font-medium">
                আপনাকে একা একা কিছু বুঝে করতে হবে না। প্রয়োজনীয় তথ্য দেওয়ার পর আমাদের অভিজ্ঞ Support Team আপনাকে পুরো প্রক্রিয়ায় সহায়তা করবে।
              </p>

              {/* Quick Badges */}
              <div className="flex flex-wrap items-center justify-start gap-2 text-xs pt-1">
                <span className="bg-emerald-100 text-emerald-900 font-bold px-3 py-1 rounded-full border border-emerald-200">
                  ফ্রি অনলাইন নির্দেশিকা
                </span>
                <span className="bg-blue-100 text-blue-900 font-bold px-3 py-1 rounded-full border border-blue-200">
                  আবেদনী সার্ভিস চার্জ ৳{serviceFee}
                </span>
              </div>

              {/* Quick Secondary Navigation Action */}
              <div className="pt-2 flex flex-wrap items-center justify-start gap-3 text-xs">
                <button
                  onClick={onTrackOrder}
                  className="text-slate-700 hover:text-slate-900 font-bold underline flex items-center gap-1 cursor-pointer"
                >
                  <Receipt className="w-3.5 h-3.5 text-emerald-600" />
                  <span>পূর্বের আবেদনের স্ট্যাটাস</span>
                </button>
                <span className="text-slate-300">•</span>
                <button
                  onClick={() => onNavigateTab('pricing')}
                  className="text-slate-700 hover:text-slate-900 font-bold underline flex items-center gap-1 cursor-pointer"
                >
                  <Calculator className="w-3.5 h-3.5 text-blue-600" />
                  <span>ফি ও তথ্য তালিকা</span>
                </button>
              </div>
            </div>

          </div>

          {/* WhatsApp Interaction Box - Directly after title on mobile */}
          <div className="lg:col-span-6 bg-white p-3.5 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-lg space-y-3.5">
            
            <div className="border-b border-slate-100 pb-2.5 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 fill-emerald-600/20" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-sm sm:text-base font-black text-slate-900 leading-tight truncate">
                    অভিজ্ঞদের সহায়তা নিন
                  </h2>
                  <p className="text-[11px] sm:text-xs text-slate-600 font-medium leading-tight truncate mt-0.5">
                    হোয়াটসঅ্যাপে সহজে আপনার বোর্ড চ্যালেঞ্জ সম্পন্ন করুন
                  </p>
                </div>
              </div>
              <span className="hidden sm:inline-block bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-1 rounded-full border border-emerald-200 shrink-0">
                Service Charge ৳{serviceFee}
              </span>
            </div>

            {validationError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-2.5 rounded-xl flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            <div className="space-y-3 text-xs sm:text-sm">
              
              {/* Step 1: WhatsApp / Mobile Number Input */}
              <div>
                <label className="block font-bold text-slate-900 mb-1 text-xs sm:text-sm">
                  ১. হোয়াটসঅ্যাপ / মোবাইল নম্বর দিন *
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    maxLength={11}
                    placeholder="যেমন: 01712345678"
                    value={whatsappPhone}
                    onChange={(e) => {
                      setWhatsappPhone(e.target.value.replace(/[^0-9]/g, ''));
                      if (validationError) setValidationError('');
                    }}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-mono font-bold text-sm sm:text-base focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-900 shadow-2xs"
                  />
                  {whatsappPhone.trim().length === 11 && (
                    <div className="absolute right-3 top-2.5 bg-emerald-500 text-white rounded-full p-0.5">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </div>
              </div>

              {/* Progressive Steps: Subject & Board Choices when number is typed */}
              {whatsappPhone.trim().length >= 11 ? (
                <div className="space-y-3 pt-2 border-t border-slate-100 animate-in fade-in slide-in-from-top-2 duration-300">
                  
                  {/* Board Selection */}
                  <div>
                    <label className="block font-bold text-slate-900 mb-1">
                      ২. শিক্ষা বোর্ড নির্বাচন করুন *
                    </label>
                    <select
                      value={selectedBoard}
                      onChange={(e) => setSelectedBoard(e.target.value as EducationBoard)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-900 shadow-2xs cursor-pointer text-xs sm:text-sm"
                    >
                      {BOARDS_LIST.map(b => (
                        <option key={b.code} value={b.code}>{b.nameBn}</option>
                      ))}
                    </select>
                  </div>

                  {/* Subject Selection */}
                  <div>
                    <label className="block font-bold text-slate-900 mb-1 flex items-center justify-between">
                      <span>৩. যেসব বিষয়ে চ্যালেঞ্জ করতে চান (ঐচ্ছিক)</span>
                      <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        {selectedSubjectCodes.length}টি বিষয় নির্বাচিত
                      </span>
                    </label>

                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setIsSubjectDropdownOpen(!isSubjectDropdownOpen)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-left font-bold text-slate-800 hover:bg-slate-100 transition flex items-center justify-between cursor-pointer"
                      >
                        <span className="truncate">
                          {selectedSubjectCodes.length === 0
                            ? 'বিষয় নির্বাচন করতে ট্যাপ করুন...'
                            : getSelectedSubjectNames().join(', ')}
                        </span>
                        <ChevronRight className={`w-4 h-4 transition-transform ${isSubjectDropdownOpen ? 'rotate-90' : ''}`} />
                      </button>

                      {isSubjectDropdownOpen && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-30 p-2.5 max-h-52 overflow-y-auto space-y-1 animate-in fade-in">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 mb-1.5">
                            <span className="text-xs font-bold text-slate-800">বিষয় নির্বাচন তালিকা</span>
                            <button
                              type="button"
                              onClick={() => setIsSubjectDropdownOpen(false)}
                              className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded hover:bg-slate-200"
                            >
                              সম্পন্ন (Done)
                            </button>
                          </div>

                          {SSC_SUBJECTS.map(subj => {
                            const isSelected = selectedSubjectCodes.includes(subj.code);
                            return (
                              <div
                                key={subj.code}
                                onClick={() => toggleSubjectCode(subj.code)}
                                className={`p-1.5 rounded-lg text-xs font-bold border cursor-pointer transition flex items-center justify-between ${
                                  isSelected
                                    ? 'bg-emerald-50 text-emerald-950 border-emerald-300'
                                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                                }`}
                              >
                                <span>{subj.nameBn} ({subj.code})</span>
                                <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                                  isSelected ? 'bg-emerald-600 text-white border-emerald-600' : 'border-slate-300'
                                }`}>
                                  {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Financial Breakdown Note */}
                  <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl space-y-1 text-xs">
                    <div className="flex justify-between items-center text-slate-600">
                      <span>অফিশিয়াল বোর্ড ফি (বোর্ডের পাওনা):</span>
                      <span className="font-mono font-bold text-slate-900">৳{boardFeePerSubject} / বিষয়</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-600">
                      <span>আবেদনী সার্ভিস চার্জ (অনলাইন সহায়তা):</span>
                      <span className="font-mono font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">৳{serviceFee}</span>
                    </div>
                  </div>

                  {/* Trigger WhatsApp Action */}
                  <button
                    type="button"
                    onClick={handleConsultationClick}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-2.5 px-4 rounded-xl text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-600/20"
                  >
                    <MessageSquare className="w-4 h-4 fill-white/20" />
                    <span>অভিজ্ঞদের সাথে কথা বলুন (WhatsApp)</span>
                  </button>

                </div>
              ) : (
                /* Hint when mobile user hasn't typed 11 digits yet */
                <div className="space-y-2.5 pt-1">
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    আপনাকে একা একা কিছু বুঝে করতে হবে না। আপনার হোয়াটসঅ্যাপ নম্বরটি দিলেই আমাদের অভিজ্ঞ Support Team আপনাকে পুরো প্রক্রিয়ায় সহায়তা করবে।
                  </p>

                  <button
                    type="button"
                    onClick={(e) => {
                      if (!whatsappPhone || whatsappPhone.length < 11) {
                        setValidationError('অনুগ্রহ করে আপনার ১১ সংখ্যার হোয়াটসঅ্যাপ নম্বরটি সঠিকভাবে লিখুন।');
                      } else {
                        handleConsultationClick(e);
                      }
                    }}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-2.5 px-4 rounded-xl text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <MessageSquare className="w-4 h-4 fill-white/20" />
                    <span>অভিজ্ঞদের সাথে চ্যাট শুরু করুন (WhatsApp)</span>
                  </button>
                </div>
              )}

            </div>

          </div>

        </div>

      </section>

      {/* 2. WHY CHOOSE ABEDONI ASSISTANCE - CLEAN LUCIDE ICONS */}
      <section className="bg-white/70 backdrop-blur-2xl rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-white/80 shadow-xl space-y-5">
        <div className="text-center space-y-1.5 max-w-2xl mx-auto">
          <span className="bg-blue-100 text-blue-900 text-xs font-bold px-2.5 py-0.5 rounded-full border border-blue-200">
            Abedoni Digital Benefits
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            আমাদের সাথে করলে সুবিধা কী?
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm font-medium">
            ঘরে বসেই কোনো ঝামেলা ছাড়াই অভিজ্ঞ সাপোর্ট টিমের সহায়তায় নির্ভুল আবেদনের গ্যারান্টি
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          
          {/* Benefit 1 */}
          <div className="bg-white p-4 rounded-xl sm:rounded-2xl border border-slate-200 shadow-2xs space-y-2 hover:border-emerald-300 transition">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <Smartphone className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-xs sm:text-sm">WhatsApp-এ সরাসরি যোগাযোগ</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              প্রয়োজনীয় তথ্য নিয়ে আমরা আপনাকে সরাসরি মেসেজে প্রতি ধাপে গাইড করব।
            </p>
          </div>

          {/* Benefit 2 */}
          <div className="bg-white p-4 rounded-xl sm:rounded-2xl border border-slate-200 shadow-2xs space-y-2 hover:border-emerald-300 transition">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-xs sm:text-sm">প্রয়োজনীয় তথ্য গ্রহণ</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              রোল ও রেজিস্ট্রেশন নম্বরসহ প্রয়োজনীয় তথ্য আমরা নেব এবং আপনার দেওয়া তথ্য অনুযায়ী প্রসেসিং সম্পন্ন করব।
            </p>
          </div>

          {/* Benefit 3 */}
          <div className="bg-white p-4 rounded-xl sm:rounded-2xl border border-slate-200 shadow-2xs space-y-2 hover:border-emerald-300 transition">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                <Laptop className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-xs sm:text-sm">দোকানে যাওয়ার প্রয়োজন নেই</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              কম্পিউটারের দোকানে দীর্ঘ লাইনে দাঁড়ানোর প্রয়োজন নেই — ঘরে বসেই মোবাইল দিয়ে সহায়তা নিতে পারবেন।
            </p>
          </div>

          {/* Benefit 4 */}
          <div className="bg-white p-4 rounded-xl sm:rounded-2xl border border-slate-200 shadow-2xs space-y-2 hover:border-emerald-300 transition">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-xs sm:text-sm">অভিজ্ঞ Support Team</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              কোথায় কী করতে হবে তা নিয়ে কোনো চিন্তা করতে হবে না, আমাদের এক্সপার্ট টিম তা সামলাবে।
            </p>
          </div>

          {/* Benefit 5 */}
          <div className="bg-white p-4 rounded-xl sm:rounded-2xl border border-slate-200 shadow-2xs space-y-2 hover:border-emerald-300 transition">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                <Bell className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-xs sm:text-sm">আবেদন-সংক্রান্ত সার্বিক সহায়তা</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              প্রক্রিয়া সম্পন্ন হওয়ার পরও ট্র্যাকিং ও অন্যান্য প্রয়োজনে যেকোনো সময় আমাদের সাথে যোগাযোগ করতে পারবেন।
            </p>
          </div>

          {/* Benefit 6 */}
          <div className="bg-slate-900 text-white p-4 rounded-xl sm:rounded-2xl border border-slate-800 shadow-2xs space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                <Coins className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-emerald-400 text-xs sm:text-sm">স্বচ্ছ Service Charge — মাত্র ৳{serviceFee}</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              এটি শুধুমাত্র Abedoni-এর নিজস্ব assistance/service charge। সরকারি বোর্ড ফি আলাদা পরিশোধযোগ্য।
            </p>
          </div>

        </div>
      </section>

      {/* 2. FREE VS OPTIONAL ASSISTED SERVICE COMPARISON */}
      <section className="bg-white/60 backdrop-blur-2xl rounded-[32px] p-6 sm:p-10 border border-white/80 shadow-xl space-y-6">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="bg-blue-100 text-blue-900 text-xs font-black px-3 py-1 rounded-full border border-blue-200">
            স্বচ্ছ সেবানীতি
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            ফ্রি অনলাইন গাইড বনাম ৳{serviceFee} অ্যাসিস্টেড সার্ভিস
          </h2>
          <p className="text-slate-600 text-sm">
            আবেদনী শিক্ষার্থীদের সার্বক্ষণিক সহায়তায় নিবেদিত। কীভাবে নিজ থেকে অফিশিয়াল অনলাইন পোর্টালে আবেদন করবেন তা সম্পূর্ণ ফ্রি।
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Free Guidance Card */}
          <div className="bg-emerald-50/80 border-2 border-emerald-200 p-6 rounded-3xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 bg-emerald-600 text-white rounded-2xl flex items-center justify-center font-bold">
                <BookOpen className="w-6 h-6" />
              </div>
              <span className="bg-emerald-600 text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
                ১০০% ফ্রি গাইড
              </span>
            </div>

            <h3 className="text-xl font-bold text-emerald-950">
              ফ্রি অনলাইন আবেদন নির্দেশিকা
            </h3>

            <p className="text-xs sm:text-sm text-emerald-900 leading-relaxed font-medium">
              অফিশিয়াল পোর্টালে নিজে আবেদনের পদ্ধতি জেনে সম্পূর্ণ নিজ দায়িত্বে ফ্রি আবেদন করুন।
            </p>

            <ul className="space-y-2 text-xs sm:text-sm text-emerald-900 pt-2 border-t border-emerald-200/80">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-700 shrink-0 stroke-[3]" />
                <span>অফিশিয়াল রেজাল্ট পুনঃনিরীক্ষণ অনলাইন পোর্টালে প্রবেশের লিংক</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-700 shrink-0 stroke-[3]" />
                <span>বোর্ড ফি (৳{boardFeePerSubject}/বিষয়) ও ধাপসমূহের বিস্তারিত তথ্য</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-700 shrink-0 stroke-[3]" />
                <span>স্বয়ংক্রিয় ফি ক্যালকুলেটর সার্ভিস</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-700 shrink-0 stroke-[3]" />
                <span>হোয়াটসঅ্যাপে পরামর্শ ও দিকনির্দেশনা</span>
              </li>
            </ul>
          </div>

          {/* Optional Assisted Service Card */}
          <div className="bg-slate-900 text-white border-2 border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 bg-blue-500 text-white rounded-2xl flex items-center justify-center font-bold">
                <Headphones className="w-6 h-6" />
              </div>
              <span className="bg-blue-600 text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
                সহায়তা সার্ভিস (৳{serviceFee})
              </span>
            </div>

            <h3 className="text-xl font-bold text-white">
              আবেদনী অনলাইন সাপোর্ট সার্ভিস
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              অনলাইনে নিজে আবেদনের ঝক্কি এড়াতে এবং ভুল এড়িয়ে নির্ভুল আবেদন সম্পন্ন করতে।
            </p>

            <ul className="space-y-2 text-xs sm:text-sm text-slate-300 pt-2 border-t border-slate-800">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 stroke-[3]" />
                <span>আবেদনী অভিজ্ঞ সাপোর্ট টিমের মাধ্যমে ডেটা প্রসেসিং</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 stroke-[3]" />
                <span>বিকাশ/নগদ/রকেট/বাংলা QR দিয়ে সহজ সার্ভিস ফি প্রদান</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 stroke-[3]" />
                <span>তাত্ক্ষণিক ডিজিটাল রসিদ ও অনলাইন স্ট্যাটাস ট্র্যাকিং</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 stroke-[3]" />
                <span>হোয়াটসঅ্যাপে প্রতিনিয়ত আপডেট ও সহায়তা</span>
              </li>
            </ul>
          </div>

        </div>
      </section>

      {/* 3. STEP-BY-STEP WORKFLOW */}
      <section className="bg-slate-900/90 backdrop-blur-2xl text-white rounded-[32px] p-6 sm:p-10 space-y-8 border border-slate-800 shadow-2xl">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-emerald-400 font-bold text-xs uppercase tracking-wider">সহজ ৪টি ধাপ</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            সহায়তা সেবায় যেভাবে কাজ সম্পন্ন হবে
          </h2>
          <p className="text-slate-400 text-sm">
            মাত্র ৫ মিনিটে যেকোনো স্থান থেকে নিশ্চিন্তে সুবিধা নিন।
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          
          <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/10 space-y-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-black flex items-center justify-center text-sm shadow-md">
              ১
            </div>
            <h3 className="text-base font-bold text-white">তথ্য দিন</h3>
            <p className="text-slate-300 text-xs leading-relaxed">
              আপনার শিক্ষা বোর্ড, রোল, রেজিস্ট্রেশন নম্বর ও বিষয়ের নাম নির্বাচন করুন।
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/10 space-y-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-black flex items-center justify-center text-sm shadow-md">
              ২
            </div>
            <h3 className="text-base font-bold text-white">ফি প্রদান করুন</h3>
            <p className="text-slate-300 text-xs leading-relaxed">
              অফিশিয়াল বোর্ড ফি + ৳{serviceFee} সার্ভিস ফি বিকাশ, নগদ বা বাংলা QR-এ দিন।
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/10 space-y-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-600 text-white font-black flex items-center justify-center text-sm shadow-md">
              ৩
            </div>
            <h3 className="text-base font-bold text-white">অনলাইন প্রসেসিং</h3>
            <p className="text-slate-300 text-xs leading-relaxed">
              আমাদের অভিজ্ঞ অনলাইন টিম অফিশিয়াল পোর্টালে আপনার আবেদন প্রসেস করবে।
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/10 space-y-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 font-black flex items-center justify-center text-sm shadow-md">
              ৪
            </div>
            <h3 className="text-base font-bold text-white">রসিদ ও কনফার্মেশন</h3>
            <p className="text-slate-300 text-xs leading-relaxed">
              লাইভ ডিজিটাল রসিদ পাবেন এবং হোয়াটসঅ্যাপে সব তথ্য আপডেট পেয়ে যাবেন।
            </p>
          </div>

        </div>

        <div className="text-center pt-2">
          <button
            onClick={onStartApplication}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-8 py-3.5 rounded-2xl text-sm transition-all shadow-lg cursor-pointer inline-flex items-center gap-2"
          >
            <span>অনলাইন গাইড / সহায়তা সেবা বেছে নিন</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* 4. STUDENT REVIEWS */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-200/60 pb-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">শিক্ষার্থীদের অভিজ্ঞতা ও মতামত</h2>
            <p className="text-slate-600 text-xs sm:text-sm">এসএসসি ২০২৬ বোর্ডের খাতা পুনঃনিরীক্ষণের ডিজিটাল সার্ভিস ব্যবহারকারীদের প্রতিক্রিয়া</p>
          </div>
          <div className="flex items-center gap-1 bg-amber-100/80 text-amber-900 px-3.5 py-1.5 rounded-full border border-amber-200 text-xs font-bold shadow-xs">
            <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
            <span>৪.৯ / ৫.০ (১০,০০০+ শিক্ষার্থী)</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map(rev => (
            <div key={rev.id} className="bg-white/50 backdrop-blur-xl p-5 rounded-3xl border border-white/60 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{rev.name}</h4>
                  <p className="text-[11px] text-slate-500">{rev.board} • রোল: {rev.rollMasked}</p>
                </div>
                <div className="flex text-amber-400">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                  ))}
                </div>
              </div>
              <p className="text-slate-700 text-xs leading-relaxed italic">
                "{rev.commentBn}"
              </p>
              <p className="text-[10px] text-slate-400 font-medium">{rev.date}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. FUTURE VISION & ROADMAP */}
      <section className="bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-900 text-white rounded-3xl p-8 sm:p-12 space-y-6">
        <div className="max-w-3xl space-y-3">
          <span className="text-emerald-400 font-bold text-xs uppercase tracking-wider">ভবিষ্যৎ পরিকল্পনা</span>
          <h2 className="text-2xl sm:text-4xl font-black text-white">
            বাংলাদেশের এক নম্বর অনলাইন স্টুডেন্ট অ্যাসিস্ট্যান্স প্ল্যাটফর্ম
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            আবেদনী শিক্ষার্থীদের সার্বিক সুবিধায় সবসময় পাশে রয়েছে। খুব শীঘ্রই ভর্তি পরীক্ষা, সরকারি আবেদন, এবং অন্যান্য অনলাইন সেবা নিয়ে বিস্তৃত পরিসরে আসছে আবেদনী।
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
            <span>ড্রাইভিং লাইসেন্স ও স্কলারশিপ</span>
          </div>
        </div>
      </section>

    </div>
  );
};
