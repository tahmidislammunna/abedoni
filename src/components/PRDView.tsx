import React from 'react';
import { BookOpen, X, CheckCircle2, ShieldCheck, Cpu, Database, Server, Layers, Globe } from 'lucide-react';

interface PRDViewProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PRDView: React.FC<PRDViewProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 font-bn">
      <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-10 space-y-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-bold text-slate-900">Product Requirement Document (PRD)</h2>
              <p className="text-xs text-slate-500 font-mono">Аবেদনী (Abedoni) — Next-Gen Digital Application Platform</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 font-bold text-xl p-1"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* PRD Content */}
        <div className="space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">
          
          {/* Executive Summary */}
          <section className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2">
            <h3 className="font-bold text-slate-900 text-base font-bn">1. Executive Summary & Vision</h3>
            <p className="font-bn">
              <strong>আবেদনী (Abedoni)</strong> is Bangladesh's premier, trusted digital application assistance platform. Phase 1 focuses on solving the critical friction in <strong>SSC Board Challenge 2026 (খাতা পুনঃমূল্যায়ন)</strong> where over 1.5M students face Teletalk SIM dependencies, computer shop extortion, and zero status transparency.
            </p>
            <p className="text-xs text-slate-500 font-bn">
              Tagline: <strong>"আবেদন হোক সহজ।"</strong> • Vision: To become Bangladesh's universal single-window application portal for education, job applications, government services, driving licenses, and passports.
            </p>
          </section>

          {/* System Architecture */}
          <section className="space-y-3 font-bn">
            <h3 className="font-bold text-slate-900 text-base">2. System Architecture & Tech Stack</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-blue-50/60 p-3.5 rounded-xl border border-blue-200">
                <span className="font-bold text-blue-900 block mb-1">Frontend Layer:</span>
                <p className="text-slate-700">React 19 + TypeScript + TailwindCSS v4 + Motion + Lucide Icons. Clean Apple/Stripe-level UI with maximum whitespace and responsive design.</p>
              </div>
              <div className="bg-emerald-50/60 p-3.5 rounded-xl border border-emerald-200">
                <span className="font-bold text-emerald-900 block mb-1">Backend & API Engine:</span>
                <p className="text-slate-700">Node.js + Express REST API proxying live board calculations, automated TeleTalk SMS command compilation, and receipt generation.</p>
              </div>
              <div className="bg-purple-50/60 p-3.5 rounded-xl border border-purple-200">
                <span className="font-bold text-purple-900 block mb-1">Data Model (Prisma Schema):</span>
                <p className="text-slate-700">PostgreSQL store tracking BoardChallengeOrder, Receipt, PaymentVerification, TeleTalkLogs, and CustomerWhatsAppAudit.</p>
              </div>
              <div className="bg-amber-50/60 p-3.5 rounded-xl border border-amber-200">
                <span className="font-bold text-amber-900 block mb-1">Admin Operations:</span>
                <p className="text-slate-700">Automated 2-stage TeleTalk SMS command generator (`RSC BOARD ROLL SUB_CODES` & `RSC YES PIN PHONE`), status updater, and Excel exporter.</p>
              </div>
            </div>
          </section>

          {/* Core User Flow */}
          <section className="space-y-2 font-bn">
            <h3 className="font-bold text-slate-900 text-base">3. User Flow & State Machine</h3>
            <div className="bg-slate-900 text-slate-200 p-4 rounded-2xl font-mono text-xs overflow-x-auto space-y-1">
              <p>Facebook / Web Search ➔ Abedoni Portal ➔ Student Details (Board, Roll, Reg)</p>
              <p>➔ Subject Selection ➔ Live Auto Fee Calculation (Board Fee + Platform Fee)</p>
              <p>➔ bKash/Nagad Payment ➔ Digital Receipt + WhatsApp Auto-Message</p>
              <p>➔ Admin TeleTalk Panel ➔ 1-Click Copy TeleTalk SMS 1 ➔ PIN Receipt ➔ 1-Click Copy TeleTalk SMS 2</p>
              <p>➔ Board Submission Verified ➔ Live WhatsApp Screenshot Delivery ➔ Status: COMPLETED</p>
            </div>
          </section>

          {/* Roadmap Phases */}
          <section className="space-y-2 font-bn">
            <h3 className="font-bold text-slate-900 text-base">4. Implementation Roadmap Phases</h3>
            <div className="space-y-2 text-xs">
              <div className="border-l-4 border-blue-600 pl-3 py-1">
                <strong className="text-blue-900">Phase 1 (Current Production MVP):</strong> SSC Board Challenge 2026 One-stop application, instant fee calculator, digital receipt generator, order tracker, and admin SMS generator panel.
              </div>
              <div className="border-l-4 border-emerald-600 pl-3 py-1">
                <strong className="text-emerald-900">Phase 2:</strong> HSC Board Challenge, XI College Admission Application, Public University Admission helper.
              </div>
              <div className="border-l-4 border-purple-600 pl-3 py-1">
                <strong className="text-purple-900">Phase 3:</strong> Government Job Application forms, Passport assistance, Driving License booking, and Visa support.
              </div>
            </div>
          </section>

        </div>

        {/* Modal Footer */}
        <div className="pt-4 border-t border-slate-200 text-right">
          <button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition"
          >
            বন্ধ করুন (Close PRD)
          </button>
        </div>

      </div>
    </div>
  );
};
