import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { applyPromotion } from '@/lib/pricing';
import { z } from 'zod';

const ValidateSchema = z.object({
  code: z.string().min(1),
  subtotal: z.number().positive(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, subtotal } = ValidateSchema.parse(body);

    const promos = await prisma.promotion.findMany({
      where: {
        active: true,
        OR: [
          { endsAt: null },
          { endsAt: { gte: new Date() } }
        ]
      }
    });
    const promotion = promos.find(p => p.code.toLowerCase() === code.toLowerCase());

    if (!promotion) {
      return NextResponse.json({ valid: false, message: 'Invalid or expired promotion code' });
    }

    const promotionData = {
      id: promotion.id,
      code: promotion.code,
      type: promotion.type as 'PERCENTAGE' | 'FIXED',
      value: Number(promotion.value),
      active: promotion.active,
    };

    const { discount, total } = applyPromotion(subtotal, promotionData);

    return NextResponse.json({ 
      valid: true, 
      discount, 
      total,
      promotion: promotionData 
    });
  } catch (error) {
    console.error('Promotion validation error:', error);
    return NextResponse.json({ valid: false, message: 'Failed to validate promotion' }, { status: 500 });
  }
}
