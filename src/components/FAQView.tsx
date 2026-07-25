import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, MessageSquare } from 'lucide-react';
import { FAQItem } from '../types';
import { getAppSettings } from '../data/appSettings';

export const FAQView: React.FC = () => {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const settings = getAppSettings();
  const boardFee = settings.officialBoardFee || 175;
  const platformFee = settings.abedoniServiceFee || 99;
  const smsFee = settings.smsFeePerSubject || 12;

  useEffect(() => {
    fetch('/api/faqs')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setFaqs(data);
        }
      })
      .catch(() => {});
  }, []);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  const getDynamicAnswer = (faq: FAQItem) => {
    if (faq.questionBn.includes('কত টাকা খরচ')) {
      const sampleTotal = boardFee + smsFee + platformFee;
      return `শিক্ষা বোর্ডের অফিশিয়াল ফি প্রতি বিষয়ের জন্য ৳${boardFee} এবং সিস্টেম SMS ফি ৳${smsFee}। আবেদনী প্ল্যাটফর্মের সার্ভিস চার্জ প্রতি অ্যাপ্লিকেশনে মাত্র ৳${platformFee}। উদাহরণস্বরূপ: ১টি বিষয়ের মোট খরচ ৳${boardFee} + ৳${smsFee} + ৳${platformFee} = ৳${sampleTotal}।`;
    }
    return faq.answerBn;
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16 font-bn">
      <div className="text-center space-y-2">
        <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full">
          প্রশ্নোত্তর ও জিজ্ঞাসা
        </span>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900">
          সাধারণ জিজ্ঞাসিত প্রশ্নোত্তর (FAQ)
        </h1>
        <p className="text-slate-600 text-sm">
          বোর্ড চ্যালেঞ্জ এবং আবেদনী প্ল্যাটফর্মের ব্যবহার সম্পর্কিত প্রশ্নের উত্তর
        </p>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div key={idx} className="bg-white/40 backdrop-blur-xl rounded-2xl border border-white/60 overflow-hidden shadow-sm transition-all">
              <button
                onClick={() => toggle(idx)}
                className="w-full text-left p-5 flex items-center justify-between gap-4 font-bold text-slate-900 text-sm sm:text-base cursor-pointer hover:bg-white/60 transition"
              >
                <span>{faq.questionBn}</span>
                {isOpen ? <ChevronUp className="w-5 h-5 text-blue-600 shrink-0" /> : <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />}
              </button>
              {isOpen && (
                <div className="px-5 pb-5 pt-1 text-slate-700 text-xs sm:text-sm leading-relaxed border-t border-white/40 bg-white/30 backdrop-blur-md">
                  {getDynamicAnswer(faq)}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="bg-white/40 backdrop-blur-2xl border border-white/60 p-6 sm:p-8 rounded-[32px] text-center space-y-3 shadow-xl">
        <h3 className="font-bold text-slate-900 text-base">আরও কোনো প্রশ্ন আছে?</h3>
        <p className="text-slate-600 text-xs">আমাদের কাস্টমার সাপোর্ট টিম আপনাকে সার্বক্ষণিক সহায়তা দিতে প্রস্তুত।</p>
        <a
          href={`https://wa.me/${settings.whatsappNumber || '01577777092'}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-2xl text-xs shadow-lg shadow-emerald-600/25 hover:scale-[1.02] transition-all"
        >
          <MessageSquare className="w-4 h-4" />
          <span>WhatsApp এ সাপোর্ট নিন ({settings.supportHours || 'সকাল ৭:০০ টা - রাত ১১:০০ টা'})</span>
        </a>
      </div>
    </div>
  );
};
