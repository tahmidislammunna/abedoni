import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, FileText, RefreshCw, AlertTriangle, Scale, Lock, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface PoliciesModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPolicy?: 'privacy' | 'terms' | 'refund' | 'disclaimer';
}

export const PoliciesModal: React.FC<PoliciesModalProps> = ({
  isOpen,
  onClose,
  initialPolicy = 'disclaimer'
}) => {
  const [activeTab, setActiveTab] = useState<'disclaimer' | 'terms' | 'privacy' | 'refund'>(initialPolicy);

  useEffect(() => {
    setActiveTab(initialPolicy);
  }, [initialPolicy]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 font-bn transition-all animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-4 sm:p-7 space-y-5 shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col my-auto overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-xl font-extrabold text-slate-900 leading-tight">
                আবেদনী (Abedoni) - আইনি নোটিশ ও নীতিমালা
              </h3>
              <p className="text-[11px] text-slate-500">Legal Notice, Disclaimer & Service Terms</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition cursor-pointer shrink-0"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-1.5 border-b border-slate-200/80 pb-2 text-xs font-bold shrink-0">
          <button
            onClick={() => setActiveTab('disclaimer')}
            className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'disclaimer' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>অস্বীকৃতি (Disclaimer)</span>
          </button>

          <button
            onClick={() => setActiveTab('terms')}
            className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'terms' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-3.5 h-3.5 shrink-0" />
            <span>ব্যবহারের শর্তাবলী (Terms)</span>
          </button>

          <button
            onClick={() => setActiveTab('privacy')}
            className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'privacy' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Lock className="w-3.5 h-3.5 shrink-0" />
            <span>গোপনীয়তা নীতি (Privacy)</span>
          </button>

          <button
            onClick={() => setActiveTab('refund')}
            className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'refund' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5 shrink-0" />
            <span>রিফান্ড নীতি (Refund)</span>
          </button>
        </div>

        {/* Content Area - Scrollable */}
        <div className="text-xs sm:text-sm text-slate-700 space-y-4 leading-relaxed overflow-y-auto pr-1 flex-1">
          
          {/* DISCLAIMER TAB */}
          {activeTab === 'disclaimer' && (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200/80 p-4 rounded-2xl space-y-2 text-amber-950">
                <div className="flex items-center gap-2 font-black text-sm text-amber-900">
                  <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
                  <span>জরুরি আইনি ঘোষণা ও স্বাতন্ত্র্য বার্তা (Non-Affiliation Disclaimer)</span>
                </div>
                <p className="text-xs sm:text-sm leading-relaxed font-semibold">
                  আবেদনী (Abedoni) একটি সম্পূর্ণ স্বাধীন ডিজিটাল আবেদন সহায়তাকারী প্ল্যাটফর্ম। আমরা কোনো সরকারি সংস্থা, মাধ্যমিক ও উচ্চমাধ্যমিক শিক্ষা বোর্ড (ঢাকা, রাজশাহী, চট্টগ্রাম, কুমিল্লা ইত্যাদি) কিংবা টেলিটক বাংলাদেশ লিমিটেডের অফিসিয়াল ওয়েবসাইট বা অঙ্গপ্রতিষ্ঠান নই।
                </p>
              </div>

              <div className="space-y-3 font-normal">
                <h4 className="font-bold text-slate-900 text-sm sm:text-base border-b border-slate-200 pb-1">
                  ১. প্ল্যাটফর্মের ধরন ও সেবার পরিধি
                </h4>
                <p>
                  আবেদনী (Abedoni) কেবল শিক্ষার্থীদের অনুরোধক্রমে তাদের প্রদত্ত তথ্যসমূহ (এসএসসি রোল, রেজিস্ট্রেশন নম্বর, শিক্ষা বোর্ড ও বিষয় কোড) যাচাই করে বোর্ড চ্যালেঞ্জের নির্দিষ্ট নিয়মানুযায়ী আবেদন সাবমিট করে দেয়। আমরা থার্ড-পার্টি সার্ভিস প্রোভাইডার হিসেবে শিক্ষার্থীদের কারিগরি সুবিধা প্রদান করি।
                </p>

                <h4 className="font-bold text-slate-900 text-sm sm:text-base border-b border-slate-200 pb-1">
                  ২. তথ্যের নির্ভুলতা ও ব্যবহারকারীর দায়িত্ব
                </h4>
                <p>
                  আবেদন সাবমিশনের পূর্বে সকল রোল, রেজিস্ট্রেশন ও বিষয় কোড সঠিক কি না তা পুনর্নিরীক্ষণ করার দায়িত্ব শিক্ষার্থী ও অভিভাবকের। ভুল তথ্যের কারণে আবেদন ব্যর্থ হলে বা ভুল বিষয়ে ফি জমা হলে আবেদনের পর কোনো প্রকার পরিবর্তন বা রিফান্ড গ্রহণ করা সম্ভব নয়।
                </p>

                <h4 className="font-bold text-slate-900 text-sm sm:text-base border-b border-slate-200 pb-1">
                  ৩. বোর্ড সিদ্ধান্ত ও ফলাফল নিয়ন্ত্রণ
                </h4>
                <p>
                  পুনর্নিরীক্ষণ (Board Challenge) আবেদনের ফলাফল পরিবর্তন, নম্বর বৃদ্ধি বা সিদ্ধান্ত প্রকাশের সম্পূর্ণ এখতিয়ার কেবল স্ব-স্ব শিক্ষা বোর্ডের। আবেদনের ফলাফলে কোনো পরিবর্তন আসবে কি না সে বিষয়ে আবেদনী কোনো ধরনের নিশ্চয়তা প্রদান করে না।
                </p>
              </div>
            </div>
          )}

          {/* TERMS OF SERVICE TAB */}
          {activeTab === 'terms' && (
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 text-sm sm:text-base border-b border-slate-200 pb-1">
                ব্যবহারের শর্তাবলী (Terms & Conditions)
              </h4>

              <div className="space-y-3">
                <div>
                  <h5 className="font-extrabold text-slate-900 text-xs sm:text-sm">১. শর্তাবলীর সম্মতি (Acceptance of Terms)</h5>
                  <p className="text-slate-600">
                    আবেদনী প্ল্যাটফর্ম ব্যবহার করে যেকোনো অর্ডার সম্পন্ন করার মাধ্যমে আপনি আমাদের এই শর্তাবলী সম্পূর্ণরূপে মেনে নিচ্ছেন বলে গণ্য হবে।
                  </p>
                </div>

                <div>
                  <h5 className="font-extrabold text-slate-900 text-xs sm:text-sm">২. আবেদনের যোগ্যতা (Eligibility)</h5>
                  <p className="text-slate-600">
                    ২০২৬ সালের এসএসসি বা সমমান পরীক্ষায় অংশগ্রহণকারী পরীক্ষার্থী অথবা তাদের অভিভাবকগণই কেবল আমাদের প্ল্যাটফর্মের মাধ্যমে আবেদন অনুরোধ পাঠাতে পারবেন।
                  </p>
                </div>

                <div>
                  <h5 className="font-extrabold text-slate-900 text-xs sm:text-sm">৩. পেমেন্ট ও সার্ভিস চার্জ (Payment & Service Fees)</h5>
                  <p className="text-slate-600">
                    প্রতিটি আবেদনের জন্য শিক্ষাবোর্ডের নির্ধারিত ফি, টেলিটক SMS ফি এবং আবেদনী প্ল্যাটফর্মের নির্ধারিত সার্ভিস চার্জ (৳৯৯) একযোগে পরিশোধ করতে হবে। অনুমোদিত পেমেন্ট মাধ্যম (bKash/Nagad/Rocket) ব্যতিরেকে অন্য মাধ্যমে পেমেন্ট গ্রহণযোগ্য নয়।
                  </p>
                </div>

                <div>
                  <h5 className="font-extrabold text-slate-900 text-xs sm:text-sm">৪. প্রসেসিং টাইম (Processing Time)</h5>
                  <p className="text-slate-600">
                    পেমেন্ট সম্পন্ন হওয়ার পর সাধারণত ৫ থেকে ৩০ মিনিটের মধ্যে আবেদনটি সাবমিট করা হয়। তবে টেলিকম নেটওয়ার্ক বা বোর্ড সার্ভারের জটিলতার ক্ষেত্রে কিছুটা অতিরিক্ত সময় লাগতে পারে।
                  </p>
                </div>

                <div>
                  <h5 className="font-extrabold text-slate-900 text-xs sm:text-sm">৫. দায়বদ্ধতার সীমাবদ্ধতা (Limitation of Liability)</h5>
                  <p className="text-slate-600">
                    শিক্ষা বোর্ডের নিজস্ব সার্ভার বিভ্রাট, টেলিকম সিমের সাময়িক ডাউনটাইম কিংবা প্রাকৃতিক দুর্যোগের কারণে আবেদন প্রক্রিয়ায় বিলম্ব হলে তার দায় প্ল্যাটফর্মের ওপর বর্তাবে না।
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* PRIVACY POLICY TAB */}
          {activeTab === 'privacy' && (
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 text-sm sm:text-base border-b border-slate-200 pb-1">
                গোপনীয়তা নীতি (Privacy Policy)
              </h4>

              <div className="space-y-3">
                <div>
                  <h5 className="font-extrabold text-slate-900 text-xs sm:text-sm">১. তথ্য সংগ্রহ (Data Collection)</h5>
                  <p className="text-slate-600">
                    আবেদন প্রক্রিয়া সম্পন্ন করতে আমরা কেবল শিক্ষার্থীর নাম, শিক্ষা বোর্ড, এসএসসি রোল নম্বর, রেজিস্ট্রেশন নম্বর, মোবাইল নম্বর এবং পেমেন্ট সংক্রান্ত তথ্য সংগ্রহ করি।
                  </p>
                </div>

                <div>
                  <h5 className="font-extrabold text-slate-900 text-xs sm:text-sm">২. তথ্যের ব্যবহার (Use of Information)</h5>
                  <p className="text-slate-600">
                    সংগৃহীত তথ্য শুধুমাত্র শিক্ষাবোর্ডের পোর্টালে আবেদন জমা দেওয়া, ট্র্যাকিং রসিদ তৈরি করা এবং পেমেন্ট সংক্রান্ত সাপোর্ট প্রদানের জন্য ব্যবহৃত হয়।
                  </p>
                </div>

                <div>
                  <h5 className="font-extrabold text-slate-900 text-xs sm:text-sm">৩. তথ্য সুরক্ষা ও গোপনীয়তা (Data Security)</h5>
                  <p className="text-slate-600">
                    আমরা আপনার ব্যক্তিগত তথ্যের সর্বোচ্চ নিরাপত্তা প্রদান করি। কোনো অবস্থাতেই আমাদের ব্যবহারকারীদের তথ্য অন্য কোনো বাণিজ্যিক উদ্দেশ্যে বিক্রি বা বিনিময় করা হয় না।
                  </p>
                </div>

                <div>
                  <h5 className="font-extrabold text-slate-900 text-xs sm:text-sm">৪. কুকিজ ও এনালিটিক্স (Cookies & Analytics)</h5>
                  <p className="text-slate-600">
                    ওয়েবসাইটের অভিজ্ঞতা উন্নত করতে ও পারফরম্যান্স পর্যালোচনায় সাধারণ কুকিজ ও ব্রাউজার এনালিটিক্স ব্যবহৃত হতে পারে।
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* REFUND POLICY TAB */}
          {activeTab === 'refund' && (
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 text-sm sm:text-base border-b border-slate-200 pb-1">
                রিফান্ড নীতি (Refund & Cancellation Policy)
              </h4>

              <div className="space-y-3">
                <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-emerald-950 font-medium">
                  <p className="flex items-center gap-1.5 font-bold text-emerald-900 mb-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>১০০% রিফান্ডের শর্ত</span>
                  </p>
                  <p className="text-xs">
                    যদি আমাদের সিস্টেমের ত্রুটি বা আমাদের প্রতিনিধি কর্তৃক আবেদনের পূর্বেই কোনো কারিগরি ভুল ঘটে, তবে পরিশোধিত সম্পূর্ণ অর্থ (১০০%) অবিলম্বেই বিকাশ/নগদে ফেরত দেওয়া হবে।
                  </p>
                </div>

                <div>
                  <h5 className="font-extrabold text-slate-900 text-xs sm:text-sm">অফেরতযোগ্য শর্তাবলী:</h5>
                  <ul className="list-disc list-inside text-slate-600 space-y-1 mt-1 pl-1">
                    <li>বোর্ডের সার্ভারে একবার সফলভাবে আবেদন জমা হয়ে গেলে এবং ট্র্যাকিং আইডি উৎপন্ন হলে বোর্ডের অফিশিয়াল নিয়ম অনুযায়ী উক্ত ফি ফেরতযোগ্য নয়।</li>
                    <li>ব্যবহারকারী নিজে ভুল রোল বা রেজিস্ট্রেশন নম্বর প্রদান করলে এবং সেই অনুযায়ী আবেদন জমা হয়ে গেলে ফি ফেরত দেওয়া সম্ভব হবে না।</li>
                  </ul>
                </div>

                <div>
                  <h5 className="font-extrabold text-slate-900 text-xs sm:text-sm">রিফান্ড দাবির নিয়ম:</h5>
                  <p className="text-slate-600">
                    আপনার অর্ডার আইডি এবং পেমেন্ট ট্রানজেকশন নম্বর উল্লেখ করে আমাদের অফিশিয়াল হোয়াটসঅ্যাপ হেল্পডেস্কে সরাসরি যোগাযোগ করুন। ২৪-৪৮ ঘণ্টার মধ্যে রিফান্ড আবেদন প্রসেস করা হয়।
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer Action */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between shrink-0 text-xs">
          <p className="text-slate-500 font-medium hidden sm:block">
            যেকোনো সহায়তায় আমাদের হোয়াটসঅ্যাপ সাপোর্টে যোগাযোগ করুন
          </p>
          <button
            onClick={onClose}
            className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-extrabold px-6 py-2.5 rounded-xl transition cursor-pointer shadow-xs"
          >
            বন্ধ করুন (Close)
          </button>
        </div>

      </div>
    </div>
  );
};

