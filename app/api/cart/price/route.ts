import { NextRequest, NextResponse } from 'next/server';
import { priceItems, subtotal } from '@/lib/pricing';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const items = Array.isArray(body?.items) ? body.items : [];
    const priced = priceItems(items);
    const sub = subtotal(priced);
    // Placeholder promos/discounts
    const discount = 0;
    const total = sub - discount;
    return NextResponse.json({ items: priced, subtotal: sub, discount, total });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }
}
