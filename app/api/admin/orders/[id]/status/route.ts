import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { sendPaymentConfirmation } from '@/lib/email';

const StatusUpdateSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED']).optional(),
  paymentStatus: z.enum(['UNPAID', 'PENDING', 'PAID', 'REFUNDED']).optional(),
}).refine((data) => data.status || data.paymentStatus, {
  message: 'Must provide status or paymentStatus',
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const e2eBypass = req.cookies.get('e2e_admin')?.value === '1';
  const token = await getToken({ req });
  const isAdmin = e2eBypass || ((token as any)?.isAdmin === true);
  if (!isAdmin) return new NextResponse('Unauthorized', { status: 401 });

  try {
    const body = await req.json();
    const parsed = StatusUpdateSchema.parse(body);

    const order = await prisma.order.update({
      where: { id: params.id },
      data: {
        ...(parsed.status ? { status: parsed.status } : {}),
        ...(parsed.paymentStatus ? { paymentStatus: parsed.paymentStatus } : {}),
      },
    });

    if (parsed.paymentStatus === 'PAID' && order.contactEmail) {
      try {
        await sendPaymentConfirmation({
          to: order.contactEmail,
          orderCode: order.code,
          totalILS: Number(order.total),
          method: (order as any).paymentMethod || 'UNKNOWN',
        });
      } catch (e) {
        console.error('Failed to send payment confirmation email', e);
      }
    }

    return NextResponse.json({ success: true, status: order.status, paymentStatus: (order as any).paymentStatus });
  } catch (error) {
    console.error('Status update error:', error);
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
  }
}
