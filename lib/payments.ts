export type ChargeResult = {
  ok: boolean;
  provider: 'manual';
  id?: string;
  message?: string;
};

export interface PaymentProvider {
  charge(_: { amount: number; currency: string; description: string }): Promise<ChargeResult>;
}

export class ManualPaymentProvider implements PaymentProvider {
  async charge(_: { amount: number; currency: string; description: string }): Promise<ChargeResult> {
    // Pay on delivery: nothing to do
    return { ok: true, provider: 'manual', message: 'Pay on delivery' };
  }
}

// Payment deep links and QR code generation
export function generateBitDeepLink(phone: string, amount: number, memo: string): string {
  // Bit app deep link format
  const encodedMemo = encodeURIComponent(memo);
  return `bit://pay?phone=${phone}&amount=${amount}&memo=${encodedMemo}`;
}

export function generatePayBoxDeepLink(phone: string, amount: number, memo: string): string {
  // PayBox app deep link format (similar to Bit)
  const encodedMemo = encodeURIComponent(memo);
  return `paybox://pay?phone=${phone}&amount=${amount}&memo=${encodedMemo}`;
}

export function generateQRCodeUrl(text: string): string {
  // Using QR Server API for QR code generation
  const encodedText = encodeURIComponent(text);
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodedText}`;
}

export function formatPhoneForPayment(phone: string): string {
  // Remove any non-digit characters and ensure proper format
  const cleaned = phone.replace(/\D/g, '');
  // If it starts with 0, replace with +972
  if (cleaned.startsWith('0')) {
    return `+972${cleaned.slice(1)}`;
  }
  // If it doesn't start with +, assume it's Israeli and add +972
  if (!cleaned.startsWith('972')) {
    return `+972${cleaned}`;
  }
  return `+${cleaned}`;
}
