import { NextRequest, NextResponse } from 'next/server';
import { OrderInput } from '@/lib/validation';
import { prisma } from '@/lib/prisma';
import { priceItems, subtotal as calcSubtotal } from '@/lib/pricing';
import { generateOrderCode } from '@/lib/order';
import { sendOrderConfirmation, sendAdminNewOrder } from '@/lib/email';
import { ADMIN_EMAIL, BIT_PHONE, PAYBOX_PHONE, PAYMENT_TIMEOUT_MINUTES } from '@/lib/config';
import { logServerEvent } from '@/lib/analytics';
// Using string literals for payment types (SQLite does not support enums)

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = OrderInput.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const data = parsed.data as any;

    // Price items
    const priced = priceItems((data.items as Array<{ key: string; flavor?: string; qty: number }>).map((i) => ({ key: i.key, flavor: i.flavor, qty: i.qty })));
    const sub = calcSubtotal(priced);

    // Map to products
    const products = await prisma.product.findMany({ where: { slug: { in: Array.from(new Set(priced.map(p => p.key))) } } });
    const flavors = await prisma.flavor.findMany({ where: { name: { in: Array.from(new Set(priced.map(p => p.flavor).filter(Boolean) as string[])) } } });
    const productBySlug: Record<string, { id: string }> = Object.fromEntries(products.map((p: { slug: string; id: string }) => [p.slug, p] as const));
    const flavorByName: Record<string, { id: string }> = Object.fromEntries(flavors.map((f: { name: string; id: string }) => [f.name, f] as const));

    const code = generateOrderCode();

    // Delivery fee rules
    const cityLower = (data.city || '').trim().toLowerCase();
    const isYadBinyamin = cityLower === 'yad binyamin';
    const isDelivery = data.method === 'DELIVERY';
    const deliveryFee = isDelivery && isYadBinyamin ? 20 : 0;
    
    // Debug logging
    console.log('Delivery fee calculation:', {
      method: data.method,
      city: data.city,
      cityLower,
      isDelivery,
      isYadBinyamin,
      deliveryFee
    });

    // Payment status and expiry
    const paymentMethod = (data.paymentMethod as 'BIT' | 'PAYBOX' | 'CASH');
    const paymentStatus: 'UNPAID' | 'PENDING' | 'PAID' | 'REFUNDED' = paymentMethod === 'CASH' ? 'UNPAID' : 'PENDING';
    const now = new Date();
    const paymentExpiresAt = (paymentMethod === 'BIT' || paymentMethod === 'PAYBOX')
      ? new Date(now.getTime() + PAYMENT_TIMEOUT_MINUTES * 60 * 1000)
      : null;

    const order = await prisma.order.create({
      data: {
        code,
        status: 'PENDING',
        method: data.method,
        subtotal: sub.toFixed(2),
        discount: '0',
        total: (sub + deliveryFee).toFixed(2),
        deliveryFee: deliveryFee.toFixed(2),
        contactName: data.name,
        contactPhone: data.phone,
        contactEmail: data.email || null,
        city: data.city || null,
        street: data.street || null,
        apt: data.apt || null,
        deliveryNotes: data.notes || null,
        deliverySlot: data.deliverySlot || null,
        paymentMethod,
        paymentStatus,
        paymentExpiresAt,
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
    const summaryLines = order.items
      .map((i: { product: { name: string }; flavor: { name: string } | null; quantity: number }) => `${i.product.name}${i.flavor ? ` (${i.flavor.name})` : ''} × ${i.quantity}`);
    const summary = [
      ...summaryLines,
      `Subtotal: ₪${Number(order.subtotal).toFixed(2)}`,
      ...(Number(order.deliveryFee) > 0 ? [`Delivery fee: ₪${Number(order.deliveryFee).toFixed(2)}`] : []),
      `Total: ₪${Number(order.total).toFixed(2)}`,
    ].join('\n');

    const paymentLines: string[] = [`Payment method: ${order.paymentMethod}`];
    if (order.paymentMethod === 'BIT' && BIT_PHONE) {
      paymentLines.push(`Send ₪${Number(order.total).toFixed(2)} via Bit to ${BIT_PHONE}`);
      paymentLines.push(`Memo: Order ${order.code}`);
      if (order.paymentExpiresAt) paymentLines.push(`Pay by: ${new Date(order.paymentExpiresAt).toLocaleString()}`);
    } else if (order.paymentMethod === 'PAYBOX' && PAYBOX_PHONE) {
      paymentLines.push(`Send ₪${Number(order.total).toFixed(2)} via PayBox to ${PAYBOX_PHONE}`);
      paymentLines.push(`Memo: Order ${order.code}`);
      if (order.paymentExpiresAt) paymentLines.push(`Pay by: ${new Date(order.paymentExpiresAt).toLocaleString()}`);
    } else if (order.paymentMethod === 'CASH') {
      paymentLines.push('Pay cash on delivery.');
    }

    if (order.contactEmail) {
      await sendOrderConfirmation({ to: order.contactEmail, orderCode: order.code, summary: `${summary}\n\n${paymentLines.join('\n')}` });
    }

    // Admin alert
    if (ADMIN_EMAIL) {
      await sendAdminNewOrder({ to: ADMIN_EMAIL, orderCode: order.code, customer: order.contactName, phone: order.contactPhone, summary: summaryLines.join('\n') });
    }

    // Server analytics
    logServerEvent({ name: 'order_placed', order: { id: order.id, code: order.code, total: Number(order.total), items: order.items.length } });

    return NextResponse.json({ id: order.id, code: order.code });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
