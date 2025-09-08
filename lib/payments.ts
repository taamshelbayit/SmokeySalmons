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
