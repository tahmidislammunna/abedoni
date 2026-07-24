import React, { useState } from 'react';
import { X, ShieldCheck, FileText, RefreshCw } from 'lucide-react';

interface PoliciesModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPolicy?: 'privacy' | 'terms' | 'refund';
}

export const PoliciesModal: React.FC<PoliciesModalProps> = ({
  isOpen,
  onClose,
  initialPolicy = 'privacy'
}) => {
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms' | 'refund'>(initialPolicy);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 font-bn">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 max-h-[85vh] overflow-y-auto">
        
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-bold text-slate-900">আবেদনী নীতিমালা ও শর্তাবলী</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 font-bold text-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-slate-100 pb-2 text-xs font-bold">
          <button
            onClick={() => setActiveTab('privacy')}
            className={`px-3 py-1.5 rounded-lg transition ${activeTab === 'privacy' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            গোপনীয়তা নীতি (Privacy)
          </button>
          <button
            onClick={() => setActiveTab('terms')}
            className={`px-3 py-1.5 rounded-lg transition ${activeTab === 'terms' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            ব্যবহারের শর্তাবলী (Terms)
          </button>
          <button
            onClick={() => setActiveTab('refund')}
            className={`px-3 py-1.5 rounded-lg transition ${activeTab === 'refund' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            রিফান্ড পলিসি (Refund)
          </button>
        </div>

        {/* Content Body */}
        <div className="text-xs sm:text-sm text-slate-700 space-y-3 leading-relaxed">
          {activeTab === 'privacy' && (
            <>
              <h4 className="font-bold text-slate-900 text-base">১. তথ্য সংরক্ষণ ও সুরক্ষার নীতিমালা</h4>
              <p>আবেদনী প্ল্যাটফর্মের মূল অগ্রাধিকার হলো আপনার ব্যক্তিগত তথ্যের সর্বোচ্চ নিরাপত্তা বজায় রাখা। আপনার দেওয়া নাম, রোল, রেজিস্ট্রেশন নম্বর এবং মোবাইল নম্বর কেবল আপনার অনুরোধকৃত বোর্ড চ্যালেঞ্জ আবেদন সম্পন্ন করার উদ্দেশ্যে ব্যবহৃত হয়।</p>
              <p>আমরা তৃতীয় কোনো ব্যক্তি বা বাণিজ্যিক প্রতিষ্ঠানের কাছে আপনার তথ্য বিক্রি বা হস্তান্তর করি না।</p>
            </>
          )}

          {activeTab === 'terms' && (
            <>
              <h4 className="font-bold text-slate-900 text-base">২. সেবার শর্তাবলী</h4>
              <p>আবেদনী একটি থার্ড-পার্টি সার্ভিস প্রোভাইডার যা শিক্ষার্থীদের বোর্ড চ্যালেঞ্জ আবেদনে কারিগরি সহায়তা দেয়। আমরা শিক্ষা বোর্ডের অফিসিয়াল পোর্টালে আপনার দেওয়া তথ্য অনুযায়ী আবেদন সাবমিট করে দিই।</p>
              <p>শিক্ষার্থীকে নিশ্চিত করতে হবে যে দেওয়া রোল ও রেজিস্ট্রেশন নম্বর সম্পূর্ণ সঠিক। ভুল তথ্যের কারণে বোর্ডের আবেদন ব্যর্থ হলে প্ল্যাটফর্ম দায়ী থাকবে না।</p>
            </>
          )}

          {activeTab === 'refund' && (
            <>
              <h4 className="font-bold text-slate-900 text-base">৩. রিফান্ড ও অর্থ ফেরত পলিসি</h4>
              <p>যদি কারিগরি কোনো ক্রুটি বা আমাদের ভুলের কারণে আবেদনের আগে বাতিল হয়, তবে ১০০% টাকা অবিলম্বে শিক্ষার্থীকে বিকাশ/নগদে ফেরত দেওয়া হবে।</p>
              <p>বোর্ডের সার্ভারে সফলভাবে আবেদন জমা ও কনফার্মেশন কোড আসার পর কোনো আবেদনের ফি অফিশিয়াল রুলের কারণে অফারযোগ্য নয়।</p>
            </>
          )}
        </div>

        <div className="pt-2 text-right">
          <button
            onClick={onClose}
            className="bg-slate-900 text-white font-bold px-5 py-2 rounded-xl text-xs hover:bg-slate-800"
          >
            বন্ধ করুন
          </button>
        </div>

      </div>
    </div>
  );
};
