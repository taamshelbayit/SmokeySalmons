import { z } from 'zod';

export const OrderItemInput = z.object({
  key: z.string(), // whole | half | quarter | taster
  name: z.string(),
  flavor: z.string().optional(),
  qty: z.number().int().positive(),
});

export const OrderInput = z.object({
  name: z.string().min(2),
  phone: z.string().min(5),
  email: z.string().email(),
  city: z.string().optional(),
  street: z.string().optional(),
  apt: z.string().optional(),
  notes: z.string().optional(),
  method: z.enum(['DELIVERY', 'PICKUP']).default('DELIVERY'),
  deliverySlot: z.string().optional(),
  marketingOptIn: z.boolean().optional(),
  paymentMethod: z.enum(['BIT', 'PAYBOX', 'CASH']),
  items: z.array(OrderItemInput).min(1),
}).refine((data) => {
  if (data.method === 'DELIVERY') {
    return Boolean(data.city && data.city.trim()) && Boolean(data.street && data.street.trim());
  }
  return true;
}, { message: 'City and street are required for delivery orders', path: ['city'] })
.refine((data) => {
  if (data.method === 'DELIVERY' && data.city) {
    const cityLower = data.city.trim().toLowerCase();
    return cityLower === 'yad binyamin';
  }
  return true;
}, { message: 'Delivery is only available in Yad Binyamin', path: ['city'] });

export type OrderInputType = z.infer<typeof OrderInput>;
