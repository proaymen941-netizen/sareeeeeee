import React, { createContext, useContext, useState, useEffect } from 'react';

// نوع المستخدم الموحد
export interface AuthUser {
  id: string;
  name: string;
  username?: string;
  email?: string;
  phone?: string;
  address?: string;
  userType: 'customer' | 'driver' | 'admin';
  isActive: boolean;
}

// حالة المصادقة
interface AuthState {
  isAuthenticated: boolean;
  isGuest: boolean;
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  authModalOpen: boolean;
  authModalAction: string;
}

// نوع السياق
interface AuthContextType extends AuthState {
  login: (identifier: string, password: string, userType?: 'customer' | 'driver' | 'admin') => Promise<{ success: boolean; message: string }>;
  register: (userData: any) => Promise<{ success: boolean; message: string }>;
  sendOtp: (phone: string, purpose?: string) => Promise<{
    success: boolean;
    message: string;
    otpCode?: string;
    channel?: string;
    whatsappUrl?: string;
    whatsappSender?: string;
    disabled?: boolean;
  }>;
  verifyOtp: (phone: string, code: string) => Promise<{ success: boolean; message: string }>;
  resetPassword: (phone: string, otpCode: string, newPassword: string) => Promise<{ success: boolean; message: string; user?: AuthUser; token?: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  continueAsGuest: () => void;
  exitGuestMode: () => void;
  openAuthModal: (actionName?: string) => void;
  closeAuthModal: () => void;
  requireAuth: (actionName?: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>(() => ({
    isAuthenticated: false,
    isGuest: typeof window !== 'undefined' ? localStorage.getItem('is_guest') === 'true' : false,
    user: null,
    token: null,
    loading: true,
    authModalOpen: false,
    authModalAction: '',
  }));

  // التحقق من الجلسة المحفوظة عند بدء التطبيق
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (token) {
        await validateToken(token);
      } else {
        const isGuestSaved = localStorage.getItem('is_guest') === 'true';
        setAuthState(prev => ({ 
          ...prev, 
          loading: false,
          isGuest: isGuestSaved,
        }));
      }
    } catch (error) {
      console.error('خطأ في تهيئة المصادقة:', error);
      clearAuthState();
    }
  };

  const validateToken = async (token: string) => {
    try {
      const response = await fetch('/api/auth/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        // حفظ رقم الهاتف في localStorage لاستخدامه في صفحة الطلبات والإشعارات
        if (userData.user?.phone) {
          localStorage.setItem('customer_phone', userData.user.phone);
        }
        localStorage.removeItem('is_guest');
        setAuthState(prev => ({
          ...prev,
          isAuthenticated: true,
          isGuest: false,
          user: userData.user,
          token: token,
          loading: false,
        }));
      } else {
        clearAuthState();
      }
    } catch (error) {
      console.error('خطأ في التحقق من الرمز:', error);
      clearAuthState();
    }
  };

