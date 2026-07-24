import React from 'react';
import { Bell, Calendar, ShieldAlert } from 'lucide-react';
import { NOTICES } from '../data/mockData';

export const NoticeView: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16 font-bn">
      <div className="text-center space-y-2">
        <span className="bg-amber-100 text-amber-900 text-xs font-bold px-3 py-1 rounded-full border border-amber-200">
          অফিসিয়াল আপডেট
        </span>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900">
          বোর্ড চ্যালেঞ্জ নোটিশ বোর্ড
        </h1>
        <p className="text-slate-600 text-sm">
          শিক্ষা বোর্ড সমূহের সাম্প্রতিক সময়সীমা, দিকনির্দেশনা ও অফিশিয়াল বিজ্ঞপ্তি
        </p>
      </div>

      <div className="space-y-4">
        {NOTICES.map(not => (
          <div key={not.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                not.isImportant ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-blue-100 text-blue-800'
              }`}>
                {not.isImportant ? 'জরুরি নোটিশ' : not.category}
              </span>
              <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {not.date}
              </span>
            </div>

            <h3 className="text-lg font-bold text-slate-900">{not.titleBn}</h3>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">{not.contentBn}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
