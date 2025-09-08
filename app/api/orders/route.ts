import { NextRequest, NextResponse } from 'next/server';
import { OrderInput } from '@/lib/validation';
import { prisma } from '@/lib/prisma';
import { priceItems, subtotal as calcSubtotal } from '@/lib/pricing';
import { generateOrderCode } from '@/lib/order';
import { sendOrderConfirmation, sendAdminNewOrder } from '@/lib/email';
import { ADMIN_EMAIL } from '@/lib/config';
import { logServerEvent } from '@/lib/analytics';

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = OrderInput.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const data = parsed.data;

    // Price items
    const priced = priceItems(data.items.map(i => ({ key: i.key, flavor: i.flavor, qty: i.qty })));
    const sub = calcSubtotal(priced);

    // Map to products
    const products = await prisma.product.findMany({ where: { slug: { in: Array.from(new Set(priced.map(p => p.key))) } } });
    const flavors = await prisma.flavor.findMany({ where: { name: { in: Array.from(new Set(priced.map(p => p.flavor).filter(Boolean) as string[])) } } });
    const productBySlug: Record<string, { id: string }> = Object.fromEntries(products.map((p: { slug: string; id: string }) => [p.slug, p] as const));
    const flavorByName: Record<string, { id: string }> = Object.fromEntries(flavors.map((f: { name: string; id: string }) => [f.name, f] as const));

    const code = generateOrderCode();

    const order = await prisma.order.create({
      data: {
        code,
        method: data.method,
        subtotal: sub.toFixed(2),
        total: sub.toFixed(2),
        contactName: data.name,
        contactPhone: data.phone,
        contactEmail: data.email || null,
        city: data.city || null,
        street: data.street || null,
        apt: data.apt || null,
        deliveryNotes: data.notes || null,
        deliverySlot: data.deliverySlot || null,
        items: {
          create: priced.map(pi => ({
            productId: productBySlug[pi.key]?.id,
            flavorId: pi.flavor ? flavorByName[pi.flavor]?.id : null,
            quantity: pi.qty,
            unitPrice: pi.unitPrice.toFixed(2),
            meta: null,
          }))
        }
      },
      include: { items: { include: { product: true, flavor: true } } }
    });

    // Send confirmation email if provided
    const summary = order.items
      .map((i: { product: { name: string }; flavor: { name: string } | null; quantity: number }) => `${i.product.name}${i.flavor ? ` (${i.flavor.name})` : ''} × ${i.quantity}`)
      .join('\n');
    if (order.contactEmail) {
      await sendOrderConfirmation({ to: order.contactEmail, orderCode: order.code, summary });
    }

    // Admin alert
    if (ADMIN_EMAIL) {
      await sendAdminNewOrder({ to: ADMIN_EMAIL, orderCode: order.code, customer: order.contactName, phone: order.contactPhone, summary });
    }

    // Server analytics
    logServerEvent({ name: 'order_placed', order: { id: order.id, code: order.code, total: Number(order.total), items: order.items.length } });

    return NextResponse.json({ id: order.id, code: order.code });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
