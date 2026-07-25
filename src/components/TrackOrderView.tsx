import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Receipt, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Printer, 
  Send, 
  MessageSquare, 
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { BoardChallengeOrder, OrderStatus } from '../types';
import { generateStudentWhatsappMessage, getWhatsappDirectUrl } from '../data/boardsAndSubjects';
import { getAppSettings } from '../data/appSettings';

interface TrackOrderViewProps {
  initialOrderId?: string;
  onNavigateApply: () => void;
}

export const TrackOrderView: React.FC<TrackOrderViewProps> = ({
  initialOrderId,
  onNavigateApply,
}) => {
  const settings = getAppSettings();
  const [searchTerm, setSearchTerm] = useState(initialOrderId || 'ABD-2026-10842');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [order, setOrder] = useState<BoardChallengeOrder | null>(null);

  const fetchOrderDetails = async (query: string) => {
    if (!query.trim()) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'আবেদনটির কোনো তথ্য পাওয়া যায়নি।');
      }
      setOrder(data);
    } catch (err: any) {
      setOrder(null);
      setErrorMsg(err.message || 'নেটওয়ার্ক এরর! অনুগ্রহ করে সঠিক Order ID বা রোল দিন।');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialOrderId) {
      fetchOrderDetails(initialOrderId);
    } else {
      // Fetch default sample order for instant demo view
      fetchOrderDetails('ABD-2026-10842');
    }
  }, [initialOrderId]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrderDetails(searchTerm);
  };

  // Timeline Step calculation
  const getTimelineStepIndex = (status: OrderStatus): number => {
    switch (status) {
      case 'Pending': return 1;
      case 'Payment Verified': return 2;
      case 'Processing': return 3;
      case 'SMS Sent': return 4;
      case 'Completed': return 5;
      case 'Updated': return 5;
      default: return 2;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 font-bn">
      
      {/* Search Header */}
      <div className="text-center space-y-3">
        <span className="bg-emerald-100/90 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200">
          লাইভ আবেদন ট্র্যাকিং
        </span>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900">
          আবেদনের বর্তমান স্ট্যাটাস দেখুন
        </h1>
        <p className="text-slate-600 text-xs sm:text-sm">
          আপনার Order ID (যেমন: ABD-2026-10842), রোল নম্বর বা মোবাইল নম্বর দিয়ে সার্চ করুন।
        </p>
      </div>

      {/* Search Box */}
      <form onSubmit={handleSearchSubmit} className="max-w-xl mx-auto flex gap-2">
        <div className="relative flex-1">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            required
            placeholder="Order ID / Roll / Phone / TrxID"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-white/80 border border-slate-300 rounded-2xl pl-11 pr-4 py-3.5 text-sm font-mono focus:ring-2 focus:ring-blue-500 shadow-sm"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3.5 rounded-2xl text-sm transition cursor-pointer shadow-md disabled:opacity-50"
        >
          {loading ? 'খোঁজা হচ্ছে...' : 'সার্চ করুন'}
        </button>
      </form>

      {/* Error View */}
      {errorMsg && (
        <div className="bg-rose-50/90 border border-rose-200 text-rose-800 p-6 rounded-3xl text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-rose-600 mx-auto" />
          <p className="text-sm font-bold">{errorMsg}</p>
          <button
            onClick={onNavigateApply}
            className="text-xs bg-white text-rose-700 font-bold px-4 py-2 rounded-xl border border-rose-200 hover:bg-rose-100"
          >
            নতুন আবেদনের ফর্মে যান
          </button>
        </div>
      )}

      {/* Order Details Result */}
      {order && (
        <div className="space-y-6">
          
            {/* Status Timeline & Payment Badge */}
          <div className="bg-white/70 backdrop-blur-2xl p-6 sm:p-8 rounded-[32px] border border-white/80 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200/60 pb-4">
              <div>
                <span className="text-xs sm:text-sm text-slate-500 font-mono font-extrabold">ORDER ID: {order.id}</span>
                <h3 className="text-2xl font-black text-slate-900">{order.studentName}</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-extrabold border shadow-xs ${
                  order.paymentStatus === 'Paid'
                    ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                    : 'bg-amber-100 text-amber-900 border-amber-300'
                }`}>
                  পেমেন্ট স্ট্যাটাস: {order.paymentStatus === 'Paid' ? 'পরিশোধিত (Paid)' : 'যাচাইাধীন (Reviewing)'}
                </span>
              </div>
            </div>

            {/* 5-Step Visual Timeline */}
            <div className="space-y-4">
              <h4 className="text-xs sm:text-sm font-extrabold text-slate-700 uppercase tracking-wider">আবেদন প্রক্রিয়াকরণ টাইমলাইন</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-xs sm:text-sm">
                {[
                  { step: 1, title: 'আবেদন গৃহিত', desc: 'অর্ডার সাবমিটেড' },
                  { step: 2, title: order.paymentStatus === 'Paid' ? 'পেমেন্ট ভেরিফাইড' : 'যাচাইাধীন (Reviewing)', desc: 'পেমেন্ট চেক' },
                  { step: 3, title: 'বোর্ড চ্যালেঞ্জ', desc: 'তথ্য প্রসেসিং' },
                  { step: 4, title: 'SMS জমাকরণ', desc: 'টেলিটক এসএমএস' },
                  { step: 5, title: 'সম্পন্ন', desc: 'আবেদন নিশ্চিত' },
                ].map(st => {
                  const currentIdx = getTimelineStepIndex(order.orderStatus);
                  const isDone = st.step <= currentIdx;
                  return (
                    <div 
                      key={st.step}
                      className={`p-3.5 rounded-2xl border transition-all ${
                        isDone 
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold' 
                          : 'bg-slate-50/80 border-slate-200 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                          isDone ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                        }`}>
                          {st.step}
                        </div>
                        <span className="font-extrabold text-xs sm:text-sm truncate">{st.title}</span>
                      </div>
                      <p className="text-xs text-slate-600 font-medium">{st.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Admin Notes */}
            {order.adminNotes && (
              <div className="bg-blue-50/90 border border-blue-200 p-4 rounded-2xl text-xs sm:text-sm text-blue-900 flex items-start gap-2.5">
                <Clock className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-extrabold block">সর্বশেষ স্ট্যাটাস আপডেট:</span>
                  <span className="font-bold">{order.adminNotes}</span>
                </div>
              </div>
            )}
          </div>

          {/* Printable Digital Receipt Card */}
          <div id="digital-receipt-printable" className="bg-white border-2 border-dashed border-slate-300 p-6 sm:p-8 rounded-[32px] space-y-4 shadow-md">
            
            {/* Receipt Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center gap-3">
                <img src={settings.logoIconUrl} alt="Abedoni Logo" className="w-10 h-10 object-contain" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-blue-700 text-xl sm:text-2xl">আবেদনী</span>
                    <span className="text-xs bg-blue-100 text-blue-800 font-extrabold px-2 py-0.5 rounded">Digital Receipt</span>
                  </div>
                  <p className="text-xs text-slate-500 font-semibold">SSC Board Challenge Official Portal</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm font-mono font-extrabold text-slate-900 block">
                  {order.id}
                </span>
                <span className="text-xs text-slate-500 font-semibold block">
                  তারিখ: {new Date(order.createdAt).toLocaleDateString('bn-BD')}
                </span>
              </div>
            </div>

            {/* Student Specs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs sm:text-sm border-b border-slate-200 pb-4">
              <div>
                <span className="text-slate-500 block font-semibold">শিক্ষার্থীর নাম</span>
                <span className="font-black text-slate-900">{order.studentName}</span>
              </div>
              <div>
                <span className="text-slate-500 block font-semibold">শিক্ষা বোর্ড</span>
                <span className="font-black text-blue-700">{order.board}</span>
              </div>
              <div>
                <span className="text-slate-500 block font-semibold">রোল নম্বর</span>
                <span className="font-black font-mono text-slate-900">{order.roll}</span>
              </div>
              <div>
                <span className="text-slate-500 block font-semibold">রেজিস্ট্রেশন নম্বর</span>
                <span className="font-black font-mono text-slate-900">{order.reg}</span>
              </div>
              <div>
                <span className="text-slate-500 block font-semibold">মোবাইল নম্বর</span>
                <span className="font-black font-mono text-slate-900">{order.phone}</span>
              </div>
              <div>
                <span className="text-slate-500 block font-semibold">স্ট্যাটাস</span>
                <span className="font-extrabold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  Processing by Abedoni
                </span>
              </div>
            </div>

            {/* Subjects List */}
            <div>
              <span className="text-xs sm:text-sm font-bold text-slate-800 block mb-1">আবেদনের বিষয়সমূহ:</span>
              <div className="flex flex-wrap gap-2">
                {order.subjectNamesBn?.map((s, idx) => (
                  <span key={idx} className="bg-slate-100 border border-slate-200 px-3 py-1 rounded-xl text-xs sm:text-sm font-bold text-slate-900">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Financial Summary */}
            <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 flex items-center justify-between text-xs sm:text-sm">
              <div>
                <p className="text-slate-700 font-semibold">পেমেন্ট মাধ্যম: <strong className="text-slate-900 font-bold">{order.paymentMethod}</strong> ({order.trxId})</p>
                <p className={`font-black ${order.paymentStatus === 'Paid' ? 'text-emerald-700' : 'text-amber-800'}`}>
                  পেমেন্ট স্ট্যাটাস: {order.paymentStatus === 'Paid' ? 'পরিশোধিত (Paid)' : 'যাচাইাধীন (Reviewing)'}
                </p>
              </div>
              <div className="text-right">
                <span className="text-slate-500 block text-xs font-bold">মোট ফি</span>
                <span className="text-2xl font-black text-blue-700 font-mono">৳{order.totalFee}</span>
              </div>
            </div>

            {/* Print Action Button */}
            <div className="pt-2 no-print flex justify-end">
              <button
                onClick={() => window.print()}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-3 rounded-2xl text-xs sm:text-sm flex items-center gap-2 cursor-pointer shadow-md"
              >
                <Printer className="w-4 h-4 text-emerald-400" />
                <span>ডিজিটাল রসিদ প্রিন্ট করুন</span>
              </button>
            </div>

          </div>

          {/* Details & Support Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Student & Subjects Specs */}
            <div className="bg-white/70 backdrop-blur-2xl p-6 rounded-[32px] border border-white/80 shadow-md space-y-4 text-xs">
              <h4 className="font-bold text-slate-900 border-b border-slate-200/60 pb-2 text-sm">আবেদনের সারসংক্ষেপ</h4>
              
              <div className="space-y-2.5">
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="text-slate-500">শিক্ষা বোর্ড:</span>
                  <span className="font-bold text-slate-800">{order.board}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="text-slate-500">রোল নম্বর:</span>
                  <span className="font-mono font-bold text-slate-800">{order.roll}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="text-slate-500">রেজিস্ট্রেশন:</span>
                  <span className="font-mono font-bold text-slate-800">{order.reg}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="text-slate-500">মোবাইল নম্বর:</span>
                  <span className="font-mono font-bold text-slate-800">{order.phone}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="text-slate-500">পেমেন্ট আইডি:</span>
                  <span className="font-mono font-bold text-slate-800">{order.trxId} ({order.paymentMethod})</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span className="text-slate-500">মোট টাকা:</span>
                  <span className="font-bold text-emerald-600 font-mono text-sm">৳{order.totalFee}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-500 block mb-1">আবেদনকৃত বিষয়সমূহ:</span>
                <div className="flex flex-wrap gap-1">
                  {order.subjectNamesBn?.map((s, i) => (
                    <span key={i} className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded-lg text-[11px] font-bold border border-slate-200">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Tracking Support Box */}
            <div className="bg-slate-900 text-white p-6 rounded-[32px] space-y-4 text-xs shadow-xl flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h4 className="font-bold text-emerald-400 text-sm">আবেদনী ট্র্যাকিং আপডেট</h4>
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                </div>

                <div className="space-y-2 text-slate-300">
                  <p>আপনার আবেদনটি আমাদের বিশেষায়িত বোর্ড চ্যালেঞ্জ সেন্টারে প্রক্রিয়াধীন রয়েছে।</p>
                  <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-slate-200 space-y-1">
                    <p className="text-[11px] font-bold text-emerald-300">পেমেন্ট স্ট্যাটাস:</p>
                    <p className="text-sm font-bold text-amber-300">Processing by Abedoni</p>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    যেকোনো প্রয়োজনে আমাদের অফিসিয়াল হোয়াটসঅ্যাপ সাপোর্টে সরাসরি মেসেজ দিতে পারেন।
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <a
                  href={getWhatsappDirectUrl(settings.whatsappNumber || '01577777092', generateStudentWhatsappMessage(order, settings.whatsappTemplateStudentToAdmin))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-2xl text-xs flex items-center justify-center gap-1.5 transition shadow-lg shadow-emerald-600/30"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>WhatsApp-এ সরাসরি যোগাযোগ করুন ({settings.whatsappNumber})</span>
                </a>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
