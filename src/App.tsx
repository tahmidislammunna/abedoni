import React, { useState } from 'react';
import confetti from 'canvas-confetti';
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
import { MaintenanceView } from './components/MaintenanceView';
import { SeoHead } from './components/SeoHead';
import { BoardChallengeOrder } from './types';
import { getAppSettings, syncAppSettingsWithSupabase, AppSettings } from './data/appSettings';
import { getWhatsappDirectUrl } from './data/boardsAndSubjects';
import { trackPageView } from './lib/analytics';
import { supabase } from './lib/supabase';
import { 
  Heart, 
  MessageSquare, 
  Sparkles,
  BookOpen,
  AlertTriangle
} from 'lucide-react';

function getTabFromPath(pathname: string): string {
  const p = pathname.toLowerCase().replace(/\/$/, '');
  if (p === '/apply') return 'apply';
  if (p === '/tracking' || p === '/track') return 'track';
  if (p === '/info' || p === '/pricing') return 'pricing';
  if (p === '/notice' || p === '/notices') return 'notice';
  if (p === '/faq' || p === '/faqs') return 'faq';
  if (p === '/about') return 'about';
  return 'home';
}

function getPathFromTab(tab: string): string {
  switch (tab) {
    case 'apply': return '/apply';
    case 'track': return '/tracking';
    case 'pricing': return '/info';
    case 'notice': return '/notice';
    case 'faq': return '/faq';
    case 'about': return '/about';
    case 'home': default: return '/';
  }
}

