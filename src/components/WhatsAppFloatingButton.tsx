import React, { useState } from 'react';
import { MessageSquare, X } from 'lucide-react';
import { getAppSettings } from '../data/appSettings';

export const WhatsAppFloatingButton: React.FC = () => {
  const settings = getAppSettings();
  const whatsappNum = settings.whatsappNumber || '01577777092';
  const cleanPhone = whatsappNum.replace(/\D/g, '');
  const phoneWithCountry = cleanPhone.startsWith('88') ? cleanPhone : `88${cleanPhone}`;
  
  const [showTooltip, setShowTooltip] = useState(true);

  const defaultMsg = encodeURIComponent('আসসালামু আলাইকুম, আবেদনী (Abedoni) SSC বোর্ড চ্যালেঞ্জ ২০২৬ সম্পর্কে সহায়তা প্রয়োজন।');
  const whatsappUrl = `https://wa.me/${phoneWithCountry}?text=${defaultMsg}`;

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-50 flex flex-col items-end no-print">
      
      {/* Optional Floating Speech Bubble / Tooltip */}
      {showTooltip && (
        <div className="mb-2 bg-slate-900 text-white text-xs font-bn px-3 py-1.5 rounded-2xl shadow-xl border border-slate-800 flex items-center gap-2 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>হোয়াটসঅ্যাপে সরাসরি মেসেজ দিন</span>
          <button 
            onClick={(e) => { e.stopPropagation(); setShowTooltip(false); }}
            className="text-slate-400 hover:text-white p-0.5"
            title="মেসেজ বন্ধ করুন"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Main Traditional Green Floating WhatsApp Action Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contact on WhatsApp"
        className="relative group bg-[#25D366] hover:bg-[#20bd5a] text-white p-3.5 sm:p-4 rounded-full shadow-2xl shadow-emerald-600/40 hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center cursor-pointer border-2 border-white/80"
      >
        {/* Pulsing Backlight Effect */}
        <span className="absolute -inset-1 rounded-full bg-[#25D366]/40 animate-ping pointer-events-none opacity-75" />
        
        {/* WhatsApp Icon */}
        <MessageSquare className="w-6 h-6 sm:w-7 sm:h-7 fill-white text-[#25D366] relative z-10" />

        {/* Desktop Hover Tag */}
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 ease-in-out whitespace-nowrap text-xs font-bold font-bn pl-0 group-hover:pl-2 relative z-10 hidden sm:inline-block">
          WhatsApp Support
        </span>
      </a>

    </div>
  );
};
