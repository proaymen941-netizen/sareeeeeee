/**
 * دوال مساعدة موحدة وموثوقة للتعامل مع روابط الواتساب والاتصال الهاتفي
 * تمنع خطأ ERR_UNKNOWN_URL_SCHEME في تطبيقات الويب وتطبيقات WebView على الأندرويد
 */

export function cleanPhoneNumber(raw: string | undefined | null): string {
  if (!raw) return '';
  let cleaned = String(raw).trim();
  // إزالة سابقة tel: إن وجدت
  cleaned = cleaned.replace(/^tel:/i, '').trim();
  // إذا كان رابط واتساب، استخراج الأرقام فقط
  if (cleaned.includes('wa.me/')) {
    cleaned = cleaned.split('wa.me/')[1]?.split('?')[0] || cleaned;
  }
  // إزالة الرموز غير المطلوبة مع الحفاظ على + والأرقام
  cleaned = cleaned.replace(/[^\d+]/g, '');
  return cleaned;
}

export function formatDisplayPhone(raw: string | undefined | null): string {
  const cleaned = cleanPhoneNumber(raw);
  if (!cleaned) return '';
  if (cleaned.startsWith('+')) return cleaned;
  return `+${cleaned}`;
}

export function cleanWhatsAppUrl(raw: string | undefined | null, message?: string): string {
  if (!raw) return '';
  let input = String(raw).trim();

  // إذا كان رابط واتساب مباشر بالفعل
  if (input.startsWith('https://wa.me/') || input.startsWith('http://wa.me/')) {
    if (message && !input.includes('text=')) {
      const separator = input.includes('?') ? '&' : '?';
      return `${input}${separator}text=${encodeURIComponent(message)}`;
    }
    return input;
  }

  if (input.startsWith('https://api.whatsapp.com') || input.startsWith('http://api.whatsapp.com')) {
    if (message && !input.includes('text=')) {
      const separator = input.includes('?') ? '&' : '?';
      return `${input}${separator}text=${encodeURIComponent(message)}`;
    }
    return input;
  }

  // استخراج الأرقام فقط
  let digits = input.replace(/\D/g, '');

  if (digits.startsWith('00')) {
    digits = digits.substring(2);
  }

  // إذا كان الرقم 9 أرقام يبدأ بـ 7 (اليمن) مثلاً
  if (digits.length === 9 && (digits.startsWith('7') || digits.startsWith('1'))) {
    digits = '967' + digits;
  } else if (digits.length === 10 && digits.startsWith('07')) {
    digits = '967' + digits.substring(1);
  }

  const encodedMsg = message ? `?text=${encodeURIComponent(message)}` : '';
  return `https://wa.me/${digits}${encodedMsg}`;
}

export function handlePhoneCall(rawPhone: string | undefined | null): void {
  const phone = cleanPhoneNumber(rawPhone);
  if (!phone) return;

  const telUrl = `tel:${phone}`;

  try {
    // نستخدم إنشاء عنصر <a> في DOM والنقر عليه
    // هذه الطريقة متوافقة تماماً مع Android WebView و iOS وتمنع خطأ net::ERR_UNKNOWN_URL_SCHEME
    const link = document.createElement('a');
    link.href = telUrl;
    link.setAttribute('rel', 'noopener noreferrer');
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      try {
        if (link.parentNode) {
          document.body.removeChild(link);
        }
      } catch (e) {
        // تجاهل
      }
    }, 400);
  } catch (err) {
    console.error('Error initiating phone call:', err);
    window.location.href = telUrl;
  }
}

export function handleWhatsApp(rawWhatsapp: string | undefined | null, message?: string): void {
  const url = cleanWhatsAppUrl(rawWhatsapp, message);
  if (!url) return;

  try {
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      try {
        if (link.parentNode) {
          document.body.removeChild(link);
        }
      } catch (e) {
        // تجاهل
      }
    }, 400);
  } catch (err) {
    console.error('Error opening WhatsApp:', err);
    window.open(url, '_blank');
  }
}
