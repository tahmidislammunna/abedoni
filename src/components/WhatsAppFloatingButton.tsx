import React from 'react';
import { MessageSquare } from 'lucide-react';
import { getAppSettings } from '../data/appSettings';

export const WhatsAppFloatingButton: React.FC = () => {
  const settings = getAppSettings();
  const whatsappNum = settings.whatsappNumber || '01577777092';
  const cleanPhone = whatsappNum.replace(/\D/g, '');
  const phoneWithCountry = cleanPhone.startsWith('88') ? cleanPhone : `88${cleanPhone}`;

  const defaultMsg = encodeURIComponent('আসসালামু আলাইকুম, আবেদনী (Abedoni) SSC বোর্ড চ্যালেঞ্জ ২০২৬ সম্পর্কে সহায়তা প্রয়োজন।');
  const whatsappUrl = `https://wa.me/${phoneWithCountry}?text=${defaultMsg}`;

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-50 no-print">
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contact on WhatsApp"
        title="WhatsApp Support"
        className="bg-[#25D366] hover:bg-[#20bd5a] text-white p-3.5 sm:p-4 rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center cursor-pointer border border-white/40"
      >
        <MessageSquare className="w-6 h-6 fill-white text-[#25D366]" />
      </a>
    </div>
  );
};
