import React from 'react';
import { Calculator, CheckCircle2, ShieldCheck, Sparkles, HelpCircle, Headphones, BookOpen } from 'lucide-react';
import { getAppSettings } from '../data/appSettings';

interface PricingViewProps {
  onStartApplication: () => void;
}

export const PricingView: React.FC<PricingViewProps> = ({ onStartApplication }) => {
  const settings = getAppSettings();
  const boardFee = settings.officialBoardFee || 175;
  const platformFee = settings.abedoniServiceFee || 49;

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20 font-bn">
      
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2">
          <span className="bg-emerald-100 text-emerald-900 text-xs font-black px-3 py-1 rounded-full border border-emerald-200">
            গাইডলাইন ১০০% ফ্রি
          </span>
          <span className="bg-blue-100/90 text-blue-800 text-xs font-bold px-3 py-1 rounded-full border border-blue-200">
            ১০০% স্বচ্ছ ফি তালিকা
          </span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900">
          SSC 2026 ফি ও সার্ভিস চার্জ বিবরণী
        </h1>
        <p className="text-slate-600 text-xs sm:text-sm max-w-2xl mx-auto">
          ফ্রি অনলাইন নির্দেশিকা মেনে নিজে আবেদন করুন অথবা আবেদনী-এর মাত্র ৳{platformFee} সার্ভিস চার্জে অভিজ্ঞদের সহায়তা নিন।
        </p>
      </div>

      {/* Pricing Cards (2 Models) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* OPTION 1: "নিজে করুন" */}
        <div className="bg-white/80 backdrop-blur-2xl p-6 sm:p-8 rounded-[32px] border border-slate-200 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center font-bold text-xl">
              <BookOpen className="w-6 h-6" />
            </div>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-3 py-1 rounded-full">
              অপশন ১: নিজে করুন
            </span>
          </div>

          <div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900">ফ্রি অনলাইন আবেদন গাইড</h3>
            <p className="text-slate-500 text-xs mt-1">অফিশিয়াল পোর্টালে নিজে আবেদন করার নিয়মাবলী</p>
          </div>
          
          <div className="text-3xl font-black text-emerald-700 font-mono">
            ৳০ <span className="text-xs text-slate-500 font-normal font-bn">/ আবেদনী চার্জ (ফ্রি)</span>
          </div>

          <ul className="space-y-2.5 text-xs text-slate-700 pt-3 border-t border-slate-200">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>সম্পূর্ণ ফ্রি স্টেপ-বাই-স্টেপ অনলাইন গাইডলাইন</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>অফিশিয়াল বোর্ড ফি (৳{boardFee}/বিষয়) সরাসরি অফিশিয়াল পোর্টালে পরিশোধ করবেন</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>কোনো সার্ভিস ফি বা অতিরিক্ত চার্জ নেই</span>
            </li>
          </ul>
        </div>

        {/* OPTION 2: "অভিজ্ঞদের সহায়তা নিন" */}
        <div className="bg-slate-900/95 text-white backdrop-blur-2xl p-6 sm:p-8 rounded-[32px] space-y-4 shadow-2xl border border-slate-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center font-bold text-xl">
              <Headphones className="w-6 h-6" />
            </div>
            <span className="bg-blue-600 text-white text-xs font-black px-3 py-1 rounded-full">
              অপশন ২: সহায়তা নিন
            </span>
          </div>

          <div>
            <h3 className="text-lg sm:text-xl font-bold text-white">আবেদনী অনলাইন সহায়তা সার্ভিস</h3>
            <p className="text-slate-400 text-xs mt-1">অভিজ্ঞ সাপোর্ট টিমের মাধ্যমে নির্ভুল প্রসেসিং</p>
          </div>

          <div className="text-3xl font-black text-emerald-400 font-mono">
            ৳{platformFee} <span className="text-xs text-slate-400 font-normal font-bn">/ আবেদনী সার্ভিস চার্জ</span>
          </div>

          <ul className="space-y-2.5 text-xs text-slate-300 pt-3 border-t border-slate-800">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>একসাথে যত বিষয়ের আবেদনই করুন না কেন, সার্ভিস চার্জ মাত্র ৳{platformFee}</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>অফিশিয়াল বোর্ড ফি (৳{boardFee}/বিষয়) আলাদা পরিশোধযোগ্য</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>হোয়াটসঅ্যাপ সাপোর্ট, সঠিক ডেটা এন্ট্রি ও ডিজিটাল রসিদ সুবিধা</span>
            </li>
          </ul>
        </div>

      </div>

      {/* Comparative Calculation Table */}
      <div className="bg-white/80 backdrop-blur-2xl p-6 sm:p-8 rounded-[32px] border border-white/80 shadow-xl space-y-4">
        <h3 className="text-lg font-bold text-slate-900 border-b border-slate-200/60 pb-2">
          বিষয় ভিত্তিক খরচ হিসাবের উদাহরণ
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-100/90 text-slate-800 font-bold">
              <tr>
                <th className="p-3">বিষয়</th>
                <th className="p-3">অফিশিয়াল বোর্ড ফি</th>
                <th className="p-3">আবেদনী সার্ভিস ফি</th>
                <th className="p-3">সর্বমোট সার্ভিস সহ</th>
                <th className="p-3 text-emerald-700">ডিজিটাল সেবার সুবিধা</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              <tr>
                <td className="p-3 font-bn font-bold">১ টি বিষয়</td>
                <td className="p-3">৳{boardFee}</td>
                <td className="p-3">৳{platformFee}</td>
                <td className="p-3 font-bold text-blue-700">৳{boardFee + platformFee}</td>
                <td className="p-3 font-bold text-emerald-700 font-bn">ঘরে বসেই ৫ মিনিটে সাপোর্ট</td>
              </tr>
              <tr>
                <td className="p-3 font-bn font-bold">২ টি বিষয়</td>
                <td className="p-3">৳{boardFee * 2}</td>
                <td className="p-3">৳{platformFee}</td>
                <td className="p-3 font-bold text-blue-700">৳{(boardFee * 2) + platformFee}</td>
                <td className="p-3 font-bold text-emerald-700 font-bn">কম্পিউটার দোকানে যাতায়াত বিহীন</td>
              </tr>
              <tr>
                <td className="p-3 font-bn font-bold">৩ টি বিষয়</td>
                <td className="p-3">৳{boardFee * 3}</td>
                <td className="p-3">৳{platformFee}</td>
                <td className="p-3 font-bold text-blue-700">৳{(boardFee * 3) + platformFee}</td>
                <td className="p-3 font-bold text-emerald-700 font-bn">১০০% সঠিক ও বিশ্বস্ত সেবা</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="pt-4 text-center">
          <button
            type="button"
            onClick={onStartApplication}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3.5 rounded-2xl text-xs sm:text-sm transition shadow-lg shadow-blue-600/25 cursor-pointer"
          >
            অনলাইন গাইড অথবা সহায়তা নিন
          </button>
        </div>
      </div>

    </div>
  );
};