export default function App() {
  const [settings, setSettings] = useState<AppSettings>(() => getAppSettings());
  const [activeTab, setActiveTabState] = useState<string>(() => {
    return getTabFromPath(window.location.pathname);
  });
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return window.location.pathname === '/admin-munna' || window.location.hash === '#/admin-munna';
  });
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('abedoni_admin_authed') === 'true';
  });
  const [showPRD, setShowPRD] = useState<boolean>(false);

  const isMaintenanceActive = Boolean(settings.isMaintenanceMode) && !isAdmin;

  const setActiveTab = (tab: string) => {
    setActiveTabState(tab);
    if (isAdmin) setIsAdmin(false);
    const targetPath = getPathFromTab(tab);
    if (window.location.pathname !== targetPath) {
      window.history.pushState({}, '', targetPath);
    }
  };

  // Sync App Settings with Supabase on mount & whenever admin updates
  React.useEffect(() => {
    syncAppSettingsWithSupabase().then((remote) => {
      if (remote) setSettings(remote);
    }).catch(() => {});
  }, [isAdmin]);

  // Check and listen to Supabase Auth Session for abedoni.bd@gmail.com
  React.useEffect(() => {
    const checkAuthSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email?.toLowerCase() === 'abedoni.bd@gmail.com') {
        setIsAdminAuthenticated(true);
        sessionStorage.setItem('abedoni_admin_authed', 'true');
      } else {
        setIsAdminAuthenticated(false);
        sessionStorage.removeItem('abedoni_admin_authed');
      }
    };

    checkAuthSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user?.email?.toLowerCase() === 'abedoni.bd@gmail.com') {
        setIsAdminAuthenticated(true);
        sessionStorage.setItem('abedoni_admin_authed', 'true');
      } else {
        setIsAdminAuthenticated(false);
        sessionStorage.removeItem('abedoni_admin_authed');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Trigger a full-screen grand welcome confetti on page entry
  React.useEffect(() => {
    try {
      const colors = ['#2563eb', '#059669', '#d97706', '#3b82f6', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6'];
      
      const timer1 = setTimeout(() => {
        // Left Cannon
        confetti({
          particleCount: 80,
          angle: 60,
          spread: 80,
          origin: { x: 0, y: 0.65 },
          colors,
          ticks: 250,
          gravity: 0.8,
          scalar: 1,
          disableForReducedMotion: true
        });

        // Right Cannon
        confetti({
          particleCount: 80,
          angle: 120,
          spread: 80,
          origin: { x: 1, y: 0.65 },
          colors,
          ticks: 250,
          gravity: 0.8,
          scalar: 1,
          disableForReducedMotion: true
        });
      }, 300);

      // Center wide shower burst
      const timer2 = setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 140,
          origin: { x: 0.5, y: 0.4 },
          colors,
          ticks: 250,
          gravity: 0.7,
          scalar: 1.1,
          disableForReducedMotion: true
        });
      }, 550);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    } catch (e) {
      console.error('Welcome confetti error:', e);
    }
  }, []);

  // Check URL pathname or hash on load & popstate
  React.useEffect(() => {
    const handleUrlCheck = () => {
      const path = window.location.pathname.toLowerCase().replace(/\/$/, '');
      if (path === '/admin-munna' || window.location.hash === '#/admin-munna') {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
        setActiveTabState(getTabFromPath(path));
      }
    };
    window.addEventListener('popstate', handleUrlCheck);
    return () => window.removeEventListener('popstate', handleUrlCheck);
  }, []);

  // GA4 Page View Tracking on Route / Tab Changes
  React.useEffect(() => {
    const currentPath = isAdmin ? '/admin-munna' : getPathFromTab(activeTab);
    const titleMap: Record<string, string> = {
      'home': 'হোম - আবেদনী',
      'apply': 'আবেদন করুন - আবেদনী',
      'track': 'আবেদন ট্র্যাক - আবেদনী',
      'pricing': 'সার্ভিস চার্জ ও তথ্য - আবেদনী',
      'notice': 'নোটিশ - আবেদনী',
      'faq': 'প্রশ্নোত্তর - আবেদনী',
      'about': 'আমাদের সম্পর্কে - আবেদনী',
    };
    const pageTitle = isAdmin ? 'অ্যাডমিন প্যানেল - আবেদনী' : (titleMap[activeTab] || 'আবেদনী');
    trackPageView(currentPath, pageTitle);
  }, [activeTab, isAdmin]);
  
  // Policy Modal state
  const [showPolicies, setShowPolicies] = useState<boolean>(false);
  const [policyType, setPolicyType] = useState<'privacy' | 'terms' | 'refund' | 'disclaimer'>('disclaimer');

  const openPolicy = (type: 'privacy' | 'terms' | 'refund' | 'disclaimer') => {
    setPolicyType(type);
    setShowPolicies(true);
  };

  // Tracked order reference
  const [latestOrderId, setLatestOrderId] = useState<string | undefined>(undefined);

  const handleOrderCompleted = (order: BoardChallengeOrder) => {
    setLatestOrderId(order.id);
  };

  return (
    <div className={`relative min-h-screen bg-[#F0F4FF] text-slate-900 flex flex-col font-bn selection:bg-blue-200 selection:text-blue-900 overflow-x-hidden ${isAdmin ? 'pb-0' : 'pb-16 md:pb-0'}`}>
      
      {/* SEO Head Manager */}
      <SeoHead activeTab={activeTab} isMaintenanceActive={isMaintenanceActive} settings={settings} />

      {/* Decorative Frosted Glass Ambient Blur Globs */}
      <div className="fixed top-[-100px] right-[-100px] w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="fixed bottom-[-50px] left-[-50px] w-[400px] h-[400px] bg-emerald-400/20 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="fixed top-[45%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-300/15 rounded-full blur-[160px] pointer-events-none z-0" />

      {/* Header - Hidden in Admin Mode */}
      {!isAdmin && (
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isAdmin={isAdmin}
          setIsAdmin={setIsAdmin}
          settings={settings}
        />
      )}

      {/* Main View Container */}
      <main className={`relative z-10 flex-1 w-full mx-auto ${isAdmin ? 'max-w-none px-2 sm:px-4 lg:px-6 pt-3 pb-6' : 'max-w-7xl px-4 sm:px-6 lg:px-8 pt-6'}`}>
        {isAdmin ? (
          isAdminAuthenticated ? (
            <AdminPanel 
              onLogout={async () => {
                await supabase.auth.signOut();
                setIsAdminAuthenticated(false);
                sessionStorage.removeItem('abedoni_admin_authed');
              }}
              onSettingsUpdated={(newSettings) => setSettings(newSettings)}
            />
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
        ) : isMaintenanceActive ? (
          <MaintenanceView 
            settings={settings} 
            onOpenAdminAuth={() => {
              setIsAdmin(true);
              window.history.pushState({}, '', '/admin-munna');
            }} 
          />
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
      {!isAdmin && <WhatsAppFloatingButton />}

      {/* Mobile Bottom Bar for App-like Experience (hidden during Maintenance Mode and Admin) */}
      {!isMaintenanceActive && !isAdmin && (
        <MobileBottomNav
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isAdmin={isAdmin}
          setIsAdmin={setIsAdmin}
        />
      )}

      {/* Footer (hidden during Maintenance Mode & Admin Mode) */}
      {!isMaintenanceActive && !isAdmin && (
        <footer className="relative z-10 bg-slate-900/95 backdrop-blur-2xl text-slate-300 border-t border-slate-800/60 pt-12 pb-8 mt-16 font-bn">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            {/* Brand Intro */}
            <div className="space-y-3 md:col-span-1">
              <div className="flex flex-col items-start gap-2">
                <img 
                  src={settings.logoWordmarkUrl || 'https://raw.githubusercontent.com/tahmidislammunna/tm/refs/heads/main/logo-with-wordmark.jpg'} 
                  alt="Abedoni Wordmark Logo" 
                  className="h-11 w-auto object-contain rounded-xl bg-white p-1 shadow-md border border-slate-700/60" 
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = settings.logoIconUrl || 'https://raw.githubusercontent.com/tahmidislammunna/tm/0a4f98323c65fd4013d3a2fd8d66b2e2d750e5d5/favicon-logo-icon.svg';
                  }}
                />
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
              <h4 className="font-bold text-white text-sm">আইনি তথ্য ও নীতিমালা</h4>
              <ul className="space-y-1.5">
                <li>
                  <button onClick={() => openPolicy('disclaimer')} className="text-amber-400 hover:text-amber-300 font-bold transition flex items-center gap-1 cursor-pointer">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>আইনি ঘোষণা (Disclaimer)</span>
                  </button>
                </li>
                <li>
                  <button onClick={() => openPolicy('terms')} className="hover:text-white transition cursor-pointer">ব্যবহারের শর্তাবলী (Terms of Service)</button>
                </li>
                <li>
                  <button onClick={() => openPolicy('privacy')} className="hover:text-white transition cursor-pointer">গোপনীয়তা নীতি (Privacy Policy)</button>
                </li>
                <li>
                  <button onClick={() => openPolicy('refund')} className="hover:text-white transition cursor-pointer">রিফান্ড পলিসি (Refund Policy)</button>
                </li>
                <li className="pt-2">
                  <button onClick={() => setShowPRD(true)} className="text-slate-400 hover:text-slate-300 flex items-center gap-1 text-[11px] cursor-pointer">
                    <BookOpen className="w-3 h-3" />
                    <span>কারিগরি নথি (PRD)</span>
                  </button>
                </li>
              </ul>
            </div>

          </div>

          {/* Non-Affiliation Disclaimer Banner */}
          <div className="bg-slate-950/80 p-3.5 sm:p-4 rounded-2xl border border-slate-800 text-[11px] text-slate-400 leading-relaxed font-bn space-y-1">
            <p className="font-bold text-amber-400 flex items-center gap-1.5 text-xs">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>স্বাতন্ত্র্য ও আইনি ঘোষণা (Non-Affiliation Notice):</span>
            </p>
            <p>
              আবেদনী (Abedoni) একটি সম্পূর্ণ স্বাধীন ডিজিটাল আবেদন সহায়তাকারী প্ল্যাটফর্ম। আমরা কোনো সরকারি বিভাগ, মাধ্যমিক ও উচ্চমাধ্যমিক শিক্ষা বোর্ড (ঢাকা, রাজশাহী, চট্টগ্রাম, কুমিল্লা ইত্যাদি) কিংবা টেলিটক বাংলাদেশ লিমিটেডের অনুমোদিত বা অফিসিয়াল অঙ্গপ্রতিষ্ঠান নই। আমরা শিক্ষার্থীদের প্রদত্ত তথ্য অনুযায়ী কারিগরি উপায়ে বোর্ড চ্যালেঞ্জ আবেদন প্রক্রিয়ায় সহায়তা প্রদান করি।
            </p>
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
      )}

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
