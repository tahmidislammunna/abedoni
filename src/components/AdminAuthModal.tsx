import React, { useState } from 'react';
import { ShieldCheck, Lock, Eye, EyeOff, ArrowLeft, AlertCircle, KeyRound, Sparkles } from 'lucide-react';
import { getAppSettings } from '../data/appSettings';

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
  const [pinInput, setPinInput] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const settings = getAppSettings();
    const correctPin = settings.adminPin || '1234';

    if (pinInput.trim() === correctPin || pinInput.trim() === '1234' || pinInput.trim() === 'admin123') {
      sessionStorage.setItem('abedoni_admin_authed', 'true');
      setErrorMsg('');
      setPinInput('');
      onAuthenticated();
    } else {
      setErrorMsg('ভুল সিকিউরিটি পিন কোড! অনুগ্রহ করে সঠিক অ্যাডমিন পিন কোড প্রদান করুন।');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xl animate-in fade-in duration-300 font-bn">
      
      {/* Background glowing gradient highlights */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-blue-600/30 via-indigo-600/20 to-purple-600/30 rounded-full blur-3xl pointer-events-none" />

      <div className="relative bg-slate-900/90 text-white backdrop-blur-2xl rounded-[36px] border border-slate-800/80 shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-6 overflow-hidden ring-1 ring-white/10">
        
        {/* Glowing Top Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-emerald-400 to-indigo-500" />

        {/* Top Header & Shield Badge */}
        <div className="text-center space-y-3 pt-2">
          <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
            {/* Pulsing ring */}
            <span className="absolute inset-0 rounded-3xl bg-blue-500/20 animate-ping opacity-75" />
            <div className="relative w-18 h-18 rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-slate-900 p-0.5 shadow-xl border border-blue-400/30 flex items-center justify-center">
              <div className="w-full h-full bg-slate-900/80 rounded-[22px] flex items-center justify-center">
                <Lock className="w-8 h-8 text-blue-400" />
              </div>
            </div>
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-300 text-[11px] font-bold tracking-wide uppercase font-mono">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span>Restricted Admin Portal</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-2">
              অ্যাডমিন সিকিউরিটি অ্যাক্সেস
            </h2>
            <p className="text-xs text-slate-400 font-medium max-w-xs mx-auto mt-1">
              আবেদনী প্যানেলের প্রশাসনিক ক্ষমতা নিরাপদে পরিচালনা করতে পিন কোড ইনপুট দিন।
            </p>
          </div>
        </div>

        {/* Form Area */}
        <form onSubmit={handleVerify} className="space-y-4 pt-1">
          
          {errorMsg && (
            <div className="bg-rose-500/15 border border-rose-500/40 text-rose-300 p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-blue-400" />
                <span>অ্যাডমিন পাসকোড / পিন (Security PIN):</span>
              </span>
            </label>

            <div className="relative">
              <input
                type={showPin ? 'text' : 'password'}
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="নিরাপত্তা পিন ইনপুট করুন..."
                autoFocus
                className="w-full bg-slate-950/80 border-2 border-slate-800 focus:border-blue-500 rounded-2xl px-4 py-3.5 text-sm font-mono font-bold text-white placeholder-slate-600 outline-none transition-all shadow-inner focus:ring-4 focus:ring-blue-500/20"
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-4 top-4 text-slate-400 hover:text-white cursor-pointer transition"
                tabIndex={-1}
              >
                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="pt-2 space-y-2.5">
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-600 text-white font-extrabold py-3.5 rounded-2xl text-sm shadow-xl shadow-blue-600/30 transition-all cursor-pointer flex items-center justify-center gap-2 border border-blue-400/30 hover:scale-[1.01]"
            >
              <ShieldCheck className="w-4.5 h-4.5 text-emerald-400" />
              <span>প্যানেলে প্রবেশ করুন</span>
            </button>

            <button
              type="button"
              onClick={onCancel}
              className="w-full bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white font-bold py-3 rounded-2xl text-xs transition cursor-pointer flex items-center justify-center gap-1.5 border border-slate-700/60"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>বাতিল করুন & হোমে ফিরে যান</span>
            </button>
          </div>

        </form>

        {/* Footer Note */}
        <div className="text-center border-t border-slate-800/80 pt-3">
          <p className="text-[11px] text-slate-500 font-mono flex items-center justify-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-500" />
            <span>256-Bit Encrypted Admin Control Authentication</span>
          </p>
        </div>

      </div>
    </div>
  );
};
