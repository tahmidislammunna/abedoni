import React, { useState, useEffect } from 'react';
import { X, PlusCircle, Check, BookOpen, User, Phone as PhoneIcon, Hash, CreditCard, FileText, AlertCircle, Loader2 } from 'lucide-react';
import { BoardChallengeOrder, EducationBoard, OrderStatus, PaymentMethod } from '../types';
import { BOARDS_LIST, SSC_SUBJECTS, OFFICIAL_FEE_PER_SUBJECT, calculateTotalOfficialFee } from '../data/boardsAndSubjects';
import { AppSettings, DEFAULT_APP_SETTINGS } from '../data/appSettings';

interface NewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderCreated: (newOrder: BoardChallengeOrder) => void;
  appSettings?: AppSettings;
}

export const NewOrderModal: React.FC<NewOrderModalProps> = ({
  isOpen,
  onClose,
  onOrderCreated,
  appSettings = DEFAULT_APP_SETTINGS,
}) => {
  const [studentName, setStudentName] = useState('');
  const [board, setBoard] = useState<EducationBoard>('DHA');
  const [roll, setRoll] = useState('');
  const [reg, setReg] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedSubjectCodes, setSelectedSubjectCodes] = useState<string[]>(['101', '107']);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bKash');
  const [trxId, setTrxId] = useState('');
  const [orderStatus, setOrderStatus] = useState<OrderStatus>('Pending');
  const [adminNotes, setAdminNotes] = useState('হোয়াটসঅ্যাপ/ফোন কলের মাধ্যমে সরাসরি ম্যানুয়াল অর্ডার তৈরি।');

  const [totalAmount, setTotalAmount] = useState<number>(349);
  const [customAmountEdited, setCustomAmountEdited] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Auto calculate total amount when selected subjects change unless manually overridden
  useEffect(() => {
    if (!customAmountEdited) {
      const officialFee = calculateTotalOfficialFee(selectedSubjectCodes);
      const platformFee = appSettings.abedoniServiceFee || 49;
      setTotalAmount(officialFee + platformFee);
    }
  }, [selectedSubjectCodes, customAmountEdited, appSettings.abedoniServiceFee]);

  if (!isOpen) return null;

  const toggleSubject = (code: string) => {
    if (selectedSubjectCodes.includes(code)) {
      if (selectedSubjectCodes.length === 1) {
        alert('অন্তত ১টি বিষয় নির্বাচন করা আবশ্যক।');
        return;
      }
      setSelectedSubjectCodes(selectedSubjectCodes.filter(c => c !== code));
    } else {
      setSelectedSubjectCodes([...selectedSubjectCodes, code]);
    }
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!studentName.trim()) {
      setErrorMessage('অনুগ্রহ করে শিক্ষার্থীর নাম লিখুন।');
      return;
    }
    if (!roll.trim()) {
      setErrorMessage('অনুগ্রহ করে রোল নম্বর লিখুন।');
      return;
    }
    if (!phone.trim()) {
      setErrorMessage('অনুগ্রহ করে মোবাইল নম্বর লিখুন।');
      return;
    }
    if (selectedSubjectCodes.length === 0) {
      setErrorMessage('অন্তত ১টি বিষয় নির্বাচন করুন।');
      return;
    }

    setIsSubmitting(true);

    try {
      // Map selected codes to full Bangla names
      const selectedSubjectObjects = selectedSubjectCodes.map(code => 
        SSC_SUBJECTS.find(s => s.code === code)
      ).filter(Boolean);

      const subjectNamesBn = selectedSubjectObjects.map(s => s!.nameBn);

      const officialFee = selectedSubjectCodes.length * OFFICIAL_FEE_PER_SUBJECT;
      const platformFee = Math.max(0, totalAmount - officialFee);

      // Generate unique ABD order ID suffix
      const randomSuffix = Math.floor(100000 + Math.random() * 900000).toString();
      const newOrderId = `ABD-2026-${randomSuffix}`;

      const payload = {
        id: newOrderId,
        studentName: studentName.trim(),
        board,
        roll: roll.trim(),
        reg: reg.trim(),
        phone: phone.trim(),
        whatsapp: phone.trim(),
        subjects: selectedSubjectCodes,
        subjectNamesBn,
        officialFee,
        platformFee,
        totalFee: Number(totalAmount),
        paymentMethod,
        paymentSenderPhone: phone.trim(),
        trxId: trxId.trim() || 'MANUAL_CASH',
        orderStatus,
        paymentStatus: ['Completed', 'Processing', 'Payment Verified'].includes(orderStatus) ? 'Paid' : 'Reviewing',
        adminNotes: adminNotes.trim(),
        isFinalized: true,
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'অর্ডার তৈরি করতে ব্যর্থ হয়েছে।');
      }

      onOrderCreated(data.order);
      onClose();

      // Reset form
      setStudentName('');
      setRoll('');
      setReg('');
      setPhone('');
      setSelectedSubjectCodes(['101', '107']);
      setTrxId('');
      setOrderStatus('Pending');
      setAdminNotes('হোয়াটসঅ্যাপ/ফোন কলের মাধ্যমে সরাসরি ম্যানুয়াল অর্ডার তৈরি।');
      setCustomAmountEdited(false);
    } catch (err: any) {
      console.error('Error creating manual order:', err);
      setErrorMessage(err.message || 'অর্ডার তৈরিতে সমস্যা দেখা দিয়েছে।');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-[28px] border border-slate-200 shadow-2xl w-full max-w-2xl my-auto overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/30 text-blue-400 rounded-xl border border-blue-500/30">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight">নতুন ম্যানুয়াল অর্ডার তৈরি (New Order)</h2>
              <p className="text-xs text-slate-400 font-medium">হোয়াটসঅ্যাপ বা সরাসরি গ্রহীতার ম্যানুয়াল আবেদন এনট্রি</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleCreateOrder} className="p-4 sm:p-6 overflow-y-auto space-y-5 text-slate-800 text-xs sm:text-sm font-bn">
          
          {errorMessage && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-2xl flex items-center gap-2.5 font-bold">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Section 1: Customer & Exam Spec */}
          <div className="space-y-3">
            <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5 border-b pb-1.5">
              <User className="w-4 h-4 text-blue-600" />
              <span>১. শিক্ষার্থীর ও পরীক্ষার বেসিক তথ্য</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  শিক্ষার্থীর নাম <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: মোঃ সাব্বির হোসেন"
                  value={studentName}
                  onChange={e => setStudentName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  মোবাইল নম্বর <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <PhoneIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    required
                    placeholder="যেমন: 01700000000"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 font-mono font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  শিক্ষা বোর্ড <span className="text-rose-500">*</span>
                </label>
                <select
                  value={board}
                  onChange={e => setBoard(e.target.value as EducationBoard)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  {BOARDS_LIST.map(b => (
                    <option key={b.code} value={b.code}>
                      {b.nameBn} ({b.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    রোল <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: 142850"
                    value={roll}
                    onChange={e => setRoll(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-mono font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">রেজিস্ট্রেশন</label>
                  <input
                    type="text"
                    placeholder="যেমন: 2110482901"
                    value={reg}
                    onChange={e => setReg(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-mono font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Selected Subjects */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between border-b pb-1.5">
              <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-blue-600" />
                <span>২. বিষয় নির্বাচন (Selected Subjects)</span>
              </h3>
              <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                {selectedSubjectCodes.length} টি বিষয় নির্বাচিত
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 bg-slate-50 rounded-2xl border border-slate-200">
              {SSC_SUBJECTS.map((sub) => {
                const isSelected = selectedSubjectCodes.includes(sub.code);
                return (
                  <button
                    key={sub.code}
                    type="button"
                    onClick={() => toggleSubject(sub.code)}
                    className={`p-2.5 rounded-xl border text-left transition flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-xs'
                        : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="pr-2 truncate">
                      <span className="block font-bold truncate text-xs">
                        {sub.nameBn}
                      </span>
                      <span className={`text-[10px] block font-mono ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>
                        Code: {sub.code} | {sub.nameEn}
                      </span>
                    </div>
                    <div className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 border ${
                      isSelected ? 'bg-white text-blue-600 border-white' : 'border-slate-300 bg-slate-100'
                    }`}>
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Financial & Payment Details */}
          <div className="space-y-3">
            <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5 border-b pb-1.5">
              <CreditCard className="w-4 h-4 text-blue-600" />
              <span>৩. ফি ও পেমেন্ট বিবরণী</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  মোট টাকা (Total Fee BDT) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 font-bold text-slate-500">৳</span>
                  <input
                    type="number"
                    required
                    min={0}
                    value={totalAmount}
                    onChange={e => {
                      setTotalAmount(Number(e.target.value));
                      setCustomAmountEdited(true);
                    }}
                    className="w-full bg-amber-50/60 border border-amber-300 rounded-xl pl-7 pr-3 py-2.5 font-mono font-black text-slate-900 text-base focus:bg-white focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  বোর্ড ফি: ৳{selectedSubjectCodes.length * 150} + সার্ভিস: ৳{appSettings.abedoniServiceFee || 49}
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">পেমেন্ট মাধ্যম</label>
                <select
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="bKash">bKash (বিকাশ)</option>
                  <option value="Nagad">Nagad (নগদ)</option>
                  <option value="Rocket">Rocket (রকেট)</option>
                  <option value="Bangla QR">Bangla QR (বাংলা কিউআর)</option>
                  <option value="Upay">Upay (উপায়)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Transaction ID (TrxID)</label>
                <div className="relative">
                  <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="যেমন: 9A82J10M বা CASH"
                    value={trxId}
                    onChange={e => setTrxId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 font-mono font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 uppercase"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">অর্ডার স্ট্যাটাস (Initial Status)</label>
                <select
                  value={orderStatus}
                  onChange={e => setOrderStatus(e.target.value as OrderStatus)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="Pending">1. Pending (যাচাইাধীন)</option>
                  <option value="Contacted">2. Contacted (যোগাযোগ করা হয়েছে)</option>
                  <option value="Payment Pending">3. Payment Pending (পেমেন্ট প্রসেসিং)</option>
                  <option value="Payment Verified">4. Payment Verified (পেমেন্ট ভেরিফাইড)</option>
                  <option value="Processing">5. Processing (প্রসেসিং)</option>
                  <option value="Completed">6. Completed (সম্পন্ন)</option>
                  <option value="Cancelled">7. Cancelled (বাতিল)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">অ্যাডমিন নোট (Internal Notes)</label>
                <input
                  type="text"
                  placeholder="যেমন: হোয়াটসঅ্যাপে যোগাযোগকৃত গ্রাহক"
                  value={adminNotes}
                  onChange={e => setAdminNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-3 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 transition cursor-pointer"
            >
              বাতিল
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-6 py-3 rounded-xl flex items-center gap-2 transition cursor-pointer shadow-md disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>তৈরি হচ্ছে...</span>
                </>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4" />
                  <span>অর্ডার তৈরি করুন (Create Order)</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
