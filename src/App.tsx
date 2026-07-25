import React, { useState } from 'react';
import { Header } from './components/Header';
import { MobileBottomNav } from './components/MobileBottomNav';
import { HomeView } from './components/HomeView';
import { BoardChallengeForm } from './components/BoardChallengeForm';
import { TrackOrderView } from './components/TrackOrderView';
import { PricingView } from './components/PricingView';
import { FAQView } from './components/FAQView';
import { NoticeView } from './components/NoticeView';
import { AboutView } from './components/AboutView';
import { AdminPanel } from './components/AdminPanel';
import { AdminAuthModal } from './components/AdminAuthModal';
import { WhatsAppFloatingButton } from './components/WhatsAppFloatingButton';
import { PoliciesModal } from './components/PoliciesModal';
import { PRDView } from './components/PRDView';
import { BoardChallengeOrder } from './types';
import { getAppSettings, syncAppSettingsWithSupabase } from './data/appSettings';
import { getWhatsappDirectUrl } from './data/boardsAndSubjects';
import { 
  Heart, 
  MessageSquare, 
  Sparkles,
  BookOpen
} from 'lucide-react';

export default function App() {
  const settings = getAppSettings();
  const [activeTab, setActiveTab] = useState<string>('home');
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return window.location.pathname === '/admin-munna' || window.location.hash === '#/admin-munna';
  });
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('abedoni_admin_authed') === 'true';
  });
  const [showPRD, setShowPRD] = useState<boolean>(false);

  // Sync App Settings with Supabase on mount
  React.useEffect(() => {
    syncAppSettingsWithSupabase().catch(() => {});
  }, []);

  // Check URL pathname or hash on load & popstate
  React.useEffect(() => {
    const handleUrlCheck = () => {
      if (window.location.pathname === '/admin-munna' || window.location.hash === '#/admin-munna') {
        setIsAdmin(true);
      }
    };
    window.addEventListener('popstate', handleUrlCheck);
    return () => window.removeEventListener('popstate', handleUrlCheck);
  }, []);
  
  // Policy Modal state
  const [showPolicies, setShowPolicies] = useState<boolean>(false);
  const [policyType, setPolicyType] = useState<'privacy' | 'terms' | 'refund'>('privacy');

  // Tracked order reference
  const [latestOrderId, setLatestOrderId] = useState<string | undefined>(undefined);

  const handleOrderCompleted = (order: BoardChallengeOrder) => {
    setLatestOrderId(order.id);
  };

  const openPolicy = (type: 'privacy' | 'terms' | 'refund') => {
    setPolicyType(type);
    setShowPolicies(true);
  };

  return (
    <div className="relative min-h-screen bg-[#F0F4FF] text-slate-900 flex flex-col font-bn selection:bg-blue-200 selection:text-blue-900 overflow-x-hidden pb-16 md:pb-0">
      
      {/* Decorative Frosted Glass Ambient Blur Globs */}
      <div className="fixed top-[-100px] right-[-100px] w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="fixed bottom-[-50px] left-[-50px] w-[400px] h-[400px] bg-emerald-400/20 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="fixed top-[45%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-300/15 rounded-full blur-[160px] pointer-events-none z-0" />

      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isAdmin={isAdmin}
        setIsAdmin={setIsAdmin}
      />

      {/* Main View Container */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {isAdmin ? (
          isAdminAuthenticated ? (
            <AdminPanel />
          ) : (
            <AdminAuthModal
              isOpen={true}
              onAuthenticated={() => setIsAdminAuthenticated(true)}
              onCancel={() => {
                setIsAdmin(false);
                window.history.pushState({}, '', '/');
              }}
            />
          )
        ) : (
          <>
            {activeTab === 'home' && (
              <HomeView
                onStartApplication={() => setActiveTab('apply')}
                onTrackOrder={() => setActiveTab('track')}
                onNavigateTab={(tab) => setActiveTab(tab)}
              />
            )}

            {activeTab === 'apply' && (
              <BoardChallengeForm
                onOrderCompleted={handleOrderCompleted}
                onTrackOrderClick={() => setActiveTab('track')}
              />
            )}

            {activeTab === 'track' && (
              <TrackOrderView
                initialOrderId={latestOrderId}
                onNavigateApply={() => setActiveTab('apply')}
              />
            )}

            {activeTab === 'pricing' && (
              <PricingView onStartApplication={() => setActiveTab('apply')} />
            )}

            {activeTab === 'faq' && <FAQView />}

            {activeTab === 'notice' && <NoticeView />}

            {activeTab === 'about' && <AboutView />}
          </>
        )}
      </main>

      {/* Floating Traditional WhatsApp Support Action Button */}
      <WhatsAppFloatingButton />

      {/* Mobile Bottom Bar for App-like Experience */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isAdmin={isAdmin}
        setIsAdmin={setIsAdmin}
      />

      {/* Footer */}
      <footer className="relative z-10 bg-slate-900/95 backdrop-blur-2xl text-slate-300 border-t border-slate-800/60 pt-12 pb-8 mt-16 font-bn">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            {/* Brand Intro */}
            <div className="space-y-3 md:col-span-1">
              <div className="flex items-center gap-2">
                <img src={settings.logoIconUrl} alt="Icon" className="w-8 h-8 object-contain" />
                <span className="text-xl font-bold text-white">আবেদনী (Abedoni)</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                SSC ও HSC বোর্ড চ্যালেঞ্জ অনলাইন সেবা। ঘরে বসেই নিরাপদে ও নির্ভরযোগ্যভাবে আবেদন সম্পন্ন করুন।
              </p>
              <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>আবেদন হোক সহজ</span>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-white text-sm">প্রয়োজনীয় লিংক</h4>
              <ul className="space-y-1.5">
                <li>
                  <button onClick={() => { setActiveTab('home'); setIsAdmin(false); }} className="hover:text-white transition">হোমপেজ</button>
                </li>
                <li>
                  <button onClick={() => { setActiveTab('apply'); setIsAdmin(false); }} className="hover:text-white transition">SSC Board Challenge 2026</button>
                </li>
                <li>
                  <button onClick={() => { setActiveTab('track'); setIsAdmin(false); }} className="hover:text-white transition">আবেদন স্ট্যাটাস ও রসিদ</button>
                </li>
                <li>
                  <button onClick={() => { setActiveTab('pricing'); setIsAdmin(false); }} className="hover:text-white transition">ফি ও সার্ভিস চার্জ</button>
                </li>
                <li>
                  <button onClick={() => { setActiveTab('notice'); setIsAdmin(false); }} className="hover:text-white transition">নোটিশ বোর্ড</button>
                </li>
              </ul>
            </div>

            {/* Support Info */}
            <div className="space-y-2.5 text-xs">
              <h4 className="font-bold text-white text-sm">কাস্টমার সাপোর্ট</h4>
              <p className="text-slate-400">প্রতিদিন সকাল ৭টা থেকে রাত ১১টা পর্যন্ত হেল্পডেস্ক খোলা থাকে।</p>
              <div className="space-y-1 text-slate-300 font-mono">
                <p>WhatsApp: {settings.whatsappNumber || '01577777092'}</p>
                <p>Email: {settings.officialEmail}</p>
                <p className="font-bn font-semibold text-blue-400 hover:underline">
                  <a href={settings.facebookPageUrl || 'https://facebook.com/abedoni.bd'} target="_blank" rel="noopener noreferrer">
                    Facebook: facebook.com/abedoni.bd
                  </a>
                </p>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                <a
                  href={getWhatsappDirectUrl(settings.whatsappNumber || '01577777092', 'আসসালামু আলাইকুম, আবেদনী সম্পর্কে সাপোর্ট প্রয়োজন।')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-2 rounded-xl text-xs transition shadow-sm"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp সাপোর্ট</span>
                </a>
                <a
                  href={settings.facebookPageUrl || 'https://facebook.com/abedoni.bd'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold px-3 py-2 rounded-xl text-xs transition shadow-sm"
                >
                  <span>Facebook পেজ</span>
                </a>
              </div>
            </div>

            {/* Policies & System */}
            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-white text-sm">নীতিমালা</h4>
              <ul className="space-y-1.5">
                <li>
                  <button onClick={() => openPolicy('privacy')} className="hover:text-white transition">গোপনীয়তা নীতি (Privacy Policy)</button>
                </li>
                <li>
                  <button onClick={() => openPolicy('terms')} className="hover:text-white transition">ব্যবহারের শর্তাবলী (Terms of Service)</button>
                </li>
                <li>
                  <button onClick={() => openPolicy('refund')} className="hover:text-white transition">রিফান্ড পলিসি (Refund Policy)</button>
                </li>
                <li className="pt-2">
                  <button onClick={() => setShowPRD(true)} className="text-slate-400 hover:text-slate-300 flex items-center gap-1 text-[11px]">
                    <BookOpen className="w-3 h-3" />
                    <span>কারিগরি নথি (PRD)</span>
                  </button>
                </li>
              </ul>
            </div>

          </div>

          <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
            <div className="flex items-center gap-3">
              <p>© 2026 আবেদনী (Abedoni). সর্বস্বত্ব সংরক্ষিত।</p>
              <button 
                onClick={() => {
                  setIsAdmin(true);
                  window.history.pushState({}, '', '/admin-munna');
                }}
                className="text-slate-700 hover:text-slate-500 text-[10px] font-mono hover:underline cursor-pointer transition"
                title="Admin Control Panel Access"
              >
                /admin-munna
              </button>
            </div>
            <p className="flex items-center gap-1">
              <span>Made with</span>
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
              <span>for Bangladesh Students</span>
            </p>
          </div>

        </div>
      </footer>

      {/* Modals */}
      <PoliciesModal
        isOpen={showPolicies}
        onClose={() => setShowPolicies(false)}
        initialPolicy={policyType}
      />

      <PRDView
        isOpen={showPRD}
        onClose={() => setShowPRD(false)}
      />

    </div>
  );
}
