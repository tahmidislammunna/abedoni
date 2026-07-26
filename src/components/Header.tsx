import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  ChevronDown, 
  LayoutDashboard, 
  Sparkles,
  HelpCircle,
  Bell,
  Info,
  Home,
  ExternalLink
} from 'lucide-react';
import { SUPPORT_CONFIG } from '../data/boardsAndSubjects';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isAdmin: boolean;
  setIsAdmin: (isAdmin: boolean) => void;
  setShowPRD?: (show: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  isAdmin,
  setIsAdmin
}) => {
  const [showSubMenu, setShowSubMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-white/40 shadow-xs transition-all">
      {/* Top Banner Notice */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-emerald-600 text-white text-xs sm:text-sm py-2 px-4 text-center font-bold flex flex-wrap items-center justify-center gap-2 sm:gap-3.5 shadow-xs">
        <span className="bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-full text-xs font-black shadow-xs tracking-wide">
          ডিজিটাল বোর্ড চ্যালেঞ্জ সেবা
        </span>
        <span className="hidden sm:inline text-white/50">•</span>
        <span className="truncate">SSC Board Challenge 2026 আবেদনের পোর্টালে সরাসরি ফি পরিশোধ করুন</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Left Column: Logo with Icon SVG & Wordmark */}
          <div className="flex items-center justify-start shrink-0">
            <div 
              onClick={() => { setActiveTab('home'); setIsAdmin(false); }}
              className="flex items-center gap-2.5 sm:gap-3.5 cursor-pointer group"
            >
              <div className="w-10 h-10 sm:w-13 sm:h-13 rounded-2xl bg-white p-1 border border-blue-100 shadow-md group-hover:scale-105 transition-transform flex items-center justify-center shrink-0">
                <img 
                  src={SUPPORT_CONFIG.logoIconUrl} 
                  alt="Abedoni Logo Icon" 
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                    if ((e.target as HTMLElement).parentElement) {
                      (e.target as HTMLElement).parentElement!.innerHTML = '<span class="text-blue-600 font-black text-xl">আ</span>';
                    }
                  }}
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight font-bn leading-tight">আবেদনী</span>
                <p className="text-[10px] sm:text-xs lg:text-sm text-emerald-600 font-bold font-bn">আবেদন হোক সহজ</p>
              </div>
            </div>
          </div>

          {/* Center Column: Clean Nav Items - Responsive Desktop Pill */}
          <div className="hidden xl:flex items-center justify-center px-2 shrink">
            <nav className="flex items-center gap-1 xl:gap-1.5 bg-slate-100/80 p-1.5 rounded-full border border-slate-200/60 shadow-inner">
              <button
                onClick={() => { setActiveTab('home'); setIsAdmin(false); }}
                className={`px-3 py-1.5 xl:px-4 xl:py-2 rounded-full text-xs xl:text-sm font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'home' && !isAdmin
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <Home className="w-3.5 h-3.5 xl:w-4 xl:h-4" />
                <span>হোম</span>
              </button>

              <button
                onClick={() => { setActiveTab('apply'); setIsAdmin(false); }}
                className={`px-3 py-1.5 xl:px-4 xl:py-2 rounded-full text-xs xl:text-sm font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'apply' && !isAdmin
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <FileText className="w-3.5 h-3.5 xl:w-4 xl:h-4" />
                <span>আবেদন</span>
              </button>

              <button
                onClick={() => { setActiveTab('track'); setIsAdmin(false); }}
                className={`px-3 py-1.5 xl:px-4 xl:py-2 rounded-full text-xs xl:text-sm font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'track' && !isAdmin
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <Search className="w-3.5 h-3.5 xl:w-4 xl:h-4" />
                <span>স্ট্যাটাস</span>
              </button>

              <button
                onClick={() => { setActiveTab('pricing'); setIsAdmin(false); }}
                className={`px-3 py-1.5 xl:px-4 xl:py-2 rounded-full text-xs xl:text-sm font-bold transition-all ${
                  activeTab === 'pricing' && !isAdmin
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                ফি ও তথ্য
              </button>

              {/* Submenu Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowSubMenu(!showSubMenu)}
                  onMouseEnter={() => setShowSubMenu(true)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 ${
                    ['notice', 'faq', 'about'].includes(activeTab) && !isAdmin
                      ? 'bg-white text-blue-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>আরও</span>
                  <ChevronDown className="w-3 h-3" />
                </button>

                {showSubMenu && (
                  <div 
                    onMouseLeave={() => setShowSubMenu(false)}
                    className="absolute right-0 mt-2 w-48 bg-white/90 backdrop-blur-2xl rounded-2xl border border-slate-200/80 shadow-2xl p-2 z-50 space-y-1 text-xs font-bn animate-in fade-in slide-in-from-top-2 duration-150"
                  >
                    <button
                      onClick={() => { setActiveTab('notice'); setIsAdmin(false); setShowSubMenu(false); }}
                      className={`w-full text-left px-3 py-2 rounded-xl flex items-center gap-2 transition ${
                        activeTab === 'notice' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Bell className="w-4 h-4 text-blue-600" />
                      <span>জরুরি নোটিশ</span>
                    </button>
                    <button
                      onClick={() => { setActiveTab('faq'); setIsAdmin(false); setShowSubMenu(false); }}
                      className={`w-full text-left px-3 py-2 rounded-xl flex items-center gap-2 transition ${
                        activeTab === 'faq' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <HelpCircle className="w-4 h-4 text-amber-600" />
                      <span>সাধারণ প্রশ্ন (FAQ)</span>
                    </button>
                    <button
                      onClick={() => { setActiveTab('about'); setIsAdmin(false); setShowSubMenu(false); }}
                      className={`w-full text-left px-3 py-2 rounded-xl flex items-center gap-2 transition ${
                        activeTab === 'about' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Info className="w-4 h-4 text-emerald-600" />
                      <span>আমাদের সম্পর্কে</span>
                    </button>
                  </div>
                )}
              </div>

            </nav>
          </div>

          {/* Right Column: Action Buttons / Backup Site Link / Result Link */}
          <div className="flex items-center justify-end shrink-0 gap-1.5 sm:gap-2">
            <a 
              href="https://abedoni-bd.vercel.app" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-800 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full text-xs font-bold border border-blue-200 transition-all flex items-center gap-1.5 shrink-0 hover:scale-105 active:scale-95 shadow-2xs"
              title="Abedoni Backup Site"
            >
              <span>ব্যাকআপ সাইট</span>
              <ExternalLink className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            </a>

            <a 
              href="https://munna.pro.bd/result" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-full text-xs font-bold border border-emerald-500 transition-all flex items-center gap-1 sm:gap-1.5 shrink-0 hover:scale-105 active:scale-95 shadow-xs"
              title="রেজাল্ট দেখতে ক্লিক করুন"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-200 shrink-0" />
              <span>রেজাল্ট দেখুন</span>
              <ExternalLink className="w-3 h-3 text-emerald-200 shrink-0" />
            </a>

            {isAdmin && (
              <button
                onClick={() => {
                  setIsAdmin(false);
                  setActiveTab('home');
                  window.history.pushState({}, '', '/');
                }}
                className="px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-full text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 flex items-center gap-1 sm:gap-1.5 transition-all shadow-sm cursor-pointer shrink-0"
              >
                <LayoutDashboard className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">অ্যাডমিন ত্যাগ</span>
                <span className="sm:hidden">Exit</span>
              </button>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
