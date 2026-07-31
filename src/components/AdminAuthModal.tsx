import React, { useState } from 'react';
import { ShieldCheck, Lock, Eye, EyeOff, ArrowLeft, AlertCircle, KeyRound, Sparkles, Mail, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AdminAuthModalProps {
  isOpen: boolean;
  onAuthenticated: () => void;
  onCancel: () => void;
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({
  isOpen,
  onAuthenticated,
  onCancel,
}) => {
  const [email, setEmail] = useState('abedoni.bd@gmail.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setErrorMsg('ইমেইল এবং পাসওয়ার্ড প্রদান করুন।');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPassword,
      });

      if (error) {
        setErrorMsg('ভুল ইমেইল অথবা পাসওয়ার্ড! সঠিক Supabase Admin একাউন্টের তথ্য ব্যবহার করুন।');
        setIsLoading(false);
        return;
      }

      if (data.user && data.user.email?.toLowerCase() === 'abedoni.bd@gmail.com') {
        sessionStorage.setItem('abedoni_admin_authed', 'true');
        sessionStorage.setItem('abedoni_admin_role', 'admin');
        setErrorMsg('');
        setPassword('');
        setIsLoading(false);
        onAuthenticated();
      } else {
        await supabase.auth.signOut();
        setErrorMsg('প্রবেশাধিকার সংরক্ষিত! শুধুমাত্র অনুমোদিত এডমিন (abedoni.bd@gmail.com) লগইন করতে পারবেন।');
        setIsLoading(false);
      }
    } catch (err) {
      setErrorMsg('লগইন প্রসেস করতে সাময়িক সমস্যা হয়েছে। পরবর্তীতে চেষ্টা করুন।');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-slate-950/95 backdrop-blur-2xl overflow-y-auto animate-in fade-in duration-200 font-bn">
      
      {/* Background glowing gradient highlights */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] bg-gradient-to-tr from-blue-600/30 via-indigo-600/20 to-purple-600/30 rounded-full blur-3xl pointer-events-none" />

      <div className="relative bg-slate-900/95 text-white backdrop-blur-2xl rounded-3xl sm:rounded-[36px] border border-slate-800/90 shadow-2xl max-w-md w-full my-auto p-5 sm:p-8 space-y-4 sm:space-y-5 overflow-y-auto max-h-[92vh] ring-1 ring-white/10">
        
        {/* Glowing Top Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-emerald-400 to-indigo-500" />

        {/* Top Header & Shield Badge */}
        <div className="text-center space-y-2 pt-1">
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 mx-auto flex items-center justify-center">
            {/* Pulsing ring */}
            <span className="absolute inset-0 rounded-3xl bg-blue-500/20 animate-ping opacity-75" />
            <div className="relative w-14 h-14 sm:w-18 sm:h-18 rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-slate-900 p-0.5 shadow-xl border border-blue-400/30 flex items-center justify-center">
              <div className="w-full h-full bg-slate-900/80 rounded-[22px] flex items-center justify-center">
                <Lock className="w-7 h-7 sm:w-8 sm:h-8 text-blue-400" />
              </div>
            </div>
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-300 text-[11px] font-bold tracking-wide uppercase font-mono">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span>Supabase Auth Protected</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-1.5">
              অ্যাডমিন লগইন
            </h2>
            <p className="text-xs text-slate-400 font-medium max-w-xs mx-auto mt-1">
              প্রশাসনিক প্যানেলে প্রবেশ করতে Supabase Auth ইমেইল ও পাসওয়ার্ড ব্যবহার করুন।
            </p>
          </div>
        </div>

        {/* Form Area */}
        <form onSubmit={handleVerify} className="space-y-3.5">
          
          {errorMsg && (
            <div className="bg-rose-500/15 border border-rose-500/40 text-rose-300 p-3 rounded-2xl text-xs font-bold flex items-center gap-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Email Input */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-blue-400" />
              <span>এডমিন ইমেইল (Admin Email):</span>
            </label>

            <div className="relative">
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="abedoni.bd@gmail.com..."
                className="w-full bg-slate-950/90 border-2 border-slate-800 focus:border-blue-500 rounded-2xl px-4 py-3 text-base sm:text-sm font-mono font-bold text-white placeholder-slate-600 outline-none transition-all shadow-inner focus:ring-4 focus:ring-blue-500/20"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-blue-400" />
              <span>পাসওয়ার্ড (Password):</span>
            </label>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="পাসওয়ার্ড লিখুন..."
                className="w-full bg-slate-950/90 border-2 border-slate-800 focus:border-blue-500 rounded-2xl px-4 py-3 text-base sm:text-sm font-mono font-bold text-white placeholder-slate-600 outline-none transition-all shadow-inner focus:ring-4 focus:ring-blue-500/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-3.5 text-slate-400 hover:text-white cursor-pointer transition p-1"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="pt-1 space-y-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-600 disabled:opacity-50 text-white font-extrabold py-3.5 rounded-2xl text-sm shadow-xl shadow-blue-600/30 transition-all cursor-pointer flex items-center justify-center gap-2 border border-blue-400/30 hover:scale-[1.01] active:scale-95"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>যাচাই করা হচ্ছে...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4.5 h-4.5 text-emerald-400" />
                  <span>লগইন করুন</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onCancel}
              className="w-full bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white font-bold py-2.5 rounded-2xl text-xs transition cursor-pointer flex items-center justify-center gap-1.5 border border-slate-700/60 active:scale-95"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>বাতিল করুন & হোমে ফিরে যান</span>
            </button>
          </div>

        </form>

        {/* Footer Note */}
        <div className="text-center border-t border-slate-800/80 pt-2.5">
          <p className="text-[10px] text-slate-500 font-mono flex items-center justify-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-500" />
            <span>Supabase Auth Token Verification Enabled</span>
          </p>
        </div>

      </div>
    </div>
  );
};
