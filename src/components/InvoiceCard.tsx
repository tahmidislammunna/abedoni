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
  hideSensitiveData?: boolean;
}

export const InvoiceCard: React.FC<InvoiceCardProps> = ({ order, type = 'invoice', settings, hideSensitiveData = false }) => {
  const currentSettings = settings || DEFAULT_APP_SETTINGS;
  const logoWordmarkUrl = currentSettings.logoWordmarkUrl || DEFAULT_APP_SETTINGS.logoWordmarkUrl;
  const logoIconUrl = currentSettings.logoIconUrl || DEFAULT_APP_SETTINGS.logoIconUrl;

  const resolvedSubjects = resolveOrderSubjects(order);
  const subjectCount = resolvedSubjects.length;

  const calculatedOfficialFee = resolvedSubjects.reduce((sum, s) => sum + s.officialFee, 0);
  const fixedServiceFee = currentSettings.abedoniServiceFee || 49;
  
  // If order totalFee was manually increased in Admin, calculate custom extra charge if any
  const customExtraFee = (order.totalFee && order.totalFee > (calculatedOfficialFee + fixedServiceFee))
    ? (order.totalFee - calculatedOfficialFee - fixedServiceFee)
    : 0;

  const grandTotal = order.totalFee || (calculatedOfficialFee + fixedServiceFee + customExtraFee);

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
      className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4 print:space-y-3 shadow-lg relative overflow-hidden text-slate-800 font-bn print:border-2 print:border-slate-800 print:shadow-none print:p-5 print:m-0 print:w-full print:rounded-xl"
    >
      {/* Background Subtle Watermark */}
      <div className="absolute -right-12 -bottom-12 pointer-events-none opacity-[0.03] print:opacity-[0.04]">
        <img src={logoIconUrl} alt="" className="w-80 h-80 object-contain" />
      </div>

      {/* 1. Top Header: Logo Badge & Elegant Invoice Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3">
          <img
            src={logoIconUrl || logoWordmarkUrl}
            alt="Abedoni Logo"
            className="h-12 w-auto max-w-[140px] object-contain shrink-0"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <div>
            <span className="font-extrabold text-slate-900 text-lg sm:text-xl block tracking-tight">
              আবেদনী <span className="text-blue-600 text-xs font-bold font-sans">| Abedoni</span>
            </span>
            <span className="text-xs text-slate-500 font-medium block">
              SSC Board Challenge Service Portal
            </span>
          </div>
        </div>

        <div className="text-left sm:text-right w-full sm:w-auto">
          <h1 className="text-3xl sm:text-4xl font-serif text-slate-900 font-normal tracking-tight">
            {type === 'invoice' ? 'Invoice' : 'Receipt'}
          </h1>
        </div>
      </div>

      {/* 2. Billed To & Invoice Metadata Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm py-2">
        <div className="space-y-1">
          <span className="font-bold text-slate-900 block text-xs uppercase tracking-wider">Billed to:</span>
          <span className="font-extrabold text-slate-900 text-sm sm:text-base block">{order.studentName || 'Student Name'}</span>
          <span className="font-mono text-slate-700 block">{order.phone}</span>
          <span className="text-slate-600 block">
            বোর্ড: <strong className="text-slate-900">{boardDisplayName} ({boardDisplayNameBn})</strong>
          </span>
          <span className="font-mono text-slate-700 block">
            রোল: <strong>{order.roll}</strong> | রেজি: <strong>{order.reg || 'N/A'}</strong>
          </span>
        </div>

        <div className="sm:text-right space-y-1 self-start">
          <div className="text-slate-700 font-mono text-xs sm:text-sm">
            <span className="text-slate-500">Invoice No.</span> <strong className="text-slate-900 font-black">{order.id}</strong>
          </div>
          <div className="text-slate-700 text-xs sm:text-sm">
            <span className="text-slate-500">Date:</span> <strong className="text-slate-900 font-bold">{formattedDate}</strong>
          </div>
          <div className="pt-1">
            <span
              className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                order.paymentStatus === 'Paid'
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                  : 'bg-amber-100 text-amber-900 border border-amber-300'
              }`}
            >
              {order.paymentStatus === 'Paid' ? 'Paid & Verified' : 'Payment Reviewing'}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Financial Breakdown Table */}
      <div className="pt-2">
        <table className="w-full text-left text-xs sm:text-sm border-collapse">
          <thead>
            <tr className="border-t-2 border-b-2 border-slate-900 text-slate-900 font-bold">
              <th className="py-2.5 px-2 text-left">Item Description</th>
              <th className="py-2.5 px-2 text-right">Amount (BDT)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 font-medium text-slate-800">
            {resolvedSubjects.map((sub, idx) => (
              <tr key={idx} className="hover:bg-slate-50/50">
                <td className="py-3 px-2">
                  <span className="font-bold text-slate-900 block">
                    Board Challenge: {sub.nameEn} ({sub.nameBn})
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono block">Subject Code: {sub.code}</span>
                </td>
                <td className="py-3 px-2 text-right font-mono font-bold text-slate-900">৳{sub.officialFee}</td>
              </tr>
            ))}

            <tr className="bg-slate-50/50">
              <td className="py-3 px-2">
                <span className="font-bold text-slate-900 block">Abedoni Online Service & Processing Fee</span>
                <span className="text-[10px] text-slate-500 block">অনলাইন প্রসেসিং ও সাপোর্ট চার্জ (ফিক্সড ৳৪৯)</span>
              </td>
              <td className="py-3 px-2 text-right font-mono font-bold text-blue-900">৳{fixedServiceFee}</td>
            </tr>

            {customExtraFee > 0 && (
              <tr className="bg-amber-50/40">
                <td className="py-3 px-2">
                  <span className="font-bold text-slate-900 block">Custom / Manual Additional Charge</span>
                  <span className="text-[10px] text-slate-500 block">অন্যান্য কাস্টম সার্ভিস বা প্রসেসিং ফি</span>
                </td>
                <td className="py-3 px-2 text-right font-mono font-bold text-amber-900">৳{customExtraFee}</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Subtotal & Total Box (Clean, High-Contrast Light Box without dark background) */}
        <div className="pt-4 space-y-2 text-xs sm:text-sm">
          <div className="flex justify-end gap-12 text-slate-700">
            <span className="font-bold">Board Subtotal</span>
            <span className="font-mono font-bold">৳{calculatedOfficialFee}</span>
          </div>
          <div className="flex justify-end gap-12 text-slate-700">
            <span className="font-bold">Service Fee</span>
            <span className="font-mono font-bold">৳{fixedServiceFee}</span>
          </div>
          {customExtraFee > 0 && (
            <div className="flex justify-end gap-12 text-slate-700">
              <span className="font-bold">Custom Fee</span>
              <span className="font-mono font-bold">৳{customExtraFee}</span>
            </div>
          )}

          <div className="bg-slate-50 border-2 border-slate-900 text-slate-900 p-3 sm:p-3.5 rounded-xl font-black text-base sm:text-lg flex items-center justify-between w-full max-w-xs ml-auto shadow-2xs">
            <span>Total</span>
            <span className="font-mono text-emerald-700">৳{grandTotal} BDT</span>
          </div>
        </div>
      </div>

      {/* 4. Handwritten "Thank You!" & Payment Information Footer */}
      <div className="pt-8 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-6 items-end">
        <div className="space-y-4">
          <div className="font-serif italic text-3xl sm:text-4xl text-slate-800 tracking-wide font-normal">
            Thank You!
          </div>

          <div className="space-y-1 text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
            <span className="font-bold text-slate-900 block text-xs uppercase tracking-wider mb-1">
              Payment Information
            </span>
            <p className="font-medium">
              মাধ্যম: <strong className="text-slate-900 font-bold">{order.paymentMethod || 'Mobile Banking'}</strong>
            </p>
            {!hideSensitiveData && (
              <>
                <p className="font-mono text-[11px]">
                  TrxID: <strong className="text-blue-700 font-bold">{order.trxId || 'N/A'}</strong>
                </p>
                <p className="font-mono text-[11px]">
                  প্রেরক নম্বর: <strong>{order.paymentSenderPhone || order.phone}</strong>
                </p>
              </>
            )}
            <p className="text-[10px] text-slate-500 pt-1 border-t border-slate-200 mt-1">
              Pay by: {formattedDate} | Status: <strong className="text-emerald-700">{order.paymentStatus}</strong>
            </p>
          </div>
        </div>

        <div className="sm:text-right space-y-1 text-xs text-slate-600">
          <p className="font-serif text-lg font-bold text-slate-900">Abedoni Digital</p>
          <p className="font-mono text-[11px]">Helpline: {currentSettings.whatsappNumber || '01577777092'}</p>
          <p className="font-mono text-[10px] text-blue-600 font-bold truncate">
            Track: {trackingUrl}
          </p>
        </div>
      </div>
    </div>
  );
};