  const clearAuthState = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('customer_phone');
    const isGuestSaved = localStorage.getItem('is_guest') === 'true';
    setAuthState(prev => ({
      ...prev,
      isAuthenticated: false,
      isGuest: isGuestSaved,
      user: null,
      token: null,
      loading: false,
    }));
  };

  const continueAsGuest = () => {
    localStorage.setItem('is_guest', 'true');
    setAuthState(prev => ({
      ...prev,
      isGuest: true,
      isAuthenticated: false,
      authModalOpen: false,
    }));
  };

  const exitGuestMode = () => {
    localStorage.removeItem('is_guest');
    setAuthState(prev => ({
      ...prev,
      isGuest: false,
    }));
  };

  const openAuthModal = (actionName?: string) => {
    setAuthState(prev => ({
      ...prev,
      authModalOpen: true,
      authModalAction: actionName || 'المتابعة',
    }));
  };

  const closeAuthModal = () => {
    setAuthState(prev => ({
      ...prev,
      authModalOpen: false,
      authModalAction: '',
    }));
  };

  const requireAuth = (actionName?: string): boolean => {
    if (authState.isAuthenticated && authState.user) {
      return true;
    }
    openAuthModal(actionName);
    return false;
  };

  const login = async (
    identifier: string, 
    password: string, 
    userType?: 'customer' | 'driver' | 'admin'
  ): Promise<{ success: boolean; message: string }> => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }));

      let endpoint = '/api/auth/login';
      let body: any = { identifier, password };

      if (userType === 'admin') {
        endpoint = '/api/auth/admin/login';
        body = { email: identifier, password };
      } else if (userType === 'driver') {
        endpoint = '/api/auth/driver/login';
        body = { phone: identifier, password };
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        localStorage.setItem('auth_token', result.token);
        localStorage.removeItem('is_guest');
        // حفظ رقم الهاتف لاستخدامه في جلب الطلبات والإشعارات
        if (result.user?.phone) {
          localStorage.setItem('customer_phone', result.user.phone);
        }
        setAuthState(prev => ({
          ...prev,
          isAuthenticated: true,
          isGuest: false,
          user: result.user,
          token: result.token,
          loading: false,
          authModalOpen: false,
        }));
        return { success: true, message: result.message || 'تم تسجيل الدخول بنجاح' };
      } else {
        setAuthState(prev => ({ ...prev, loading: false }));
        return { success: false, message: result.message || 'فشل في تسجيل الدخول' };
      }
    } catch (error) {
      console.error('خطأ في تسجيل الدخول:', error);
      setAuthState(prev => ({ ...prev, loading: false }));
      return { success: false, message: 'حدث خطأ غير متوقع' };
    }
  };

  const register = async (userData: any): Promise<{ success: boolean; message: string }> => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }));

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        localStorage.setItem('auth_token', result.token);
        localStorage.removeItem('is_guest');
        // حفظ رقم الهاتف لاستخدامه في جلب الطلبات والإشعارات
        if (result.user?.phone) {
          localStorage.setItem('customer_phone', result.user.phone);
        }
        setAuthState(prev => ({
          ...prev,
          isAuthenticated: true,
          isGuest: false,
          user: result.user,
          token: result.token,
          loading: false,
          authModalOpen: false,
        }));
        return { success: true, message: result.message || 'تم إنشاء الحساب بنجاح' };
      } else {
        setAuthState(prev => ({ ...prev, loading: false }));
        return { success: false, message: result.message || 'فشل في إنشاء الحساب' };
      }
    } catch (error) {
      console.error('خطأ في التسجيل:', error);
      setAuthState(prev => ({ ...prev, loading: false }));
      return { success: false, message: 'حدث خطأ غير متوقع' };
    }
  };

  const sendOtp = async (phone: string, purpose: string = 'register') => {
    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, purpose }),
      });
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('خطأ في إرسال رمز التحقق:', error);
      return { success: false, message: 'تعذر الاتصال بالخادم لإرسال رمز التحقق' };
    }
  };

  const verifyOtp = async (phone: string, code: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code }),
      });
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('خطأ في التحقق من الرمز:', error);
      return { success: false, message: 'تعذر الاتصال بالخادم للتحقق من الرمز' };
    }
  };

  const resetPassword = async (
    phone: string,
    otpCode: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string; user?: AuthUser; token?: string }> => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }));

      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, otpCode, newPassword }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        if (result.token) {
          localStorage.setItem('auth_token', result.token);
          localStorage.removeItem('is_guest');
          if (result.user?.phone) {
            localStorage.setItem('customer_phone', result.user.phone);
          }
          setAuthState(prev => ({
            ...prev,
            isAuthenticated: true,
            isGuest: false,
            user: result.user,
            token: result.token,
            loading: false,
            authModalOpen: false,
          }));
        } else {
          setAuthState(prev => ({ ...prev, loading: false }));
        }
        return { success: true, message: result.message || 'تم تغيير كلمة المرور بنجاح', user: result.user, token: result.token };
      } else {
        setAuthState(prev => ({ ...prev, loading: false }));
        return { success: false, message: result.message || 'فشل في تغيير كلمة المرور' };
      }
    } catch (error) {
      console.error('خطأ في استعادة كلمة المرور:', error);
      setAuthState(prev => ({ ...prev, loading: false }));
      return { success: false, message: 'حدث خطأ غير متوقع أثناء الاتصال بالخادم' };
    }
  };

  const logout = async () => {
    try {
      const token = authState.token;
      if (token) {
        // إشعار الخادم بتسجيل الخروج
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error('خطأ في تسجيل الخروج:', error);
    } finally {
      clearAuthState();
    }
  };

  const refreshUser = async () => {
    if (authState.token) {
      await validateToken(authState.token);
    }
  };

  const value: AuthContextType = {
    ...authState,
    login,
    register,
    sendOtp,
    verifyOtp,
    resetPassword,
    logout,
    refreshUser,
    continueAsGuest,
    exitGuestMode,
    openAuthModal,
    closeAuthModal,
    requireAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};