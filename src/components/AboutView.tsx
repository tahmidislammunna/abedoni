import React from 'react';
import { Target, Eye, HeartHandshake, ShieldCheck, Zap, Sparkles, PhoneCall, Mail, MapPin } from 'lucide-react';
import { SUPPORT_CONFIG } from '../data/boardsAndSubjects';

export const AboutView: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-16 font-bn">
      
      {/* Brand Hero */}
      <div className="text-center space-y-3">
        <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full border border-blue-200">
          আবেদনী (Abedoni)
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900">
          আবেদন হোক সহজ।
        </h1>
        <p className="text-slate-600 text-base max-w-2xl mx-auto">
          বাংলাদেশের প্রতিটি মানুষ যেন ঘরে বসে নিরাপদে, দ্রুত এবং বিশ্বাসের সাথে যেকোনো ডিজিটাল আবেদন সম্পন্ন করতে পারে।
        </p>
      </div>

      {/* Mission & Vision */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center">
            <Target className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">আমাদের মিশন (Mission)</h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            বাংলাদেশের প্রতিটি প্রান্তের সাধারণ মানুষ ও শিক্ষার্থীরা যেন যেকোনো সরকারি বা বেসরকারি আবেদন করতে গিয়ে কোনো প্রকার অনিশ্চয়তা, হয়রানি বা অতিরিক্ত খরচের সম্মুখীন না হয়।
          </p>
        </div>

        <div className="bg-slate-900 text-white p-8 rounded-3xl space-y-3 shadow-md border border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Eye className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white">আমাদের ভিশন (Vision)</h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            বাংলাদেশের সবচেয়ে নির্ভরযোগ্য এবং সর্ববৃহৎ **One-Stop Application Services Platform** হিসেবে নিজেকে প্রতিষ্ঠা করা।
          </p>
        </div>
      </div>

      {/* Brand Values */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-900 text-center">আমাদের মূল মূল্যবোধ (Brand Values)</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-1">
            <ShieldCheck className="w-6 h-6 text-blue-600 mx-auto" />
            <h4 className="font-bold text-sm text-slate-900">Trust (বিশ্বাসযোগ্যতা)</h4>
            <p className="text-[11px] text-slate-500">শতভাগ নির্ভরযোগ্য সেবা</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-1">
            <Sparkles className="w-6 h-6 text-emerald-600 mx-auto" />
            <h4 className="font-bold text-sm text-slate-900">Transparency (স্বচ্ছতা)</h4>
            <p className="text-[11px] text-slate-500">কোনো হিডেন খরচ নেই</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-1">
            <Zap className="w-6 h-6 text-amber-500 mx-auto" />
            <h4 className="font-bold text-sm text-slate-900">Speed (দ্রুততা)</h4>
            <p className="text-[11px] text-slate-500">মাত্র ৫ মিনিটে প্রসেসিং</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-1">
            <HeartHandshake className="w-6 h-6 text-purple-600 mx-auto" />
            <h4 className="font-bold text-sm text-slate-900">Student First (শিক্ষার্থীবান্ধব)</h4>
            <p className="text-[11px] text-slate-500">সর্বোচ্চ অগ্রাধিকার</p>
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="bg-blue-600 text-white rounded-3xl p-8 space-y-4">
        <h3 className="text-xl font-bold">যোগাযোগের ঠিকানা ও সাপোর্ট</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
          <div className="flex items-center gap-2">
            <PhoneCall className="w-4 h-4 text-emerald-300" />
            <span>WhatsApp: {SUPPORT_CONFIG.whatsappDisplay}</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-emerald-300" />
            <span>Email: {SUPPORT_CONFIG.officialEmail}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-300" />
            <span>Dhaka, Bangladesh</span>
          </div>
        </div>
      </div>

    </div>
  );
};
