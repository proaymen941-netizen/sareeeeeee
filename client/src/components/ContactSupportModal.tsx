import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MessageCircle, PhoneCall, Headphones, Clock, Sparkles } from 'lucide-react';
import { useUiSettings } from '@/context/UiSettingsContext';
import { handlePhoneCall, handleWhatsApp, formatDisplayPhone } from '@/utils/contactUtils';

interface ContactSupportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ContactSupportModal: React.FC<ContactSupportModalProps> = ({
  open,
  onOpenChange,
}) => {
  const { getSetting } = useUiSettings();

  const supportWhatsapp =
    getSetting('support_whatsapp') ||
    getSetting('about_app_whatsapp') ||
    '967777777777';

  const supportPhone =
    getSetting('support_phone') ||
    getSetting('about_app_phone') ||
    '+967777777777';

  const supportTitle = getSetting('text_support_title') || 'تواصل معنا';
  const openingTime = getSetting('opening_time') || '08:00';
  const closingTime = getSetting('closing_time') || '23:00';

  const handleWhatsAppClick = () => {
    onOpenChange(false);
    handleWhatsApp(supportWhatsapp, 'مرحباً، أود الاستفسار بخصوص تطبيق السريع ون');
  };

  const handlePhoneClick = () => {
    onOpenChange(false);
    handlePhoneCall(supportPhone);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md w-[92vw] max-w-lg rounded-3xl p-0 overflow-hidden border-0 shadow-2xl bg-white"
        dir="rtl"
      >
        {/* Top Header Banner */}
        <div className="relative bg-gradient-to-br from-[#E03A0E] via-[#F05215] to-[#FF7840] p-6 text-white text-center">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-3 shadow-inner border border-white/30">
            <Headphones className="h-7 w-7 text-white" />
          </div>
          <DialogTitle className="text-2xl font-black tracking-tight text-white mb-1">
            {supportTitle}
          </DialogTitle>
          <DialogDescription className="text-white/90 text-sm font-medium">
            فريق خدمة العملاء جاهز للرد على استفساراتكم ومساعدتكم
          </DialogDescription>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          <div className="grid gap-3.5">
            {/* WhatsApp Option */}
            <button
              type="button"
              onClick={handleWhatsAppClick}
              className="w-full flex items-center justify-between p-4 rounded-2xl border-2 border-emerald-100 bg-emerald-50/40 hover:bg-emerald-100/60 hover:border-emerald-300 transition-all active:scale-[0.98] group text-right shadow-sm"
              data-testid="button-contact-modal-whatsapp"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform shrink-0">
                  <MessageCircle className="h-6 w-6" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-gray-900 text-base">مراسلة عبر واتساب</span>
                    <span className="text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-full">سريع ومباشر</span>
                  </div>
                  <p className="text-xs text-gray-500 font-medium mt-0.5 truncate">
                    تحدث معنا الآن عبر تطبيق واتساب
                  </p>
                  <p className="text-[11px] font-bold text-emerald-700 mt-1 dir-ltr text-right">
                    {formatDisplayPhone(supportWhatsapp)}
                  </p>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-emerald-100/80 flex items-center justify-center text-emerald-700 shrink-0 mr-2 group-hover:translate-x-[-2px] transition-transform">
                <span className="text-sm font-black">←</span>
              </div>
            </button>

            {/* Direct Phone Call Option */}
            <button
              type="button"
              onClick={handlePhoneClick}
              className="w-full flex items-center justify-between p-4 rounded-2xl border-2 border-blue-100 bg-blue-50/40 hover:bg-blue-100/60 hover:border-blue-300 transition-all active:scale-[0.98] group text-right shadow-sm"
              data-testid="button-contact-modal-call"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform shrink-0">
                  <PhoneCall className="h-6 w-6" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-gray-900 text-base">اتصال هاتفي</span>
                    <span className="text-[10px] font-bold bg-blue-600 text-white px-2 py-0.5 rounded-full">مكالمة هاتفية</span>
                  </div>
                  <p className="text-xs text-gray-500 font-medium mt-0.5 truncate">
                    اتصال فوري مع ممثل خدمة العملاء
                  </p>
                  <p className="text-[11px] font-bold text-blue-700 mt-1 dir-ltr text-right">
                    {formatDisplayPhone(supportPhone)}
                  </p>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-blue-100/80 flex items-center justify-center text-blue-700 shrink-0 mr-2 group-hover:translate-x-[-2px] transition-transform">
                <span className="text-sm font-black">←</span>
              </div>
            </button>
          </div>

          {/* Working Hours Info Footer */}
          <div className="pt-2 flex items-center justify-center gap-2 text-xs font-bold text-gray-400">
            <Clock className="h-3.5 w-3.5 text-gray-400" />
            <span>ساعات العمل المتاحة: {openingTime} - {closingTime}</span>
          </div>

          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="w-full h-11 rounded-2xl font-bold text-sm text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-all"
          >
            إغلاق
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ContactSupportModal;
