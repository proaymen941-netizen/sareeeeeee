import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';
import { 
  Loader2, 
  User, 
  UserPlus, 
  Phone, 
  Lock, 
  ArrowRight, 
  ShieldCheck, 
  RefreshCw, 
  KeyRound, 
  CheckCircle2, 
  MessageCircle,
  Eye,
  EyeOff,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { handleWhatsApp } from '@/utils/contactUtils';

export default function CustomerAuthPage() {
  const [, setLocation] = useLocation();
  const { login, register, sendOtp, verifyOtp, resetPassword, continueAsGuest, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'forgot'>('login');

  // حقول تسجيل الدخول
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // حقول إنشاء الحساب
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // حالة التحقق لإنشاء الحساب برمز OTP
  const [showOtpStep, setShowOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [demoOtpCode, setDemoOtpCode] = useState('');
  const [otpWhatsappUrl, setOtpWhatsappUrl] = useState('');
  const [otpChannel, setOtpChannel] = useState('whatsapp');
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // حقول وحالة استعادة كلمة المرور (Forgot Password)
  const [forgotPhone, setForgotPhone] = useState('');
  const [forgotStep, setForgotStep] = useState<1 | 2>(1); // 1 = إدخال الهاتف، 2 = إدخال OTP وكلمة المرور الجديدة
  const [forgotOtpCode, setForgotOtpCode] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [showForgotNewPassword, setShowForgotNewPassword] = useState(false);
  const [showForgotConfirmPassword, setShowForgotConfirmPassword] = useState(false);
  const [forgotDemoOtpCode, setForgotDemoOtpCode] = useState('');
  const [forgotOtpWhatsappUrl, setForgotOtpWhatsappUrl] = useState('');
  const [forgotOtpChannel, setForgotOtpChannel] = useState('whatsapp');
  const [forgotCountdown, setForgotCountdown] = useState(60);
  const [forgotCanResend, setForgotCanResend] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      setLocation('/');
    }
  }, [isAuthenticated, setLocation]);

  // عداد إعادة الإرسال لإنشاء الحساب
  useEffect(() => {
    let timer: any;
    if (showOtpStep && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [showOtpStep, countdown]);

  // عداد إعادة الإرسال لاستعادة كلمة المرور
  useEffect(() => {
    let timer: any;
    if (forgotStep === 2 && forgotCountdown > 0) {
      timer = setInterval(() => {
        setForgotCountdown((prev) => prev - 1);
      }, 1000);
    } else if (forgotCountdown === 0) {
      setForgotCanResend(true);
    }
    return () => clearInterval(timer);
  }, [forgotStep, forgotCountdown]);

  // التحقق من رقم الهاتف اليمني: 9 أرقام يبدأ بـ 77، 78، 71، 70، أو 73
  const validateYemeniPhone = (phone: string): string | null => {
    const normalized = phone
      .replace(/[\u0660-\u0669]/g, d => String(d.charCodeAt(0) - 0x0660))
      .replace(/[\u06F0-\u06F9]/g, d => String(d.charCodeAt(0) - 0x06F0))
      .replace(/\s+/g, '');
    if (!/^\d{9}$/.test(normalized)) {
      return 'رقم الهاتف يجب أن يتكون من 9 أرقام بالضبط';
    }
    if (!/^(77|78|71|70|73)/.test(normalized)) {
      return 'رقم الهاتف يجب أن يبدأ بـ 77 أو 78 أو 71 أو 70 أو 73';
    }
    return null;
  };

  // معالجة تسجيل الدخول
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginIdentifier.trim()) {
      setError('يرجى إدخال الاسم أو رقم الهاتف');
      return;
    }
    if (!loginPassword) {
      setError('يرجى إدخال كلمة المرور');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const result = await login(loginIdentifier.trim(), loginPassword);
      if (result.success) {
        toast({ title: 'تم تسجيل الدخول بنجاح 🎉', description: 'مرحباً بك مجدداً في السريع ون' });
        setLocation('/');
      } else {
        setError(result.message || 'بيانات الدخول غير صحيحة');
      }
    } catch {
      setError('خطأ في تسجيل الدخول. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  // 1. طلب إرسال رمز التحقق OTP لإنشاء الحساب
  const handleStartRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim()) {
      setError('يرجى إدخال الاسم بالكامل');
      return;
    }
    if (!regPhone.trim()) {
      setError('يرجى إدخال رقم الهاتف');
      return;
    }
    const phoneError = validateYemeniPhone(regPhone);
    if (phoneError) {
      setError(phoneError);
      return;
    }
    if (!regPassword) {
      setError('يرجى إدخال كلمة المرور');
      return;
    }
    if (regPassword.length < 3) {
      setError('كلمة المرور يجب أن لا تقل عن 3 أحرف');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await sendOtp(regPhone.trim(), 'register');
      if (res.success) {
        if (res.disabled) {
          // إذا كانت ميزة OTP معطلة من لوحة التحكم، إنشاء الحساب فوراً
          const regRes = await register({
            name: regName.trim(),
            phone: regPhone.trim(),
            username: regPhone.trim(),
            password: regPassword,
            userType: 'customer',
          });
          if (regRes.success) {
            toast({
              title: 'تم إنشاء الحساب بنجاح 🎉',
              description: 'أهلاً بك في منصة السريع ون',
            });
            setLocation('/');
            return;
          } else {
            setError(regRes.message || 'فشل في إنشاء الحساب');
            return;
          }
        }

        if (res.channel) setOtpChannel(res.channel);
        if (res.whatsappUrl) setOtpWhatsappUrl(res.whatsappUrl);
        
        if (res.otpCode) {
          setDemoOtpCode(res.otpCode);
          setOtpCode(res.otpCode); // تعبئة تلقائية للتجربة
        }

        setShowOtpStep(true);
        setCountdown(60);
        setCanResend(false);

        toast({
          title: 'تم إرسال كود التحقق 💬',
          description: 'يرجى إدخال رمز التحقق المكون من 4 أرقام الموضح أدناه للتأكيد.'
        });
      } else {
        setError(res.message || 'فشل في إرسال رمز التحقق');
      }
    } catch {
      setError('حدث خطأ أثناء إرسال رمز التحقق. يرجى المحاولة لاحقاً.');
    } finally {
      setLoading(false);
    }
  };

  // إعادة إرسال رمز OTP لإنشاء الحساب
  const handleResendOtp = async () => {
    if (!canResend) return;
    setLoading(true);
    setError('');
    try {
      const res = await sendOtp(regPhone.trim(), 'register');
      if (res.success) {
        if (res.channel) setOtpChannel(res.channel);
        if (res.whatsappUrl) setOtpWhatsappUrl(res.whatsappUrl);
        if (res.otpCode) {
          setDemoOtpCode(res.otpCode);
          setOtpCode(res.otpCode);
        }
        setCountdown(60);
        setCanResend(false);

        toast({
          title: 'تم إعادة إرسال الرمز',
          description: 'تم إرسال رمز تحقق جديد بنجاح'
        });
      } else {
        setError(res.message || 'تعذر إعادة إرسال الرمز');
      }
    } catch {
      setError('حدث خطأ أثناء إعادة إرسال الرمز');
    } finally {
      setLoading(false);
    }
  };

  // 2. التحقق من الرمز وإنشاء الحساب النهائي
  const handleFinalRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim() || otpCode.trim().length < 4) {
      setError('يرجى إدخال رمز التحقق المكون من 4 أرقام');
      return;
    }
    setLoading(true);
    setError('');
    try {
      // التحقق أولاً من الرمز عبر API
      const verifyRes = await verifyOtp(regPhone.trim(), otpCode.trim());
      if (!verifyRes.success) {
        setError(verifyRes.message || 'رمز التحقق غير صحيح');
        setLoading(false);
        return;
      }

      // إنشاء الحساب
      const result = await register({
        name: regName.trim(),
        phone: regPhone.trim(),
        password: regPassword,
        username: regName.trim(),
        otpCode: otpCode.trim(),
      });
      if (result.success) {
        toast({ title: 'تم إنشاء الحساب بنجاح', description: 'مرحباً بك في السريع ون! تم التحقق من رقمك وإنشاء حسابك 🎉' });
        setLocation('/');
      } else {
        setError(result.message || 'فشل في إنشاء الحساب');
      }
    } catch {
      setError('خطأ في إنشاء الحساب. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------------
  // معالجات استعادة كلمة المرور (FORGOT / RESET PASSWORD)
  // -------------------------------------------------------------

  // 1. بدء استعادة كلمة المرور وإرسال OTP
  const handleStartForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotPhone.trim()) {
      setError('يرجى إدخال رقم الهاتف المسجل في حسابك');
      return;
    }
    const phoneError = validateYemeniPhone(forgotPhone);
    if (phoneError) {
      setError(phoneError);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await sendOtp(forgotPhone.trim(), 'forgot_password');
      if (res.success) {
        if (res.disabled) {
          setForgotOtpCode('0000');
        }
        if (res.channel) setForgotOtpChannel(res.channel);
        if (res.whatsappUrl) setForgotOtpWhatsappUrl(res.whatsappUrl);
        if (res.otpCode) {
          setForgotDemoOtpCode(res.otpCode);
          setForgotOtpCode(res.otpCode);
        }

        setForgotStep(2);
        setForgotCountdown(60);
        setForgotCanResend(false);

        toast({
          title: 'تم إرسال رمز الاستعادة 🔐',
          description: 'تم إرسال رمز التحقق إلى رقم هاتفك، يرجى إدخاله وتعيين كلمة المرور الجديدة.'
        });
      } else {
        setError(res.message || 'تعذر إرسال رمز الاستعادة. يرجى التأكد من رقم الهاتف.');
      }
    } catch {
      setError('حدث خطأ أثناء الاتصال بالخادم. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  // إعادة إرسال رمز استعادة كلمة المرور
  const handleResendForgotOtp = async () => {
    if (!forgotCanResend) return;
    setLoading(true);
    setError('');
    try {
      const res = await sendOtp(forgotPhone.trim(), 'forgot_password');
      if (res.success) {
        if (res.channel) setForgotOtpChannel(res.channel);
        if (res.whatsappUrl) setForgotOtpWhatsappUrl(res.whatsappUrl);
        if (res.otpCode) {
          setForgotDemoOtpCode(res.otpCode);
          setForgotOtpCode(res.otpCode);
        }
        setForgotCountdown(60);
        setForgotCanResend(false);

        toast({
          title: 'تم إعادة إرسال رمز الاستعادة',
          description: 'تم إرسال رمز تحقق جديد بنجاح'
        });
      } else {
        setError(res.message || 'تعذر إعادة إرسال الرمز');
      }
    } catch {
      setError('حدث خطأ أثناء إعادة إرسال الرمز');
    } finally {
      setLoading(false);
    }
  };

  // 2. تأكيد وتغيير كلمة المرور وتسجيل الدخول المباشر
  const handleFinalResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotOtpCode.trim() || forgotOtpCode.trim().length < 4) {
      setError('يرجى إدخال رمز التحقق المكون من 4 أرقام');
      return;
    }
    if (!forgotNewPassword) {
      setError('يرجى إدخال كلمة المرور الجديدة');
      return;
    }
    if (forgotNewPassword.length < 3) {
      setError('كلمة المرور الجديدة يجب أن لا تقل عن 3 أحرف');
      return;
    }
    if (forgotNewPassword !== forgotConfirmPassword) {
      setError('كلمتا المرور غير متطابقتين، يرجى التأكد من التطابق');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await resetPassword(
        forgotPhone.trim(),
        forgotOtpCode.trim(),
        forgotNewPassword
      );

      if (res.success) {
        toast({
          title: 'تم تغيير كلمة المرور بنجاح 🎉',
          description: 'تم تحديث كلمة المرور وتسجيل دخولك إلى حسابك بنجاح.',
        });
        setLocation('/');
      } else {
        setError(res.message || 'فشل في تغيير كلمة المرور');
      }
    } catch {
      setError('حدث خطأ أثناء تغيير كلمة المرور. يرجى المحاولة لاحقاً.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 py-12" dir="rtl">
      <div className="mb-8 text-center">
        <div className="text-5xl md:text-6xl mb-4 flex justify-center font-black">
          <span className="text-[#ec3714]">السريع ون</span>
        </div>
        <p className="text-muted-foreground font-bold">لخدمات التوصيل والتسوق</p>
      </div>

      <Card className="w-full max-w-md border-none shadow-2xl rounded-[2rem] overflow-hidden bg-white">
        <CardHeader className="space-y-1 bg-white pb-6 px-8 pt-8">
          <div className="flex items-center gap-2 mb-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => {
                if (activeTab === 'forgot') {
                  setActiveTab('login');
                  setError('');
                } else {
                  setLocation('/');
                }
              }} 
              className="h-10 w-10 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ArrowRight className="h-6 w-6" />
            </Button>
            <CardTitle className="text-3xl font-black">
              {activeTab === 'forgot' ? 'استعادة كلمة المرور' : 'حسابي'}
            </CardTitle>
          </div>
          <CardDescription className="text-base font-medium text-gray-600">
            {activeTab === 'forgot' 
              ? 'أدخل رقم هاتفك المسجل لتعيين كلمة مرور جديدة لحسابك'
              : 'سجل دخولك أو أنشئ حساباً جديداً لتجربة تسوق رائعة'}
          </CardDescription>
        </CardHeader>

        <CardContent className="bg-white px-8 pb-10">
          <Tabs 
            value={activeTab} 
            onValueChange={(val: any) => { 
              setActiveTab(val); 
              setShowOtpStep(false); 
              setForgotStep(1);
              setError(''); 
            }} 
            className="w-full"
          >
            {activeTab !== 'forgot' ? (
              <TabsList className="grid w-full grid-cols-2 mb-8 bg-gray-100 p-1.5 rounded-2xl h-14">
                <TabsTrigger
                  value="login"
                  className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md font-black text-base transition-all"
                >
                  <User className="w-5 h-5 ml-2" />
                  دخول
                </TabsTrigger>
                <TabsTrigger
                  value="register"
                  className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md font-black text-base transition-all"
                >
                  <UserPlus className="w-5 h-5 ml-2" />
                  تسجيل
                </TabsTrigger>
              </TabsList>
            ) : (
              <div className="mb-6 flex items-center justify-between bg-orange-50 border border-orange-200/70 p-3 rounded-2xl">
                <div className="flex items-center gap-2 text-orange-900 font-black text-sm">
                  <KeyRound className="h-5 w-5 text-primary" />
                  <span>خطوات استعادة كلمة المرور</span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setActiveTab('login');
                    setError('');
                  }}
                  className="text-xs font-bold text-gray-600 hover:text-gray-900 h-8 px-2"
                >
                  العودة للدخول
                </Button>
              </div>
            )}

            {error && (
              <Alert variant="destructive" className="mb-6 rounded-xl border-2 animate-in fade-in duration-200">
                <AlertDescription className="font-bold">{error}</AlertDescription>
              </Alert>
            )}

            {/* تبويب تسجيل الدخول */}
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-id" className="font-bold text-sm text-gray-800">الاسم أو رقم الهاتف</Label>
                  <div className="relative">
                    <User className="absolute right-3.5 top-4 h-5 w-5 text-gray-400" />
                    <Input
                      id="login-id"
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      placeholder="أدخل اسمك أو رقم هاتفك"
                      required
                      className="pr-11 h-14 rounded-xl border-gray-200 focus-visible:ring-primary focus-visible:border-primary transition-all text-base"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="login-pass" className="font-bold text-sm text-gray-800">كلمة المرور</Label>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('forgot');
                        setForgotPhone(loginIdentifier.replace(/\D/g, '').length >= 9 ? loginIdentifier.trim() : '');
                        setForgotStep(1);
                        setError('');
                      }}
                      className="text-xs font-bold text-primary hover:underline transition-all"
                      data-testid="link-forgot-password"
                    >
                      هل نسيت كلمة المرور؟
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute right-3.5 top-4 h-5 w-5 text-gray-400" />
                    <Input
                      id="login-pass"
                      type={showLoginPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="أدخل كلمة المرور"
                      required
                      className="pr-11 pl-11 h-14 rounded-xl border-gray-200 focus-visible:ring-primary focus-visible:border-primary transition-all text-base"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute left-3.5 top-4 text-gray-400 hover:text-gray-600 focus:outline-none"
                    >
                      {showLoginPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-14 rounded-xl font-black text-xl mt-6 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all active:scale-95"
                  disabled={loading}
                  data-testid="button-submit-login"
                >
                  {loading ? (
                    <>
                      <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                      جاري تسجيل الدخول...
                    </>
                  ) : (
                    'تسجيل الدخول'
                  )}
                </Button>

                <div className="pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      continueAsGuest();
                      toast({
                        title: "أهلاً بك كزائر 👋",
                        description: "يمكنك تصفح جميع المنتجات والمتاجر بحرية.",
                      });
                      setLocation('/');
                    }}
                    className="w-full h-14 rounded-xl font-black text-lg border-2 hover:bg-gray-50 transition-all active:scale-95"
                    data-testid="button-guest-login"
                  >
                    الدخول كزائر
                  </Button>
                </div>
              </form>
            </TabsContent>

            {/* تبويب إنشاء حساب جديد */}
            <TabsContent value="register">
              {!showOtpStep ? (
                /* الخطوة 1: إدخال البيانات */
                <form onSubmit={handleStartRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reg-name" className="font-bold text-sm text-gray-800">الاسم بالكامل</Label>
                    <div className="relative">
                      <User className="absolute right-3.5 top-4 h-5 w-5 text-gray-400" />
                      <Input
                        id="reg-name"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="مثال: محمد علي"
                        required
                        className="pr-11 h-14 rounded-xl border-gray-200 focus-visible:ring-primary text-base"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reg-phone" className="font-bold text-sm text-gray-800">رقم الهاتف (الجمهورية اليمنية)</Label>
                    <div className="relative">
                      <Phone className="absolute right-3.5 top-4 h-5 w-5 text-gray-400" />
                      <Input
                        id="reg-phone"
                        type="tel"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="77XXXXXXX"
                        required
                        className="pr-11 h-14 rounded-xl border-gray-200 focus-visible:ring-primary text-left font-mono text-base"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reg-pass" className="font-bold text-sm text-gray-800">كلمة المرور</Label>
                    <div className="relative">
                      <Lock className="absolute right-3.5 top-4 h-5 w-5 text-gray-400" />
                      <Input
                        id="reg-pass"
                        type={showRegPassword ? 'text' : 'password'}
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="اختر كلمة مرور قوية"
                        required
                        className="pr-11 pl-11 h-14 rounded-xl border-gray-200 focus-visible:ring-primary text-base"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute left-3.5 top-4 text-gray-400 hover:text-gray-600 focus:outline-none"
                      >
                        {showRegPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-14 rounded-xl font-black text-xl mt-6 bg-[#ec3714] hover:bg-[#d02f0f] text-white shadow-lg shadow-orange-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        جاري إرسال رمز التحقق...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="h-6 w-6" />
                        إرسال رمز التحقق (OTP)
                      </>
                    )}
                  </Button>

                  <div className="pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        continueAsGuest();
                        toast({
                          title: "أهلاً بك كزائر 👋",
                          description: "يمكنك تصفح جميع المنتجات والمتاجر بحرية.",
                        });
                        setLocation('/');
                      }}
                      className="w-full h-14 rounded-xl font-black text-lg border-2 hover:bg-gray-50 transition-all active:scale-95"
                    >
                      الدخول كزائر
                    </Button>
                  </div>
                </form>
              ) : (
                /* الخطوة 2: إدخال رمز OTP لإنشاء الحساب */
                <form onSubmit={handleFinalRegister} className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center space-y-2">
                    <div className="flex items-center justify-center gap-2 font-black text-emerald-800 text-lg">
                      <ShieldCheck className="w-6 h-6 text-emerald-600" />
                      التحقق من رقم الهاتف
                    </div>
                    <p className="text-sm font-semibold text-emerald-700 dir-ltr font-mono">
                      +967 {regPhone}
                    </p>

                    {/* زر فتح الواتساب */}
                    {otpWhatsappUrl && (otpChannel === 'whatsapp' || otpChannel === 'both') && (
                      <div className="pt-2">
                        <Button
                          type="button"
                          onClick={() => handleWhatsApp(regPhone, `مرحباً بك في السريع ون 🛵\nكود التحقق هو: ${demoOtpCode || ''}`)}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl gap-2 h-11 shadow-sm"
                        >
                          <MessageCircle className="w-5 h-5 fill-white" />
                          فتح الواتساب لاستلام الكود
                        </Button>
                      </div>
                    )}

                    {demoOtpCode && (
                      <div className="mt-2 bg-white/90 border border-emerald-300 rounded-xl p-2 inline-flex items-center gap-2 text-xs font-bold text-emerald-900">
                        <KeyRound className="w-4 h-4 text-emerald-600" />
                        رمز التحقق: <span className="font-mono text-base font-black text-primary tracking-widest">{demoOtpCode}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="otp-box-0" className="font-bold text-sm block text-center text-gray-700">
                      أدخل رمز التحقق المكون من 4 أرقام:
                    </Label>

                    <div className="flex items-center justify-center gap-3 dir-ltr">
                      {[0, 1, 2, 3].map((index) => {
                        const digit = otpCode[index] || '';
                        return (
                          <input
                            key={index}
                            id={`otp-box-${index}`}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => {
                              const val = e.target.value.replace(/[^0-9]/g, '');
                              const currentOtp = otpCode.split('');
                              currentOtp[index] = val;
                              const newOtp = currentOtp.join('').slice(0, 4);
                              setOtpCode(newOtp);

                              if (val && index < 3) {
                                const nextInput = document.getElementById(`otp-box-${index + 1}`);
                                nextInput?.focus();
                              }
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
                                const prevInput = document.getElementById(`otp-box-${index - 1}`);
                                prevInput?.focus();
                              }
                            }}
                            className="w-14 h-16 rounded-2xl border-2 border-emerald-500 bg-emerald-50/30 text-center text-3xl font-black font-mono text-emerald-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/30 focus:bg-white shadow-sm transition-all"
                            autoFocus={index === 0}
                          />
                        );
                      })}
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-14 rounded-xl font-black text-xl bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        جاري التحقق وإنشاء الحساب...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-6 w-6" />
                        تأكيد وإنشاء الحساب
                      </>
                    )}
                  </Button>

                  <div className="flex items-center justify-between pt-2">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setShowOtpStep(false)}
                      className="text-sm font-bold text-gray-500 hover:text-gray-800"
                    >
                      تعديل رقم الهاتف
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      disabled={!canResend || loading}
                      onClick={handleResendOtp}
                      className="text-sm font-bold rounded-xl gap-1.5"
                    >
                      <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                      {canResend ? 'إعادة إرسال الرمز' : `إعادة الإرسال (${countdown}ث)`}
                    </Button>
                  </div>
                </form>
              )}
            </TabsContent>

            {/* تبويب استعادة كلمة المرور (FORGOT PASSWORD) */}
            <TabsContent value="forgot" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              {forgotStep === 1 ? (
                /* استعادة كلمة المرور - الخطوة 1: إدخال الهاتف */
                <form onSubmit={handleStartForgotPassword} className="space-y-4">
                  <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 text-right space-y-1.5">
                    <div className="flex items-center gap-2 font-black text-orange-900 text-sm">
                      <HelpCircle className="w-5 h-5 text-primary shrink-0" />
                      <span>استرجاع الوصول إلى حسابك</span>
                    </div>
                    <p className="text-xs text-orange-800 leading-relaxed font-medium">
                      أدخل رقم الهاتف المسجل في حسابك وسنرسل لك رمز تحقق (OTP) لتتمكن من تعيين كلمة مرور جديدة فوراً وبأمان.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="forgot-phone" className="font-bold text-sm text-gray-800">
                      رقم الهاتف المسجل
                    </Label>
                    <div className="relative">
                      <Phone className="absolute right-3.5 top-4 h-5 w-5 text-gray-400" />
                      <Input
                        id="forgot-phone"
                        type="tel"
                        value={forgotPhone}
                        onChange={(e) => setForgotPhone(e.target.value)}
                        placeholder="77XXXXXXX"
                        required
                        className="pr-11 h-14 rounded-xl border-gray-200 focus-visible:ring-primary text-left font-mono text-base"
                        dir="ltr"
                        autoFocus
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-14 rounded-xl font-black text-xl mt-4 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                    disabled={loading}
                    data-testid="button-forgot-send-otp"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        جاري إرسال رمز الاستعادة...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="h-6 w-6" />
                        إرسال رمز التحقق
                      </>
                    )}
                  </Button>

                  <div className="pt-3 text-center">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        setActiveTab('login');
                        setError('');
                      }}
                      className="text-sm font-black text-gray-600 hover:text-gray-900"
                    >
                      تذكرت كلمة المرور؟ <span className="text-primary mr-1 underline">تسجيل الدخول</span>
                    </Button>
                  </div>
                </form>
              ) : (
                /* استعادة كلمة المرور - الخطوة 2: إدخال OTP وكلمة المرور الجديدة */
                <form onSubmit={handleFinalResetPassword} className="space-y-4 animate-in fade-in duration-300">
                  <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 text-center space-y-2">
                    <div className="flex items-center justify-center gap-2 font-black text-orange-950 text-base">
                      <ShieldCheck className="w-5 h-5 text-primary" />
                      تم إرسال رمز الاستعادة
                    </div>
                    <p className="text-xs font-bold text-orange-800 dir-ltr font-mono">
                      +967 {forgotPhone}
                    </p>

                    {/* زر فتح الواتساب */}
                    {forgotOtpWhatsappUrl && (forgotOtpChannel === 'whatsapp' || forgotOtpChannel === 'both') && (
                      <div className="pt-1">
                        <Button
                          type="button"
                          onClick={() => handleWhatsApp(forgotPhone, `مرحباً بك في السريع ون 🔐\nرمز استعادة كلمة المرور هو: ${forgotDemoOtpCode || ''}`)}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl gap-2 h-10 text-xs shadow-sm"
                        >
                          <MessageCircle className="w-4 h-4 fill-white" />
                          فتح الواتساب لاستلام الكود
                        </Button>
                      </div>
                    )}

                    {forgotDemoOtpCode && (
                      <div className="mt-1 bg-white/95 border border-orange-300 rounded-xl p-2 inline-flex items-center gap-2 text-xs font-bold text-orange-950">
                        <KeyRound className="w-4 h-4 text-primary" />
                        رمز التحقق: <span className="font-mono text-base font-black text-primary tracking-widest">{forgotDemoOtpCode}</span>
                      </div>
                    )}
                  </div>

                  {/* خانات إدخال كود OTP */}
                  <div className="space-y-2">
                    <Label className="font-bold text-xs block text-center text-gray-700">
                      أدخل رمز التحقق (4 أرقام):
                    </Label>
                    <div className="flex items-center justify-center gap-2.5 dir-ltr">
                      {[0, 1, 2, 3].map((index) => {
                        const digit = forgotOtpCode[index] || '';
                        return (
                          <input
                            key={index}
                            id={`forgot-otp-box-${index}`}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => {
                              const val = e.target.value.replace(/[^0-9]/g, '');
                              const currentOtp = forgotOtpCode.split('');
                              currentOtp[index] = val;
                              const newOtp = currentOtp.join('').slice(0, 4);
                              setForgotOtpCode(newOtp);

                              if (val && index < 3) {
                                const nextInput = document.getElementById(`forgot-otp-box-${index + 1}`);
                                nextInput?.focus();
                              }
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Backspace' && !forgotOtpCode[index] && index > 0) {
                                const prevInput = document.getElementById(`forgot-otp-box-${index - 1}`);
                                prevInput?.focus();
                              }
                            }}
                            className="w-12 h-14 rounded-xl border-2 border-orange-400 bg-orange-50/20 text-center text-2xl font-black font-mono text-gray-900 focus:outline-none focus:ring-4 focus:ring-orange-500/20 focus:bg-white transition-all shadow-sm"
                            autoFocus={index === 0}
                          />
                        );
                      })}
                    </div>
                  </div>

                  {/* كلمة المرور الجديدة */}
                  <div className="space-y-2">
                    <Label htmlFor="forgot-new-pass" className="font-bold text-xs text-gray-800">
                      كلمة المرور الجديدة
                    </Label>
                    <div className="relative">
                      <Lock className="absolute right-3 top-3.5 h-4 w-4 text-gray-400" />
                      <Input
                        id="forgot-new-pass"
                        type={showForgotNewPassword ? 'text' : 'password'}
                        value={forgotNewPassword}
                        onChange={(e) => setForgotNewPassword(e.target.value)}
                        placeholder="أدخل كلمة مرور جديدة"
                        required
                        className="pr-10 pl-10 h-12 rounded-xl border-gray-200 focus-visible:ring-primary text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowForgotNewPassword(!showForgotNewPassword)}
                        className="absolute left-3 top-3.5 text-gray-400 hover:text-gray-600 focus:outline-none"
                      >
                        {showForgotNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* تأكيد كلمة المرور الجديدة */}
                  <div className="space-y-2">
                    <Label htmlFor="forgot-confirm-pass" className="font-bold text-xs text-gray-800">
                      تأكيد كلمة المرور الجديدة
                    </Label>
                    <div className="relative">
                      <Lock className="absolute right-3 top-3.5 h-4 w-4 text-gray-400" />
                      <Input
                        id="forgot-confirm-pass"
                        type={showForgotConfirmPassword ? 'text' : 'password'}
                        value={forgotConfirmPassword}
                        onChange={(e) => setForgotConfirmPassword(e.target.value)}
                        placeholder="أعد إدخال كلمة المرور للتأكيد"
                        required
                        className="pr-10 pl-10 h-12 rounded-xl border-gray-200 focus-visible:ring-primary text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowForgotConfirmPassword(!showForgotConfirmPassword)}
                        className="absolute left-3 top-3.5 text-gray-400 hover:text-gray-600 focus:outline-none"
                      >
                        {showForgotConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-13 rounded-xl font-black text-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20 transition-all active:scale-95 flex items-center justify-center gap-2 mt-4"
                    disabled={loading}
                    data-testid="button-forgot-submit-reset"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        جاري حفظ كلمة المرور...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-5 w-5" />
                        حفظ كلمة المرور والدخول
                      </>
                    )}
                  </Button>

                  <div className="flex items-center justify-between pt-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setForgotStep(1)}
                      className="text-xs font-bold text-gray-500 hover:text-gray-800"
                    >
                      تغيير رقم الهاتف
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={!forgotCanResend || loading}
                      onClick={handleResendForgotOtp}
                      className="text-xs font-bold rounded-lg gap-1.5 h-9"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                      {forgotCanResend ? 'إعادة الإرسال' : `إعادة الإرسال (${forgotCountdown}ث)`}
                    </Button>
                  </div>
                </form>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <p className="mt-8 text-sm text-muted-foreground max-w-xs text-center">
        بتسجيلك في السريع ون، أنت توافق على شروط الخدمة وسياسة الخصوصية الخاصة بنا.
      </p>
    </div>
  );
}
