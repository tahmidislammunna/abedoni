import React from 'react';
import { BoardChallengeOrder } from '../types';
import { SSC_SUBJECTS, BOARDS_LIST } from '../data/boardsAndSubjects';
import { AppSettings, DEFAULT_APP_SETTINGS } from '../data/appSettings';
import { CheckCircle2, ShieldCheck, FileText, Phone, Calendar, Hash, User, CreditCard } from 'lucide-react';

export interface InvoiceSubjectItem {
  code: string;
  nameEn: string;
  nameBn: string;
  officialFee: number;
}

export function resolveOrderSubjects(order: BoardChallengeOrder): InvoiceSubjectItem[] {
  const codesOrNames = order.subjects || [];
  const bnNames = order.subjectNamesBn || [];

  if (codesOrNames.length === 0 && bnNames.length === 0) {
    return [{ code: 'N/A', nameEn: 'General Subject', nameBn: 'সাধারণ বিষয়', officialFee: 150 }];
  }

  if (codesOrNames.length > 0) {
    return codesOrNames.map((item, idx) => {
      const cleanItem = String(item).trim();

      // Match against SSC_SUBJECTS code
      const matchByCode = SSC_SUBJECTS.find(s => s.code === cleanItem);
      if (matchByCode) {
        return {
          code: matchByCode.code,
          nameEn: matchByCode.nameEn,
          nameBn: matchByCode.nameBn,
          officialFee: matchByCode.fee || 150,
        };
      }

      // Match against bnNames at same index
      const bnMatch = bnNames[idx];
      if (bnMatch) {
        const matchByBn = SSC_SUBJECTS.find(s => s.nameBn === bnMatch || s.nameEn === bnMatch);
        if (matchByBn) {
          return {
            code: matchByBn.code,
            nameEn: matchByBn.nameEn,
            nameBn: matchByBn.nameBn,
            officialFee: matchByBn.fee || 150,
          };
        }
        return {
          code: cleanItem.length <= 4 && !isNaN(Number(cleanItem)) ? cleanItem : 'SUB',
          nameEn: bnMatch,
          nameBn: bnMatch,
          officialFee: 150,
        };
      }

      // Match cleanItem against nameBn or nameEn
      const matchByName = SSC_SUBJECTS.find(s => s.nameBn === cleanItem || s.nameEn === cleanItem);
      if (matchByName) {
        return {
          code: matchByName.code,
          nameEn: matchByName.nameEn,
          nameBn: matchByName.nameBn,
          officialFee: matchByName.fee || 150,
        };
      }

      return {
        code: cleanItem.length <= 4 ? cleanItem : 'SUB',
        nameEn: cleanItem,
        nameBn: cleanItem,
        officialFee: 150,
      };
    });
  }

  return bnNames.map((bnName) => {
    const match = SSC_SUBJECTS.find(s => s.nameBn === bnName || s.nameEn === bnName);
    if (match) {
      return {
        code: match.code,
        nameEn: match.nameEn,
        nameBn: match.nameBn,
        officialFee: match.fee || 150,
      };
    }
    return {
      code: 'SUB',
      nameEn: bnName,
      nameBn: bnName,
      officialFee: 150,
    };
  });
}

interface InvoiceCardProps {
  order: BoardChallengeOrder;
  type?: 'invoice' | 'receipt';
  settings?: AppSettings;
}

