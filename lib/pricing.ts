type LineItemInput = { key: string; flavor?: string; qty: number };
type Promotion = { id: string; code: string; type: 'PERCENTAGE' | 'FIXED'; value: number; minOrder?: number; active: boolean };

const PRICE_MAP: Record<string, number> = {
  whole: 240,
  half: 130,
  quarter: 75,
  taster: 85,
};

export function priceItems(items: LineItemInput[]) {
  return items.map((i) => {
    const unit = PRICE_MAP[i.key];
    if (!unit) throw new Error(`Unknown product key: ${i.key}`);
    return { ...i, unitPrice: unit };
  });
}

export function subtotal(items: { qty: number; unitPrice: number }[]) {
  return items.reduce((s, i) => s + i.qty * i.unitPrice, 0);
}

export function applyPromotion(subtotal: number, promotion?: Promotion): { discount: number; total: number } {
  if (!promotion || !promotion.active) {
    return { discount: 0, total: subtotal };
  }

  if (promotion.minOrder && subtotal < promotion.minOrder) {
    return { discount: 0, total: subtotal };
  }

  let discount = 0;
  if (promotion.type === 'PERCENTAGE') {
    discount = Math.round(subtotal * (promotion.value / 100));
  } else if (promotion.type === 'FIXED') {
    discount = Math.min(promotion.value, subtotal);
  }

  return { discount, total: Math.max(0, subtotal - discount) };
}

export function calculateOrderTotal(items: LineItemInput[], promotionCode?: string, promotions: Promotion[] = []): { subtotal: number; discount: number; total: number; promotion?: Promotion } {
  const priced = priceItems(items);
  const sub = subtotal(priced);
  
  const promotion = promotionCode ? promotions.find(p => p.code.toLowerCase() === promotionCode.toLowerCase()) : undefined;
  const { discount, total } = applyPromotion(sub, promotion);
  
  return { subtotal: sub, discount, total, promotion };
}
