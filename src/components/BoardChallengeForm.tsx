import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Copy, 
  Check, 
  Receipt as ReceiptIcon, 
  Send, 
  MessageSquare, 
  Sparkles, 
  CreditCard, 
  ShieldCheck, 
  AlertCircle,
  Download,
  Printer,
  X,
  QrCode
} from 'lucide-react';
import { BOARDS_LIST, SSC_SUBJECTS, generateStudentWhatsappMessage, getWhatsappDirectUrl } from '../data/boardsAndSubjects';
import { BoardChallengeOrder, EducationBoard, ExamType, PaymentMethod } from '../types';
import { getAppSettings } from '../data/appSettings';

interface BoardChallengeFormProps {
  onOrderCompleted: (order: BoardChallengeOrder) => void;
  onTrackOrderClick: () => void;
}

export const BoardChallengeForm: React.FC<BoardChallengeFormProps> = ({
  onOrderCompleted,
  onTrackOrderClick,
}) => {
  const settings = getAppSettings();

  // Step state
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [completedOrder, setCompletedOrder] = useState<BoardChallengeOrder | null>(null);

  // Trigger success confetti animation on reaching receipt step
  useEffect(() => {
    if (currentStep === 4) {
      try {
        // First confetti cannon
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#2563eb', '#059669', '#d97706', '#7c3aed', '#ec4899', '#3b82f6']
        });
        // Dual side burst after 250ms
        const timer = setTimeout(() => {
          confetti({
            particleCount: 80,
            angle: 60,
            spread: 60,
            origin: { x: 0, y: 0.7 },
            colors: ['#059669', '#10b981', '#34d399', '#f59e0b']
          });
          confetti({
            particleCount: 80,
            angle: 120,
            spread: 60,
            origin: { x: 1, y: 0.7 },
            colors: ['#2563eb', '#3b82f6', '#60a5fa', '#f59e0b']
          });
        }, 250);
        return () => clearTimeout(timer);
      } catch (e) {
        console.error('Confetti animation error:', e);
      }
    }
  }, [currentStep]);

  // Form fields (Strictly 5 simple fields as requested)
  const [studentName, setStudentName] = useState('');
  const [board, setBoard] = useState<EducationBoard>('DHA');
  const [roll, setRoll] = useState('');
  const [reg, setReg] = useState('');
  const [phone, setPhone] = useState('');
  const [isAgreedToTerms, setIsAgreedToTerms] = useState<boolean>(false);

  // Selected Subject Codes
  const [selectedSubjectCodes, setSelectedSubjectCodes] = useState<string[]>([]);

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Bangla QR');
  const [paymentSenderPhone, setPaymentSenderPhone] = useState('');
  const [trxId, setTrxId] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showEnlargedQr, setShowEnlargedQr] = useState<boolean>(false);

  // Fee Calculations
  const boardFeePerSub = settings.officialBoardFee || 175;
  const platformFee = settings.abedoniServiceFee || 99;
  const officialFee = selectedSubjectCodes.length * boardFeePerSub;
  const smsFeeTotal = selectedSubjectCodes.length > 0 ? (settings.smsFeePerSubject || 6) : 0;
  const totalFee = officialFee + smsFeeTotal + platformFee;

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleToggleSubject = (code: string) => {
    if (selectedSubjectCodes.includes(code)) {
      setSelectedSubjectCodes(selectedSubjectCodes.filter(c => c !== code));
    } else {
      setSelectedSubjectCodes([...selectedSubjectCodes, code]);
    }
  };

  const validateStep1 = () => {
    if (!studentName.trim()) return 'শিক্ষার্থীর নাম ফিল্ড পূরণ করুন।';
    if (!board) return 'শিক্ষা বোর্ড নির্বাচন করুন।';
    if (!roll.trim() || roll.length < 5) return 'সঠিক রোল নম্বর দিন।';
    if (!reg.trim() || reg.length < 8) return 'সঠিক রেজিস্ট্রেশন নম্বর দিন।';
    if (!phone.trim() || phone.length < 11) return 'সঠিক ১১ সংখ্যার মোবাইল নম্বর দিন (অফিশিয়াল SMS এর জন্য)।';
    if (!isAgreedToTerms) return 'অনুগ্রহ করে আবেদনের তথ্য ও অনুমতি বিষয়ক টিক মার্কটিতে টিক দিন।';
    return null;
  };

  const validateStep3 = () => {
    if (!paymentSenderPhone.trim() || paymentSenderPhone.length < 11) {
      return 'যে মোবাইল নম্বর থেকে পেমেন্ট করেছেন তা সঠিক ১১ সংখ্যায় লিখুন।';
    }
    if (!trxId.trim() || trxId.length < 4) {
      return 'সঠিক পেমেন্ট ট্রানজেকশন আইডি (TrxID) দিন।';
    }
    return null;
  };

  const handleNextStep = () => {
    setErrorMessage('');
    if (currentStep === 1) {
      const err = validateStep1();
      if (err) {
        setErrorMessage(err);
        return;
      }
      if (!paymentSenderPhone.trim()) setPaymentSenderPhone(phone);
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (selectedSubjectCodes.length === 0) {
        setErrorMessage('কমপক্ষে ১টি বিষয় নির্বাচন করুন।');
        return;
      }
      setCurrentStep(3);
    }
  };

  const getPaymentNumber = (method: PaymentMethod) => {
    if (method === 'Bangla QR') return settings.bkashNumber;
    if (method === 'bKash') return settings.bkashNumber;
    if (method === 'Nagad') return settings.nagadNumber;
    return settings.rocketNumber || settings.bkashNumber;
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const err = validateStep3();
    if (err) {
      setErrorMessage(err);
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        studentName,
        roll,
        reg,
        board,
        phone,
        whatsapp: phone,
        subjects: selectedSubjectCodes,
        paymentMethod,
        paymentSenderPhone,
        trxId,
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'আবেদন জমা দিতে সমস্যা হয়েছে।');
      }

      setCompletedOrder(data.order);
      onOrderCompleted(data.order);
      setCurrentStep(4); // Receipt step
    } catch (error: any) {
      setErrorMessage(error.message || 'নেটওয়ার্ক এরর! অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-20 font-bn">
      
      {/* Title */}
      <div className="text-center space-y-2">
        <span className="bg-blue-100/90 text-blue-800 text-xs font-bold px-3 py-1 rounded-full border border-blue-200">
          SSC Board Challenge 2026 Portal
        </span>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900">
          বোর্ড চ্যালেঞ্জ ফরম
        </h1>
        <p className="text-slate-600 text-xs sm:text-sm">
          সঠিক তথ্য দিয়ে ফরম পূরণ করুন। মাত্র ৫ মিনিটে ডিজিটাল রসিদ পেয়ে যাবেন।
        </p>
      </div>

      {/* Step Indicator */}
      <div className="bg-white/50 backdrop-blur-xl p-4 sm:p-5 rounded-3xl border border-white/80 shadow-md flex items-center justify-between text-xs sm:text-sm font-semibold">
        <div className={`flex items-center gap-2 ${currentStep >= 1 ? 'text-blue-700 font-bold' : 'text-slate-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs shadow-xs ${currentStep >= 1 ? 'bg-blue-600 text-white font-black' : 'bg-white/60 text-slate-500'}`}>১</div>
          <span className="hidden sm:inline">শিক্ষার্থীর তথ্য</span>
        </div>
        <div className="h-0.5 w-6 sm:w-12 bg-slate-200" />
        <div className={`flex items-center gap-2 ${currentStep >= 2 ? 'text-blue-700 font-bold' : 'text-slate-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs shadow-xs ${currentStep >= 2 ? 'bg-blue-600 text-white font-black' : 'bg-white/60 text-slate-500'}`}>২</div>
          <span className="hidden sm:inline">বিষয় নির্বাচন</span>
        </div>
        <div className="h-0.5 w-6 sm:w-12 bg-slate-200" />
        <div className={`flex items-center gap-2 ${currentStep >= 3 ? 'text-blue-700 font-bold' : 'text-slate-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs shadow-xs ${currentStep >= 3 ? 'bg-blue-600 text-white font-black' : 'bg-white/60 text-slate-500'}`}>৩</div>
          <span className="hidden sm:inline">পেমেন্ট</span>
        </div>
        <div className="h-0.5 w-6 sm:w-12 bg-slate-200" />
        <div className={`flex items-center gap-2 ${currentStep === 4 ? 'text-emerald-700 font-bold' : 'text-slate-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs shadow-xs ${currentStep === 4 ? 'bg-emerald-600 text-white font-black' : 'bg-white/60 text-slate-500'}`}>৪</div>
          <span className="hidden sm:inline">ডিজিটাল রসিদ</span>
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="bg-rose-50/90 backdrop-blur-md border border-rose-200 text-rose-800 text-xs sm:text-sm p-4 rounded-2xl flex items-center gap-2 shadow-xs">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* STEP 1: STUDENT PERSONAL & ACADEMIC INFO (ONLY 5 REQUESTED FIELDS) */}
      {currentStep === 1 && (
        <div className="bg-white/60 backdrop-blur-2xl p-6 sm:p-8 rounded-[32px] border border-white/80 shadow-xl space-y-6">
          <h2 className="text-xl font-bold text-slate-900 border-b border-slate-200/60 pb-3 flex items-center gap-2">
            <span className="w-2 h-6 bg-blue-600 rounded-full" />
            শিক্ষার্থীর প্রয়োজনীয় তথ্যসমূহ
          </h2>

          <div className="space-y-4 text-xs sm:text-sm">
            
            {/* 1. শিক্ষার্থীর নাম */}
            <div>
              <label className="block font-bold text-slate-800 mb-1">১. শিক্ষার্থীর নাম *</label>
              <input
                type="text"
                required
                placeholder="যেমন: তানভীর আহমেদ মাহিন"
                value={studentName}
                onChange={e => setStudentName(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-2xl p-3.5 focus:ring-2 focus:ring-blue-500 shadow-xs text-slate-900"
              />
            </div>

            {/* 2. শিক্ষা বোর্ড */}
            <div>
              <label className="block font-bold text-slate-800 mb-1">২. শিক্ষা বোর্ড *</label>
              <select
                value={board}
                onChange={e => setBoard(e.target.value as EducationBoard)}
                className="w-full bg-white border border-slate-300 rounded-2xl p-3.5 focus:ring-2 focus:ring-blue-500 shadow-xs text-slate-900 font-medium"
              >
                {BOARDS_LIST.map(b => (
                  <option key={b.code} value={b.code}>{b.nameBn}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* 3. রোল নম্বর */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">৩. রোল নম্বর (Roll No) *</label>
                <input
                  type="text"
                  required
                  maxLength={8}
                  placeholder="যেমন: 142850"
                  value={roll}
                  onChange={e => setRoll(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full bg-white border border-slate-300 rounded-2xl p-3.5 font-mono font-bold focus:ring-2 focus:ring-blue-500 shadow-xs text-slate-900"
                />
              </div>

              {/* 4. রেজিস্ট্রেশন নম্বর */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">৪. রেজিস্ট্রেশন নম্বর (Reg No) *</label>
                <input
                  type="text"
                  required
                  maxLength={12}
                  placeholder="যেমন: 1912408392"
                  value={reg}
                  onChange={e => setReg(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full bg-white border border-slate-300 rounded-2xl p-3.5 font-mono font-bold focus:ring-2 focus:ring-blue-500 shadow-xs text-slate-900"
                />
              </div>
            </div>

            {/* 5. মোবাইল নম্বর (অফিশিয়াল SMS ও WhatsApp এর জন্য) */}
            <div>
              <label className="block font-bold text-slate-800 mb-1">৫. মোবাইল নম্বর * (অফিশিয়াল SMS ও WhatsApp আপডেট পেতে)</label>
              <input
                type="tel"
                required
                maxLength={11}
                placeholder="যেমন: 01712345678"
                value={phone}
                onChange={e => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                className="w-full bg-white border border-slate-300 rounded-2xl p-3.5 font-mono font-bold focus:ring-2 focus:ring-blue-500 shadow-xs text-slate-900"
              />
              <p className="text-[11px] text-slate-500 mt-1 font-bold">
                আবেদনের অগ্রগতি, অফিশিয়াল মেসেজ ও স্ক্রিনশট প্রুফ পেতে অবশ্যই আপনার সচল হোয়াটসঅ্যাপ (WhatsApp) নম্বর দিন।
              </p>
            </div>

            {/* Interactive Terms & Authorization Checkbox */}
            <div className="pt-2">
              <label className={`flex items-start gap-3 p-4 rounded-2xl border transition cursor-pointer ${
                isAgreedToTerms 
                  ? 'bg-blue-50/90 border-blue-300 ring-2 ring-blue-500/20 shadow-2xs' 
                  : 'bg-amber-50/90 border-amber-300 hover:bg-amber-100/80 shadow-2xs'
              }`}>
                <input
                  type="checkbox"
                  checked={isAgreedToTerms}
                  onChange={e => setIsAgreedToTerms(e.target.checked)}
                  className="w-5 h-5 mt-0.5 text-blue-600 rounded border-slate-300 focus:ring-blue-500 shrink-0 cursor-pointer"
                />
                <span className="text-xs sm:text-sm text-slate-900 font-bold leading-relaxed select-none">
                  আমি নিশ্চিত করছি যে, আমার দেওয়া তথ্য সঠিক এবং আমার পক্ষ থেকে আবেদন করার জন্য আবেদনীকে অনুমতি দিচ্ছি। ভুল তথ্যের কারণে বোর্ডের আবেদন ব্যর্থ হলে প্ল্যাটফর্ম দায়ী থাকবে না।
                </span>
              </label>
            </div>

          </div>

          <div className="pt-4 flex justify-end">
            <button
              onClick={handleNextStep}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3.5 rounded-2xl text-sm transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-blue-600/25"
            >
              <span>পরবর্তী ধাপ: বিষয় নির্বাচন</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: SUBJECT SELECTION */}
      {currentStep === 2 && (
        <div className="bg-white/60 backdrop-blur-2xl p-6 sm:p-8 rounded-[32px] border border-white/80 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2 h-6 bg-blue-600 rounded-full" />
              যেসব বিষয় চ্যালেঞ্জ করতে চান সিলেক্ট করুন
            </h2>
            <span className="text-xs bg-blue-100 text-blue-800 font-bold px-3 py-1 rounded-full border border-blue-200">
              {selectedSubjectCodes.length}টি সিলেক্টেড
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
            {SSC_SUBJECTS.map(subj => {
              const isSelected = selectedSubjectCodes.includes(subj.code);
              return (
                <div
                  key={subj.code}
                  onClick={() => handleToggleSubject(subj.code)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-md'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="space-y-0.5">
                    <p className="text-xs sm:text-sm leading-snug">{subj.nameBn}</p>
                    <p className={`text-[11px] font-mono ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>
                      কোড: {subj.code} • বোর্ড ফি: ৳{boardFeePerSub}
                    </p>
                  </div>
                  <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${
                    isSelected ? 'bg-white text-blue-600 border-white' : 'border-slate-300'
                  }`}>
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Fee Calculation Card */}
          <div className="bg-slate-900 text-white p-6 rounded-2xl space-y-3 border border-slate-800 shadow-lg">
            <h3 className="text-xs font-extrabold text-emerald-400 uppercase tracking-wider">
              ফি অটো ক্যালকুলেশন (Auto Fee Breakdown)
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>অফিশিয়াল বোর্ড ফি ({selectedSubjectCodes.length} বিষয় × ৳{boardFeePerSub}):</span>
                <span className="font-mono font-bold text-white">৳{officialFee}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>SMS চার্জ (২টি SMS × ৳৩):</span>
                <span className="font-mono font-bold text-amber-300">৳{smsFeeTotal}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>আবেদনী সার্ভিস ফি (Abedoni Service Fee):</span>
                <span className="font-mono font-bold text-emerald-400">৳{platformFee}</span>
              </div>
              <div className="border-t border-slate-800 pt-2 flex justify-between text-sm sm:text-base font-bold text-emerald-400">
                <span>সর্বমোট পরিশোধযোগ্য ফি:</span>
                <span className="font-mono text-lg text-white font-black">৳{totalFee}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => setCurrentStep(1)}
              className="text-slate-600 hover:text-slate-900 font-medium text-xs sm:text-sm flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>পূর্ববর্তী ধাপ</span>
            </button>

            <button
              onClick={handleNextStep}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3.5 rounded-2xl text-sm transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-blue-600/25"
            >
              <span>পেমেন্ট ধাপে যান (৳{totalFee})</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: PAYMENT METHOD & TRANSACTION ID */}
      {currentStep === 3 && (
        <form onSubmit={handleSubmitOrder} className="bg-white p-3.5 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xl space-y-3.5 sm:space-y-5 font-bn">
          
          {/* Header & Total Fee Summary Bar (Payment Gateway Style) */}
          <div className="flex items-center justify-between bg-slate-900 text-white p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-xs">
            <div className="space-y-0.5">
              <span className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider block">
                SSL/MFS পেমেন্ট গেটওয়ে
              </span>
              <h2 className="text-sm sm:text-base font-black text-white flex items-center gap-1.5">
                <span>পেমেন্ট ও অর্ডার সাবমিশন</span>
              </h2>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-emerald-400 font-bold block">{selectedSubjectCodes.length}টি বিষয়</span>
              <span className="text-lg sm:text-2xl font-black text-emerald-400 font-mono leading-none">৳{totalFee} BDT</span>
            </div>
          </div>

          {/* Payment Method Selector Grid (4 cols single row on mobile) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800 flex items-center justify-between">
              <span>পেমেন্ট মাধ্যম নির্বাচন করুন *</span>
              <span className="text-[10px] text-slate-500 font-normal">১টি সিলেক্ট করুন</span>
            </label>
            <div className="grid grid-cols-4 gap-1.5 sm:gap-2.5">
              {[
                { 
                  id: 'Bangla QR', 
                  name: 'বাংলা QR', 
                  logo: 'https://upload.wikimedia.org/wikipedia/commons/4/4c/Bangla_QR_Logo.svg' 
                },
                { 
                  id: 'bKash', 
                  name: 'bKash', 
                  logo: 'https://upload.wikimedia.org/wikipedia/en/6/68/BKash_logo.svg' 
                },
                { 
                  id: 'Nagad', 
                  name: 'Nagad', 
                  logo: 'https://upload.wikimedia.org/wikipedia/bn/9/97/%E0%A6%A8%E0%A6%97%E0%A6%A6%E0%A7%87%E0%A6%B0_%E0%A6%B2%E0%A7%8B%E0%A6%97%E0%A7%8B.svg' 
                },
                { 
                  id: 'Rocket', 
                  name: 'Rocket', 
                  logo: 'https://upload.wikimedia.org/wikipedia/commons/4/45/Rocket_mobile_banking_logo.svg' 
                },
              ].map(item => {
                const pm = item.id as PaymentMethod;
                const isSelected = paymentMethod === pm;
                return (
                  <button
                    key={pm}
                    type="button"
                    onClick={() => setPaymentMethod(pm)}
                    className={`p-1.5 sm:p-2.5 rounded-xl text-[11px] sm:text-xs font-bold border transition-all flex flex-col items-center justify-center gap-1 cursor-pointer relative ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-slate-800/30'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {pm === 'Bangla QR' && (
                      <span className="absolute -top-2 bg-emerald-600 text-white text-[8px] font-black px-1.5 py-0.2 rounded-full uppercase tracking-wider shadow-xs">
                        QR
                      </span>
                    )}
                    <div className="h-6 sm:h-8 w-full bg-white p-0.5 rounded-lg flex items-center justify-center border border-slate-100 shadow-2xs">
                      <img 
                        src={item.logo} 
                        alt={pm} 
                        className="max-h-5 sm:max-h-6 max-w-full object-contain" 
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <span className="truncate w-full text-center leading-tight">{item.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Instructions for Selected Payment Method */}
          {paymentMethod === 'Bangla QR' ? (
            <div className="bg-slate-50 p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200 space-y-3.5 text-xs">
              
              {/* Trust & Verified Badge with soft glow */}
              <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-300/80 p-2.5 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.12)] flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="p-1 bg-emerald-600 text-white rounded-lg shadow-xs animate-bounce">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-black text-emerald-900 text-xs sm:text-sm block leading-tight">
                      বাংলাদেশ ব্যাংক অনুমোদিত ও ভেরিফাইড পেমেন্ট মেথড
                    </span>
                    <span className="text-[10px] sm:text-xs text-emerald-800 font-bold block">
                      <b>১০০% নিরাপদ, ১০০% সরকারি ব্যাংকিং প্রটোকল সমর্থিত</b>
                    </span>
                  </div>
                </div>

                <span className="bg-emerald-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                  Verified Official QR
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                <div className="flex items-center gap-2">
                  <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/4/4c/Bangla_QR_Logo.svg" 
                    alt="Bangla QR Logo" 
                    className="h-7 sm:h-8 w-auto object-contain bg-white p-0.5 rounded border border-slate-200" 
                  />
                  <div>
                    <span className="font-bold text-slate-900 text-xs sm:text-sm block leading-tight">বাংলা QR - ইনস্ট্যান্ট স্ক্যান পেমেন্ট</span>
                    <span className="text-[10px] text-slate-500 block leading-tight">সকল MFS (bKash, Nagad, Rocket) & Bank Apps সমর্থিত</span>
                  </div>
                </div>

                <div className="bg-emerald-100 text-emerald-900 border border-emerald-300 px-2.5 py-1 rounded-full text-[11px] font-black shrink-0">
                  ৳{totalFee} BDT
                </div>
              </div>

              {/* QR Image Display */}
              <div className="flex flex-col md:flex-row items-center gap-4 sm:gap-6 bg-white p-3.5 sm:p-5 rounded-xl border border-slate-200 shadow-2xs">
                <div className="shrink-0 flex flex-col items-center gap-2 w-full md:w-auto">
                  <div 
                    onClick={() => setShowEnlargedQr(true)}
                    className="p-0 bg-white rounded-2xl border-2 border-slate-900 shadow-lg overflow-hidden flex items-center justify-center cursor-pointer hover:scale-[1.01] transition-transform relative group w-full max-w-[320px] sm:max-w-[290px] md:w-64 lg:w-72"
                  >
                    <img 
                      src={settings.banglaQrImageUrl || "https://upload.wikimedia.org/wikipedia/commons/c/c8/%E0%A6%AC%E0%A6%BE%E0%A6%82%E0%A6%B2%E0%A6%BE_%E0%A6%95%E0%A6%BF%E0%A6%89%E0%A6%86%E0%A6%B0.svg"} 
                      alt="Scan Bangla QR" 
                      className="w-full h-full aspect-square object-cover sm:object-contain bg-white"
                    />
                    <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
                      <span className="bg-slate-900 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl shadow-md">
                        🔍 বড় করে দেখুন (Zoom)
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowEnlargedQr(true)}
                    className="text-[11px] font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3.5 py-1 rounded-full border border-slate-300 flex items-center gap-1 cursor-pointer transition shadow-2xs"
                  >
                    <span>🔍 ট্যাপ করে ফুলস্ক্রিন QR দেখুন</span>
                  </button>
                </div>

                <div className="space-y-3 text-slate-700 w-full">
                  {/* Account Info Details Box */}
                  <div className="bg-amber-50/80 border border-amber-200 p-2.5 sm:p-3 rounded-xl space-y-1">
                    <span className="text-[10px] uppercase font-black text-amber-800 tracking-wider block">
                      অফিশিয়াল মার্চেন্ট / ব্যাংক একাউন্ট ডিটেইলস:
                    </span>
                    <p className="text-xs sm:text-xs font-bold text-slate-900 font-mono leading-tight">
                      {settings.banglaQrAccountInfo || 'Account Name: MD. MOSTAKIM HOSSAIN, BRANCH: MOHAMMADPUR Dutch Bangla Bank, (TID - 30167769)'}
                    </p>
                  </div>

                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm">বাংলা QR পেমেন্ট নির্দেশিকা:</h4>
                  <ol className="list-decimal list-inside space-y-1.5 text-[11px] sm:text-xs text-slate-600 leading-relaxed">
                    <li>bKash / Nagad / Rocket বা যেকোনো <strong>Bank App</strong> খুলুন।</li>
                    <li>অ্যাপের <strong>"Scan QR" / "Bangla QR"</strong> সিলেক্ট করে ওপরের কোডটি স্ক্যান করুন।</li>
                    <li>সঠিক ফি <strong>৳{totalFee} BDT</strong> পেমেন্ট সম্পন্ন করুন।</li>
                    <li>পেমেন্ট শেষে প্রাপ্ত <strong>Transaction ID (TrxID)</strong> ও প্রেরক নম্বরটি নিচে ইনপুট দিন।</li>
                  </ol>

                  {/* Backup Number Option */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] gap-2 flex-wrap">
                    <span className="text-slate-500 font-semibold">স্ক্যানিং সমস্যা হলে ব্যাকআপ Send Money নম্বর:</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(getPaymentNumber('Bangla QR'), 'number')}
                      className="text-slate-900 font-mono font-bold hover:bg-slate-200 flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-300 cursor-pointer shrink-0"
                    >
                      <span>{getPaymentNumber('Bangla QR')}</span>
                      {copiedField === 'number' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-xs">
                  {paymentMethod} পার্সোনাল নম্বর (Send Money):
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  ফি: ৳{totalFee} BDT
                </span>
              </div>

              <div className="bg-slate-900 text-white p-2.5 sm:p-3 rounded-xl flex items-center justify-between shadow-xs">
                <span className="font-mono text-base sm:text-lg font-black text-emerald-400 tracking-wider">
                  {getPaymentNumber(paymentMethod)}
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(getPaymentNumber(paymentMethod), 'number')}
                  className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-2.5 py-1 rounded-lg text-xs flex items-center gap-1 cursor-pointer transition"
                >
                  {copiedField === 'number' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedField === 'number' ? 'কপি হয়েছে' : 'নম্বর কপি'}</span>
                </button>
              </div>

              <ol className="list-decimal list-inside space-y-0.5 text-[11px] text-slate-600">
                <li>আপনার {paymentMethod} অ্যাপ থেকে Send Money অপশনে যান।</li>
                <li>ওপরের নম্বরে সঠিক <strong>৳{totalFee}</strong> টাকা পাঠান।</li>
                <li>পেমেন্ট শেষে প্রাপ্ত Transaction ID (TrxID) নিচে ইনপুট দিন।</li>
              </ol>
            </div>
          )}

          {/* Sender Phone & TrxID inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-4 text-xs sm:text-sm">
            <div>
              <label className="block font-bold text-slate-800 mb-1 text-xs">
                প্রেরকের মোবাইল নম্বর (Sender Mobile) *
              </label>
              <input
                type="tel"
                required
                maxLength={11}
                placeholder="যেমন: 01700000000"
                value={paymentSenderPhone}
                onChange={e => setPaymentSenderPhone(e.target.value.replace(/[^0-9]/g, ''))}
                className="w-full bg-slate-50 focus:bg-white border border-slate-300 rounded-xl p-2.5 font-mono text-xs sm:text-sm focus:ring-2 focus:ring-slate-400 shadow-2xs"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1 text-xs">
                ট্রানজেকশন আইডি (TrxID) *
              </label>
              <input
                type="text"
                required
                placeholder="যেমন: 9K4M2L8PQ"
                value={trxId}
                onChange={e => setTrxId(e.target.value.toUpperCase())}
                className="w-full bg-slate-50 focus:bg-white border border-slate-300 rounded-xl p-2.5 font-mono font-bold text-xs sm:text-sm focus:ring-2 focus:ring-slate-400 uppercase shadow-2xs text-slate-900"
              />
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 pt-1 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="text-slate-600 hover:text-slate-900 font-bold text-xs flex items-center gap-1 cursor-pointer px-2 py-2 rounded-lg hover:bg-slate-100 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>বিষয় পরিবর্তন</span>
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-5 py-2.5 rounded-xl text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-emerald-600/20 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>সাবমিট হচ্ছে...</span>
              ) : (
                <>
                  <span>পেমেন্ট নিশ্চিত করুন & জমা দিন (৳{totalFee})</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* STEP 4: DIGITAL RECEIPT */}
      {currentStep === 4 && completedOrder && (
        <div className="bg-white/70 backdrop-blur-2xl p-6 sm:p-10 rounded-[32px] border border-white/80 shadow-2xl space-y-6">
          
          {/* Header Success Badge */}
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full mx-auto flex items-center justify-center shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              আবেদন সফলভাবে জমা হয়েছে!
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm">
              আপনার একটি অফিশিয়াল ডিজিটাল রসিদ তৈরি হয়েছে। নিচে আপনার Order ID দেওয়া হলো।
            </p>
          </div>

          {/* Printable Receipt Container */}
          <div id="digital-receipt-printable" className="bg-white border-2 border-dashed border-slate-300 p-6 rounded-3xl space-y-4 shadow-sm">
            
            {/* Receipt Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center gap-2">
                <img src={settings.logoIconUrl} alt="Logo" className="w-8 h-8 object-contain" />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-blue-700 text-lg">আবেদনী</span>
                    <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.5 rounded">Digital Receipt</span>
                  </div>
                  <p className="text-[10px] text-slate-500">SSC Board Challenge Service Portal • 2026</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono font-bold text-slate-800 block">
                  {completedOrder.id}
                </span>
                <span className="text-[10px] text-slate-500 block">
                  {new Date(completedOrder.createdAt).toLocaleDateString('bn-BD')}
                </span>
              </div>
            </div>

            {/* Student Specs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs border-b border-slate-200 pb-4">
              <div>
                <span className="text-slate-500 block">শিক্ষার্থীর নাম</span>
                <span className="font-bold text-slate-900">{completedOrder.studentName}</span>
              </div>
              <div>
                <span className="text-slate-500 block">শিক্ষা বোর্ড</span>
                <span className="font-bold text-blue-700">{completedOrder.board}</span>
              </div>
              <div>
                <span className="text-slate-500 block">রোল নম্বর</span>
                <span className="font-bold font-mono text-slate-900">{completedOrder.roll}</span>
              </div>
              <div>
                <span className="text-slate-500 block">রেজিস্ট্রেশন নম্বর</span>
                <span className="font-bold font-mono text-slate-900">{completedOrder.reg}</span>
              </div>
              <div>
                <span className="text-slate-500 block">মোবাইল</span>
                <span className="font-bold font-mono text-slate-900">{completedOrder.phone}</span>
              </div>
              <div>
                <span className="text-slate-500 block">স্ট্যাটাস</span>
                <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  Processing by Abedoni
                </span>
              </div>
            </div>

            {/* Subjects List */}
            <div>
              <span className="text-xs font-bold text-slate-700 block mb-1">আবেদনের বিষয়সমূহ:</span>
              <div className="flex flex-wrap gap-1.5">
                {completedOrder.subjectNamesBn?.map((s, idx) => (
                  <span key={idx} className="bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg text-xs font-bold text-slate-800">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Financial Summary */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between text-xs sm:text-sm">
              <div>
                <p className="text-slate-600">পেমেন্ট মাধ্যম: <strong className="text-slate-900">{completedOrder.paymentMethod}</strong> ({completedOrder.trxId})</p>
                <p className={`font-extrabold ${completedOrder.paymentStatus === 'Paid' ? 'text-emerald-700' : 'text-amber-800'}`}>
                  পেমেন্ট স্ট্যাটাস: {completedOrder.paymentStatus === 'Paid' ? 'পরিশোধিত (Paid)' : 'যাচাইাধীন (Reviewing)'}
                </p>
              </div>
              <div className="text-right">
                <span className="text-slate-500 block text-[10px] sm:text-xs font-bold">মোট পরিশোধিত ফি</span>
                <span className="text-xl sm:text-2xl font-black text-blue-700 font-mono">৳{completedOrder.totalFee}</span>
              </div>
            </div>

          </div>

          {/* WhatsApp Support Action */}
          <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-2xl space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-emerald-950">
                  ১-ক্লিকে আমাদের হোয়াটসঅ্যাপে তথ্য নিশ্চিত করুন
                </h3>
                <p className="text-xs text-emerald-800">
                  নিচের বাটনে চাপ দিলে মেসেজটি অটোমেটিক সাজিয়ে আমাদের অফিশিয়াল হোয়াটসঅ্যাপ সাপোর্ট প্যানেলে চলে যাবে।
                </p>
              </div>
            </div>

            <a
              href={getWhatsappDirectUrl(settings.whatsappNumber || '01577777092', generateStudentWhatsappMessage(completedOrder, settings.whatsappTemplateStudentToAdmin))}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-2xl text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-600/25"
            >
              <Send className="w-4 h-4" />
              <span>অফিশিয়াল WhatsApp-এ মেসেজ পাঠান ({settings.whatsappNumber})</span>
            </a>
          </div>

          {/* Printable & Tracking Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <button
              onClick={() => window.print()}
              className="w-full sm:w-auto px-5 py-3 rounded-2xl border border-slate-300 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-slate-50 transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>রসিদ প্রিন্ট করুন</span>
            </button>

            <button
              onClick={onTrackOrderClick}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-md"
            >
              <ReceiptIcon className="w-4 h-4" />
              <span>লাইভ স্ট্যাটাস ট্র্যাক করুন</span>
            </button>
          </div>

        </div>
      )}

      {/* ENLARGED FULLSCREEN QR MODAL */}
      {showEnlargedQr && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setShowEnlargedQr(false)}
        >
          <div 
            className="bg-white p-5 sm:p-6 rounded-3xl max-w-sm sm:max-w-md w-full border border-slate-200 shadow-2xl space-y-4 text-center relative"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/4/4c/Bangla_QR_Logo.svg" 
                  alt="Bangla QR Logo" 
                  className="h-6 sm:h-7 w-auto" 
                />
                <span className="font-bold text-slate-900 text-xs sm:text-sm">বাংলা QR (Scan Code)</span>
              </div>
              <button 
                type="button"
                onClick={() => setShowEnlargedQr(false)}
                className="p-1.5 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-0 bg-white rounded-2xl border-2 border-slate-900 shadow-inner overflow-hidden flex items-center justify-center">
              <img 
                src={settings.banglaQrImageUrl || "https://upload.wikimedia.org/wikipedia/commons/c/c8/%E0%A6%AC%E0%A6%BE%E0%A6%82%E0%A6%B2%E0%A6%BE_%E0%A6%95%E0%A6%BF%E0%A6%89%E0%A6%86%E0%A6%B0.svg"} 
                alt="Bangla QR Code Enlarged" 
                className="w-full h-auto max-h-[70vh] aspect-square object-contain bg-white"
              />
            </div>

            <div className="space-y-1">
              <div className="text-emerald-700 font-extrabold text-lg font-mono">
                প্রদেয় ফি: ৳{totalFee} BDT
              </div>
              <p className="text-xs text-slate-500 font-medium">
                যেকোনো MFS (bKash, Nagad, Rocket) অথবা Bank App দিয়ে আপনার ফোন দিয়ে স্ক্যান করুন।
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowEnlargedQr(false)}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs transition cursor-pointer"
            >
              বন্ধ করুন (Close)
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
