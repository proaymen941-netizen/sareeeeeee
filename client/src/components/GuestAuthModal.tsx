import React from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/context/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { LogIn, UserPlus, ShoppingBag, ShieldAlert, Sparkles, X } from 'lucide-react';

export const GuestAuthModal: React.FC = () => {
  const { authModalOpen, authModalAction, closeAuthModal } = useAuth();
  const [, setLocation] = useLocation();

  const handleGoToAuth = () => {
    closeAuthModal?.();
    setLocation('/auth');
  };

  return (
    <Dialog open={Boolean(authModalOpen)} onOpenChange={(open) => !open && closeAuthModal?.()}>
      <DialogContent className="sm:max-w-md w-[92vw] max-w-lg rounded-3xl p-0 overflow-hidden border-0 shadow-2xl bg-white" dir="rtl">
        {/* Top Header Banner */}
        <div className="relative bg-gradient-to-br from-[#E03A0E] via-[#F05215] to-[#FF7840] p-6 text-white text-center">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-3 shadow-inner border border-white/30">
            <ShoppingBag className="h-7 w-7 text-white" />
          </div>
          <DialogTitle className="text-2xl font-black tracking-tight text-white mb-1">
            تسجيل الدخول مطلوب
          </DialogTitle>
          <DialogDescription className="text-white/90 text-sm font-medium">
            للاستفادة من كافة خدمات تطبيق السريع ون
          </DialogDescription>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          <div className="bg-orange-50/80 border border-orange-100 rounded-2xl p-4 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0 mt-0.5">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-gray-900 mb-1">
                {authModalAction ? `لإتمام عملية (${authModalAction})` : 'لإتمام طلبك ومتابعة التسوق'}
              </p>
              <p className="text-xs text-gray-600 leading-relaxed">
                أنت تتصفح حالياً كـ <strong className="text-primary font-bold">زائر</strong>. يرجى تسجيل الدخول بحسابك أو إنشاء حساب جديد لإضافة المنتجات إلى السلة، حفظ العناوين، وإتمام الطلبات وتتبعها مباشرة.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <Button
              onClick={handleGoToAuth}
              className="w-full h-13 rounded-2xl font-black text-lg bg-gradient-to-r from-[#E03A0E] to-[#F05215] hover:opacity-95 text-white shadow-lg shadow-primary/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              data-testid="button-modal-login-register"
            >
              <LogIn className="h-5 w-5" />
              تسجيل الدخول / إنشاء حساب
            </Button>

            <Button
              type="button"
              variant="ghost"
              onClick={closeAuthModal}
              className="w-full h-11 rounded-2xl font-bold text-sm text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-all"
              data-testid="button-modal-continue-browsing"
            >
              متابعة التصفح كزائر
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GuestAuthModal;
