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
  email: z.string().email().optional().or(z.literal('')),
  city: z.string().optional(),
  street: z.string().optional(),
  apt: z.string().optional(),
  notes: z.string().optional(),
  method: z.enum(['DELIVERY', 'PICKUP']).default('DELIVERY'),
  deliverySlot: z.string().optional(),
  marketingOptIn: z.boolean().optional(),
  items: z.array(OrderItemInput).min(1),
});

export type OrderInputType = z.infer<typeof OrderInput>;
