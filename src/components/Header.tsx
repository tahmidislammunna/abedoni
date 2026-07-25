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
  Home
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
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-emerald-600 text-white text-xs sm:text-sm py-2 px-4 text-center font-bold flex items-center justify-center gap-2">
        <span className="bg-white/20 px-2.5 py-0.5 rounded-full text-xs font-bold border border-white/20 shrink-0">লাইভ</span>
        <span className="truncate">SSC Board Challenge 2026 আবেদনের পোর্টালে সরাসরি ফি পরিশোধ করুন</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo with Icon SVG & Wordmark */}
          <div 
            onClick={() => { setActiveTab('home'); setIsAdmin(false); }}
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-white p-1 border border-blue-100 shadow-md group-hover:scale-105 transition-transform flex items-center justify-center shrink-0">
              <img 
                src={SUPPORT_CONFIG.logoIconUrl} 
                alt="Abedoni Logo Icon" 
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                  if ((e.target as HTMLElement).parentElement) {
                    (e.target as HTMLElement).parentElement!.innerHTML = '<span class="text-blue-600 font-black text-2xl">আ</span>';
                  }
                }}
              />
            </div>
            <div className="flex items-center gap-2">
              <img 
                src="https://munna.pro.bd/tmassets/wordmarkofAbedoni.svg" 
                alt="আবেদনী Abedoni" 
                className="h-7 sm:h-9 w-auto object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="hidden sm:flex flex-col border-l border-slate-200 pl-2">
                <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.5 rounded border border-blue-200 inline-block w-fit">
                  SSC 2026
                </span>
                <p className="text-[11px] text-slate-500 font-bold font-bn">ডিজিটাল বোর্ড চ্যালেঞ্জ সেবা</p>
              </div>
            </div>
          </div>

          {/* Clean 4 Desktop Menus + Dropdown Submenu */}
          <nav className="hidden md:flex items-center gap-2 bg-slate-100/80 p-2 rounded-full border border-slate-200/60 shadow-inner">
            <button
              onClick={() => { setActiveTab('home'); setIsAdmin(false); }}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'home' && !isAdmin
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>হোম</span>
            </button>

            <button
              onClick={() => { setActiveTab('apply'); setIsAdmin(false); }}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'apply' && !isAdmin
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>আবেদন</span>
            </button>

            <button
              onClick={() => { setActiveTab('track'); setIsAdmin(false); }}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'track' && !isAdmin
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>স্ট্যাটাস</span>
            </button>

            <button
              onClick={() => { setActiveTab('pricing'); setIsAdmin(false); }}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
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

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2">
            
            {/* If currently in admin mode, show Exit Admin option */}
            {isAdmin && (
              <button
                onClick={() => {
                  setIsAdmin(false);
                  setActiveTab('home');
                  window.history.pushState({}, '', '/');
                }}
                className="px-3 py-1.5 rounded-full text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>অ্যাডমিন ত্যাগ করুন</span>
              </button>
            )}

            {/* Apply CTA */}
            <button
              onClick={() => { setActiveTab('apply'); setIsAdmin(false); }}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 sm:px-5 py-2 rounded-full text-xs shadow-lg shadow-blue-600/25 hover:scale-[1.02] transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
              <span>আবেদন করুন</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