export const InvoiceCard: React.FC<InvoiceCardProps> = ({ order, type = 'invoice', settings }) => {
  const currentSettings = settings || DEFAULT_APP_SETTINGS;
  const logoWordmarkUrl = currentSettings.logoWordmarkUrl || DEFAULT_APP_SETTINGS.logoWordmarkUrl;
  const logoIconUrl = currentSettings.logoIconUrl || DEFAULT_APP_SETTINGS.logoIconUrl;

  const resolvedSubjects = resolveOrderSubjects(order);
  const subjectCount = resolvedSubjects.length;

  const officialFeePerSub = currentSettings.officialBoardFee || 150;
  const calculatedOfficialFee = order.officialFee || (subjectCount * officialFeePerSub);
  const calculatedPlatformFee = order.platformFee || currentSettings.abedoniServiceFee || 49;
  const grandTotal = order.totalFee || (calculatedOfficialFee + calculatedPlatformFee);

  const boardObj = BOARDS_LIST.find(b => b.code === order.board);
  const boardDisplayName = boardObj ? `${boardObj.nameEn} Board` : `${order.board} Board`;
  const boardDisplayNameBn = boardObj ? boardObj.nameBn : `${order.board} বোর্ড`;

  const siteUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const trackingUrl = `${siteUrl}/tracking?id=${order.id}`;

  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const formattedDateBn = new Date(order.createdAt).toLocaleDateString('bn-BD', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div
      id="digital-receipt-printable"
      className="bg-white border-2 border-slate-200 rounded-[28px] p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden text-slate-800 font-bn print:border-none print:shadow-none print:p-0 print:m-0"
    >
      {/* Background Subtle Watermark */}
      <div className="absolute -right-12 -bottom-12 pointer-events-none opacity-[0.03] print:opacity-[0.05]">
        <img src={logoIconUrl} alt="" className="w-96 h-96 object-contain" />
      </div>

      {/* 1. Header Section: Logo, Wordmark & Document Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b-2 border-slate-100 pb-6 print:pb-4">
        <div className="flex items-center gap-3.5">
          <img
            src={logoWordmarkUrl}
            alt="Abedoni Wordmark Logo"
            className="h-12 sm:h-14 w-auto object-contain max-w-[180px] sm:max-w-[220px]"
            onError={(e) => {
              (e.target as HTMLImageElement).src = logoIconUrl;
            }}
          />
          <div className="border-l-2 border-slate-200 pl-3.5">
            <span className="font-black text-slate-900 text-xl sm:text-2xl block tracking-tight">
              আবেদনী <span className="text-blue-600 text-sm font-bold font-sans">| Abedoni</span>
            </span>
            <span className="text-xs text-slate-500 font-medium block">
              SSC Board Challenge Service Portal
            </span>
            <span className="text-[11px] text-slate-400 font-mono font-semibold block mt-0.5">
              Helpline: {currentSettings.whatsappNumber || '+8801577777092'}
            </span>
          </div>
        </div>

        <div className="text-left sm:text-right w-full sm:w-auto bg-slate-50 sm:bg-transparent p-3.5 sm:p-0 rounded-2xl border sm:border-0 border-slate-100">
          <span
            className={`inline-block px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider mb-1.5 ${
              type === 'invoice'
                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
            }`}
          >
            {type === 'invoice' ? 'INVOICE MEMO' : 'OFFICIAL RECEIPT'}
          </span>
          <div className="flex items-center sm:justify-end gap-1 text-slate-900">
            <Hash className="w-3.5 h-3.5 text-blue-600" />
            <span className="font-mono font-black text-base sm:text-lg tracking-tight">
              {order.id}
            </span>
          </div>
          <div className="flex items-center sm:justify-end gap-1 text-slate-500 text-xs mt-0.5">
            <Calendar className="w-3 h-3 text-slate-400" />
            <span>
              {formattedDate} ({formattedDateBn})
            </span>
          </div>
        </div>
      </div>

      {/* 2. Customer & Exam Specifications */}
      <div className="bg-slate-50/80 p-4 sm:p-5 rounded-2xl border border-slate-200/80 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
          <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <User className="w-4 h-4 text-blue-600" />
            <span>শিক্ষার্থীর তথ্য (Customer Details)</span>
          </span>
          <span className="text-[11px] font-bold text-slate-500 font-mono">
            STATUS: <strong className="text-emerald-700 uppercase">{order.orderStatus}</strong>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs sm:text-sm">
          <div>
            <span className="text-[11px] text-slate-500 font-semibold block">শিক্ষার্থীর নাম</span>
            <span className="font-extrabold text-slate-900 text-sm block">
              {order.studentName || 'N/A'}
            </span>
          </div>

          <div>
            <span className="text-[11px] text-slate-500 font-semibold block">মোবাইল নম্বর</span>
            <span className="font-black font-mono text-slate-900 text-sm block">
              {order.phone}
            </span>
          </div>

          <div>
            <span className="text-[11px] text-slate-500 font-semibold block">শিক্ষা বোর্ড</span>
            <span className="font-bold text-blue-900 text-xs sm:text-sm block">
              {boardDisplayName} ({boardDisplayNameBn})
            </span>
          </div>

          <div>
            <span className="text-[11px] text-slate-500 font-semibold block">রোল ও রেজিস্ট্রেশন</span>
            <span className="font-black font-mono text-slate-900 text-xs sm:text-sm block">
              Roll: {order.roll} | Reg: {order.reg || 'N/A'}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Selected Subjects Detailed Breakdown (Requirement 10) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            <span>আবেদনকৃত বিষয়সমূহ (Selected Subjects List)</span>
          </span>
          <span className="text-xs font-mono font-bold bg-blue-50 text-blue-800 border border-blue-200 px-2.5 py-0.5 rounded-full">
            {subjectCount} {subjectCount === 1 ? 'Subject' : 'Subjects'}
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden divide-y divide-slate-100 shadow-2xs">
          {resolvedSubjects.map((sub, idx) => (
            <div key={idx} className="p-3.5 sm:p-4 flex items-center justify-between gap-3 hover:bg-slate-50/50 transition">
              <div className="flex items-start gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 mt-1 shrink-0"></span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-slate-900 text-sm sm:text-base leading-snug">
                      • {sub.nameEn}
                    </span>
                    <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                      Code: {sub.code}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 font-medium block mt-0.5">
                    {sub.nameBn}
                  </span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-xs font-mono font-bold text-slate-700 block">
                  ৳{sub.officialFee} BDT
                </span>
                <span className="text-[10px] text-slate-400 block">Board Fee</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Financial Breakdown Table (Distinguishing Service Charge vs Official Fee) */}
      <div className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden text-xs sm:text-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
              <th className="p-3 sm:p-3.5">ফি বিবরণী (Fee Item Description)</th>
              <th className="p-3 sm:p-3.5 text-center">পরিমাণ</th>
              <th className="p-3 sm:p-3.5 text-right">টাকা (BDT)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
            <tr>
              <td className="p-3 sm:p-3.5">
                <span className="font-bold text-slate-900 block text-xs sm:text-sm">
                  অফিসিয়াল সরকারি বোর্ড ফি (Official Education Board Fee)
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  শিক্ষা বোর্ড নির্ধারিত পুনঃনিরীক্ষণ ফি (প্রতি বিষয় ৳{officialFeePerSub})
                </span>
              </td>
              <td className="p-3 sm:p-3.5 text-center font-mono font-bold text-slate-700">
                {subjectCount} টি বিষয়
              </td>
              <td className="p-3 sm:p-3.5 text-right font-mono font-black text-slate-900 text-sm sm:text-base">
                ৳{calculatedOfficialFee}
              </td>
            </tr>

            <tr className="bg-blue-50/30">
              <td className="p-3 sm:p-3.5">
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-blue-900 text-xs sm:text-sm">
                    আবেদনী অনলাইন সাপোর্ট ও সার্ভিস চার্জ (Abedoni Service Charge)
                  </span>
                  <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.5 rounded border border-blue-200">
                    Abedoni
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  অনলাইন আবেদন সহায়তা, প্রসেসিং ও অটোমেটেড ট্র্যাকিং সার্ভিস চার্জ
                </span>
              </td>
              <td className="p-3 sm:p-3.5 text-center font-mono font-bold text-slate-700">
                ১ টি সার্ভিস
              </td>
              <td className="p-3 sm:p-3.5 text-right font-mono font-black text-blue-900 text-sm sm:text-base">
                ৳{calculatedPlatformFee}
              </td>
            </tr>
          </tbody>

          <tfoot>
            <tr className="bg-slate-900 text-white font-bold border-t-2 border-slate-900">
              <td colSpan={2} className="p-3.5 sm:p-4 text-right uppercase tracking-wider font-extrabold text-xs sm:text-sm">
                সর্বমোট প্রদেয় / পরিশোধিত ফি (Grand Total):
              </td>
              <td className="p-3.5 sm:p-4 text-right font-mono font-black text-emerald-400 text-lg sm:text-xl">
                ৳{grandTotal} BDT
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* 5. Payment Details Card */}
      <div className="bg-slate-900 text-white p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <CreditCard className="w-4 h-4 text-emerald-400" />
            <span>
              পেমেন্ট মাধ্যম: <strong className="text-white font-bold">{order.paymentMethod || 'Mobile Banking'}</strong>
            </span>
          </div>
          <div className="text-xs font-mono text-slate-300">
            Transaction ID (TrxID): <strong className="text-amber-300 font-black text-sm">{order.trxId || 'N/A'}</strong>
          </div>
          <div className="text-xs text-slate-300">
            পেমেন্ট প্রেরক: <span className="font-mono text-white font-bold">{order.paymentSenderPhone || order.phone}</span>
          </div>
        </div>

        <div className="text-left sm:text-right border-t sm:border-t-0 sm:border-l border-slate-800 pt-2 sm:pt-0 sm:pl-5 w-full sm:w-auto">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
            পেমেন্ট স্ট্যাটাস
          </span>
          <span
            className={`inline-block font-extrabold text-xs sm:text-sm px-3 py-1 rounded-lg border mt-1 ${
              order.paymentStatus === 'Paid'
                ? 'bg-emerald-950 text-emerald-400 border-emerald-700'
                : 'bg-amber-950 text-amber-400 border-amber-700'
            }`}
          >
            ✓ {order.paymentStatus === 'Paid' ? 'পরিশোধিত (Paid & Verified)' : 'যাচাইাধীন (Reviewing)'}
          </span>
        </div>
      </div>

      {/* 6. Verification Seal & Printable Footer */}
      <div className="border-t border-slate-200 pt-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
        <div className="space-y-0.5 text-center sm:text-left">
          <p className="font-semibold text-slate-700">
            এটি একটি ডিজিটালভাবে তৈরি অফিসিয়াল {type === 'invoice' ? 'ইনভয়েস মেমো' : 'মানি রিসিট'}। কোনো ম্যানুয়াল স্বাক্ষরের প্রয়োজন নেই।
          </p>
          <p className="font-mono text-[11px] text-blue-600 font-bold truncate">
            Live Order Tracking Link: {trackingUrl}
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 bg-slate-100 text-slate-800 font-bold px-3 py-1.5 rounded-xl border border-slate-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span className="text-[11px] font-mono uppercase tracking-wider">Abedoni Digital Verified Seal</span>
        </div>
      </div>
    </div>
  );
};
