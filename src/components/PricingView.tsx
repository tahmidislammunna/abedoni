import React from 'react';
import { Calculator, CheckCircle2, ShieldCheck, Sparkles, HelpCircle } from 'lucide-react';
import { getAppSettings } from '../data/appSettings';

interface PricingViewProps {
  onStartApplication: () => void;
}

export const PricingView: React.FC<PricingViewProps> = ({ onStartApplication }) => {
  const settings = getAppSettings();
  const boardFee = settings.officialBoardFee || 175;
  const platformFee = settings.abedoniServiceFee || 99;
  const smsFee = settings.smsFeePerSubject || 6;

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20 font-bn">
      
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="bg-blue-100/90 text-blue-800 text-xs font-bold px-3 py-1 rounded-full border border-blue-200">
          ১০০% স্বচ্ছ মূল্যতালিকা
        </span>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900">
          বোর্ড ফি, SMS চার্জ এবং আবেদনী সার্ভিস চার্জ
        </h1>
        <p className="text-slate-600 text-xs sm:text-sm max-w-2xl mx-auto">
          কোনো গোপন চার্জ নেই। আমরা কম্পিউটার দোকানের বাড়তি ফি থেকে শিক্ষার্থীদের সর্বোচ্চ সাশ্রয় দিতে কাজ করি।
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Official Board Fee */}
        <div className="bg-white/70 backdrop-blur-2xl p-6 rounded-[32px] border border-white/80 shadow-xl space-y-4">
          <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-2xl flex items-center justify-center font-bold text-xl shadow-xs">
            ৳
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">শিক্ষা বোর্ডের অফিশিয়াল ফি</h3>
            <p className="text-slate-500 text-xs mt-1">সবগুলো শিক্ষা বোর্ডের নির্ধারিত ফি</p>
          </div>
          
          <div className="text-2xl sm:text-3xl font-black text-blue-700 font-mono">
            ৳{boardFee} <span className="text-xs text-slate-500 font-normal font-bn">/ প্রতি বিষয়</span>
          </div>

          <ul className="space-y-2 text-xs text-slate-700 pt-2 border-t border-slate-200/60">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>১ম ও ২য় পত্র মিলিয়ে ১ বিষয়</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>বোর্ডের সরাসরি অফিশিয়াল ফি</span>
            </li>
          </ul>
        </div>

        {/* SMS Charge */}
        <div className="bg-amber-500/10 backdrop-blur-2xl p-6 rounded-[32px] border border-amber-200/60 shadow-xl space-y-4">
          <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center font-bold text-xl shadow-xs">
            ✉️
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">টেলিটক SMS ফি</h3>
            <p className="text-slate-500 text-xs mt-1">অফিশিয়াল সিস্টেম কমান্ড SMS চার্জ</p>
          </div>
          
          <div className="text-2xl sm:text-3xl font-black text-amber-700 font-mono">
            ৳{smsFee} <span className="text-xs text-slate-500 font-normal font-bn">/ প্রতি আবেদন (স্থায়ী)</span>
          </div>

          <ul className="space-y-2 text-xs text-slate-700 pt-2 border-t border-amber-200/60">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
              <span>টেলিটক ১৬২২২ কমান্ড ফি</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
              <span>২টি SMS × ৳৩ = ৳৬ (নির্দিষ্ট)</span>
            </li>
          </ul>
        </div>

        {/* Abedoni Platform Fee */}
        <div className="bg-slate-900/95 backdrop-blur-2xl text-white p-6 rounded-[32px] space-y-4 shadow-2xl border border-slate-800">
          <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center font-bold text-xl">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">আবেদনী সার্ভিস চার্জ</h3>
            <p className="text-slate-400 text-xs mt-1">ডিজিটাল প্রসেসিং ও সাপোর্ট</p>
          </div>

          <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
            ৳{platformFee} <span className="text-xs text-slate-400 font-normal font-bn">/ প্রতি আবেদন (Abedoni)</span>
          </div>

          <ul className="space-y-2 text-xs text-slate-300 pt-2 border-t border-slate-800">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>একসাথে যত বিষয়ই চান, ফি মাত্র ৳{platformFee}</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>ডিজিটাল রসিদ ও হোয়াটসঅ্যাপ প্রুফ</span>
            </li>
          </ul>
        </div>

      </div>

      {/* Examples Table */}
      <div className="bg-white/70 backdrop-blur-2xl p-6 sm:p-8 rounded-[32px] border border-white/80 shadow-xl space-y-4">
        <h3 className="text-lg font-bold text-slate-900 border-b border-slate-200/60 pb-2">
          উদাহরণমূলক খরচ হিসাব
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-100/90 text-slate-800 font-bold">
              <tr>
                <th className="p-3">বিষয়</th>
                <th className="p-3">বোর্ড ফি</th>
                <th className="p-3">SMS ফি</th>
                <th className="p-3">আবেদনী ফি</th>
                <th className="p-3">সর্বমোট</th>
                <th className="p-3 text-emerald-700">দোকানের চেয়ে আপনার সাশ্রয়</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              <tr>
                <td className="p-3 font-bn font-bold">১ টি বিষয়</td>
                <td className="p-3">৳{boardFee}</td>
                <td className="p-3">৳{smsFee}</td>
                <td className="p-3">৳{platformFee}</td>
                <td className="p-3 font-bold text-blue-700">৳{boardFee + smsFee + platformFee}</td>
                <td className="p-3 font-bold text-emerald-600 font-bn">৳১০০ - ৳১৫০ সাশ্রয়</td>
              </tr>
              <tr>
                <td className="p-3 font-bn font-bold">২ টি বিষয়</td>
                <td className="p-3">৳{boardFee * 2}</td>
                <td className="p-3">৳{smsFee}</td>
                <td className="p-3">৳{platformFee}</td>
                <td className="p-3 font-bold text-blue-700">৳{(boardFee * 2) + smsFee + platformFee}</td>
                <td className="p-3 font-bold text-emerald-600 font-bn">৳১৫০ - ৳২০০ সাশ্রয়</td>
              </tr>
              <tr>
                <td className="p-3 font-bn font-bold">৩ টি বিষয়</td>
                <td className="p-3">৳{boardFee * 3}</td>
                <td className="p-3">৳{smsFee}</td>
                <td className="p-3">৳{platformFee}</td>
                <td className="p-3 font-bold text-blue-700">৳{(boardFee * 3) + smsFee + platformFee}</td>
                <td className="p-3 font-bold text-emerald-600 font-bn">৳২০০ - ৳৩০০ সাশ্রয়</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="pt-4 text-center">
          <button
            onClick={onStartApplication}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3.5 rounded-2xl text-sm transition shadow-lg shadow-blue-600/25 cursor-pointer"
          >
            এখনই আবেদন ফরম ফিলআপ করুন
          </button>
        </div>
      </div>

    </div>
  );
};
