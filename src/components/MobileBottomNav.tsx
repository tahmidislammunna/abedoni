import React from 'react';
import { Home, FileText, Search, DollarSign, LayoutDashboard } from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isAdmin: boolean;
  setIsAdmin: (isAdmin: boolean) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  isAdmin,
  setIsAdmin
}) => {
  return (
    <div className="xl:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-2xl border-t border-slate-200/80 shadow-[0_-8px_20px_rgba(0,0,0,0.08)] px-2 py-1.5 font-bn">
      <div className="flex items-center justify-around">
        <button
          onClick={() => { setActiveTab('home'); setIsAdmin(false); }}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all ${
            activeTab === 'home' && !isAdmin ? 'text-blue-600 font-bold scale-105' : 'text-slate-500'
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">হোম</span>
        </button>

        <button
          onClick={() => { setActiveTab('apply'); setIsAdmin(false); }}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all ${
            activeTab === 'apply' && !isAdmin ? 'text-blue-600 font-bold scale-105' : 'text-slate-500'
          }`}
        >
          <FileText className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">আবেদন</span>
        </button>

        <button
          onClick={() => { setActiveTab('track'); setIsAdmin(false); }}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all ${
            activeTab === 'track' && !isAdmin ? 'text-blue-600 font-bold scale-105' : 'text-slate-500'
          }`}
        >
          <Search className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">স্ট্যাটাস</span>
        </button>

        <button
          onClick={() => { setActiveTab('pricing'); setIsAdmin(false); }}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all ${
            activeTab === 'pricing' && !isAdmin ? 'text-blue-600 font-bold scale-105' : 'text-slate-500'
          }`}
        >
          <DollarSign className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">ফি তালিকা</span>
        </button>

        {isAdmin && (
          <button
            onClick={() => setActiveTab('admin')}
            className="flex flex-col items-center justify-center py-1 px-3 rounded-2xl text-amber-600 font-bold scale-105"
          >
            <LayoutDashboard className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">অ্যাডমিন</span>
          </button>
        )}
      </div>
    </div>
  );
};
