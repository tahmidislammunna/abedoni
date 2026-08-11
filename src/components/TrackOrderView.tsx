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
import { InvoiceCard } from './InvoiceCard';
import { handlePrintInvoice } from '../utils/printUtils';
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
  const [searchTerm, setSearchTerm] = useState(initialOrderId || '');
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
      setErrorMsg(err.message || 'নেটওয়ার্ক এরর! অনুগ্রহ করে সঠিক Order ID, রোল নম্বর বা TrxID দিন।');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialOrderId) {
      setSearchTerm(initialOrderId);
      fetchOrderDetails(initialOrderId);
    }
  }, [initialOrderId]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrderDetails(searchTerm);
  };

  // Timeline Step calculation
  const getTimelineStepIndex = (status: OrderStatus): number => {
    switch (status) {
      case 'Pending':
      case 'Pending Lead':
      case 'Contacted':
      case 'Payment Pending': 
        return 1;
      case 'Payment Verified': 
        return 2;
      case 'Finalized':
      case 'Processing': 
        return 3;
      case 'Completed': 
        return 4;
      default: 
        return 2;
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
          আপনার Order ID (যেমন: ABD-2026-10842) অথবা এসএসসি রোল নম্বর দিয়ে সার্চ করুন।
        </p>
      </div>

      {/* Search Box */}
      <form onSubmit={handleSearchSubmit} className="max-w-xl mx-auto flex gap-2">
        <div className="relative flex-1">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            required
            placeholder="Order ID অথবা রোল নম্বর দিয়ে সার্চ করুন"
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
            className="text-xs bg-white text-rose-700 font-bold px-4 py-2 rounded-xl border border-rose-200 hover:bg-rose-100 cursor-pointer"
          >
            নতুন আবেদনের ফর্মে যান
          </button>
        </div>
      )}

      {/* Empty State Instructions when no order is searched yet */}
      {!order && !errorMsg && !loading && (
        <div className="bg-white/70 backdrop-blur-2xl p-8 rounded-[32px] border border-white/80 shadow-lg text-center space-y-4 max-w-xl mx-auto">
          <div className="w-16 h-16 bg-blue-100/80 rounded-3xl flex items-center justify-center mx-auto text-blue-600 shadow-inner">
            <Receipt className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-black text-slate-900">আপনার তথ্য দিয়ে আবেদন খুঁজুন</h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            উপরে দেওয়া ইনপুট বক্সে আপনার <strong className="text-slate-800">Order ID</strong> (যেমন: <code className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-lg border border-blue-200 font-mono">ABD-2026-XXXXX</code>) অথবা <strong className="text-slate-800">এসএসসি রোল নম্বর</strong> লিখে সার্চ বাটন চাপুন।
          </p>
        </div>
      )}

      {/* Order Details Result */}
      {order && (() => {
        const isProblematic = order.orderStatus === 'Cancelled' || order.paymentStatus === 'Unverified' || order.paymentStatus === 'Failed' || order.paymentStatus === 'Issue';
        return (
        <div className="space-y-6">
          
          {/* Status Timeline & Payment Badge */}
          <div className="bg-white/70 backdrop-blur-2xl p-6 sm:p-8 rounded-[32px] border border-white/80 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200/60 pb-4">
              <div>
                <span className="text-xs sm:text-sm text-slate-500 font-mono font-extrabold">ORDER ID: {order.id}</span>
                <h3 className="text-2xl font-black text-slate-900">{order.studentName}</h3>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-extrabold border shadow-xs ${
                  isProblematic
                    ? 'bg-rose-100 text-rose-900 border-rose-300'
                    : order.orderStatus === 'Completed' || order.orderStatus === 'Processing' || order.orderStatus === 'Payment Verified'
                    ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                    : 'bg-amber-100 text-amber-900 border-amber-300'
                }`}>
                  স্ট্যাটাস: {
                    order.orderStatus === 'Cancelled' ? 'বাতিল (Cancelled)' :
                    order.orderStatus === 'Completed' ? 'সম্পন্ন (Completed)' :
                    order.orderStatus === 'Processing' ? 'প্রসেসিং (Processing)' :
                    order.orderStatus === 'Finalized' ? 'আবেদনকৃত (Finalized)' :
                    order.orderStatus === 'Payment Verified' ? 'পেমেন্ট কনফার্মড (Payment Verified)' :
                    order.orderStatus === 'Payment Pending' ? 'পেমেন্ট প্রসেসিং (Payment Pending)' :
                    order.orderStatus === 'Contacted' ? 'যোগাযোগ করা হয়েছে (Contacted)' :
                    'যাচাইাধীন (Pending)'
                  }
                </span>
              </div>
            </div>

            {/* 5-Step Visual Timeline */}
            <div className="space-y-4">
              <h4 className="text-xs sm:text-sm font-extrabold text-slate-700 uppercase tracking-wider">আবেদন প্রক্রিয়াকরণ টাইমলাইন</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs sm:text-sm">
                {[
                  { step: 1, title: 'আবেদন গৃহিত', desc: 'অর্ডার সাবমিটেড' },
                  { step: 2, title: isProblematic ? 'পেমেন্ট ইস্যু' : order.paymentStatus === 'Paid' ? 'পেমেন্ট ভেরিফাইড' : 'যাচাইাধীন (Reviewing)', desc: 'পেমেন্ট কনফার্মেশন' },
                  { step: 3, title: 'প্রসেসিং (Processing)', desc: 'আবেদনী টিম প্রসেসিং' },
                  { step: 4, title: 'সম্পন্ন (Completed)', desc: 'আবেদন সফলভাবে নিশ্চিত' },
                ].map(st => {
                  const currentIdx = getTimelineStepIndex(order.orderStatus);
                  const isDone = !isProblematic && st.step <= currentIdx;
                  return (
                    <div 
                      key={st.step}
                      className={`p-3.5 rounded-2xl border transition-all ${
                        isProblematic && st.step === 2
                          ? 'bg-rose-50 border-rose-300 text-rose-950 font-bold'
                          : isDone 
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold' 
                          : 'bg-slate-50/80 border-slate-200 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                          isProblematic && st.step === 2 ? 'bg-rose-600 text-white' :
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

            {/* Latest Status Update Box (Highlighted RED if Cancelled or Payment Issue) */}
            {isProblematic && (
              <div className="p-4 rounded-2xl text-xs sm:text-sm flex items-start gap-2.5 border shadow-xs bg-rose-50/95 border-rose-300 text-rose-900 ring-2 ring-rose-500/20">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-extrabold block text-xs text-rose-950">
                    সর্বশেষ স্ট্যাটাস আপডেট:
                  </span>
                  <span className="font-bold text-sm leading-relaxed">
                    {order.orderStatus === 'Cancelled' 
                      ? 'আপনার এই আবেদনটি বাতিল বা সমস্যাগ্রস্ত হিসেবে চিহ্নিত হয়েছে। তথ্যের জন্য হোয়াটসঅ্যাপ সহায়তায় যোগাযোগ করুন।'
                      : 'পেমেন্ট তথ্যে অসঙ্গতি পাওয়া গেছে। সাহায্য পেতে আমাদের হোয়াটসঅ্যাপে যোগাযোগ করুন।'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Printable Digital Receipt Card Container */}
          <div className="space-y-4">
            <InvoiceCard order={order} type="receipt" settings={settings} hideSensitiveData={true} />

            {/* Action Buttons below Receipt */}
            <div className="no-print flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <button
                onClick={() => handlePrintInvoice('digital-receipt-printable')}
                className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-extrabold px-6 py-3.5 rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-md"
              >
                <Printer className="w-4 h-4 text-emerald-400" />
                <span>📥 PDF ডাউনলোড / প্রিন্ট করুন</span>
              </button>

              <a
                href={getWhatsappDirectUrl(settings.whatsappNumber || '01577777092', generateStudentWhatsappMessage(order, settings.whatsappTemplateStudentToAdmin))}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-3.5 rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-md"
              >
                <MessageSquare className="w-4 h-4" />
                <span>WhatsApp সাপোর্ট ({settings.whatsappNumber})</span>
              </a>
            </div>
          </div>

        </div>
        );
      })()}

    </div>
  );
};
