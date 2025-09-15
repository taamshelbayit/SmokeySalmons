export const BRAND_NAME = process.env.BRAND_NAME || 'Smokey Salmons';
export const BRAND_SLOGAN = process.env.BRAND_SLOGAN || 'Slow-smoked. Shabbat-ready.';
export const TIMEZONE = process.env.TIMEZONE || 'Asia/Jerusalem';
export const ORDER_CUTOFF_CRON = process.env.ORDER_CUTOFF_CRON || '0 10 * * 4';
export const AVG_FISH_WEIGHT_GRAMS = Number(process.env.AVG_FISH_WEIGHT_GRAMS || '2000');
export const TASTER_PORTION_GRAMS = Number(process.env.TASTER_PORTION_GRAMS || '120');

export const EMAIL_FROM = process.env.EMAIL_FROM || 'orders@localhost';
export const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || '';

export const BIT_PHONE = process.env.BIT_PHONE || '';
export const PAYBOX_PHONE = process.env.PAYBOX_PHONE || '';
export const NEXT_PUBLIC_BIT_PHONE = process.env.NEXT_PUBLIC_BIT_PHONE || '';
export const NEXT_PUBLIC_PAYBOX_PHONE = process.env.NEXT_PUBLIC_PAYBOX_PHONE || '';
export const PAYMENT_TIMEOUT_MINUTES = Number(process.env.PAYMENT_TIMEOUT_MINUTES || '60');

export const IS_DEV = process.env.NODE_ENV !== 'production';
