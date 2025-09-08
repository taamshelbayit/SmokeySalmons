import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL;
  // Flavors
  const flavors = [
    { name: 'Classic Dill & Lemon', description: 'Bright and classic' },
    { name: 'Maple Glaze', description: 'Lightly sweet' },
    { name: 'Harissa Heat', description: 'Warm spice' },
    { name: 'Black Pepper', description: 'Peppery bite' },
  ];

  for (const f of flavors) {
    await prisma.flavor.upsert({
      where: { name: f.name },
      update: {},
      create: f,
    });
  }

  // Products
  const products = [
    { slug: 'whole', name: 'Whole Salmon', description: 'Whole fish, cut to portions', basePrice: '240.00', isMarketPrice: false },
    { slug: 'half', name: 'Half Salmon', description: 'Front half by default', basePrice: '130.00', isMarketPrice: false },
    { slug: 'quarter', name: 'Quarter (standard)', description: 'Standard back quarter', basePrice: '75.00', isMarketPrice: false },
    { slug: 'taster', name: 'Taster Platter', description: '3–4 flavors, small portions', basePrice: '85.00', isMarketPrice: false },
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: p,
    });
  }

  // ProductFlavor allowed all
  const allProducts = await prisma.product.findMany();
  const allFlavors = await prisma.flavor.findMany();
  for (const p of allProducts) {
    for (const f of allFlavors) {
      await prisma.productFlavor.upsert({
        where: { productId_flavorId: { productId: p.id, flavorId: f.id } },
        update: { allowed: true },
        create: { productId: p.id, flavorId: f.id, allowed: true },
      });
    }
  }

  // Settings defaults (stored as JSON strings)
  await prisma.setting.upsert({
    where: { key: 'deliverySlots' },
    update: { value: JSON.stringify(['09:00-12:00', '12:00-15:00']) },
    create: { key: 'deliverySlots', value: JSON.stringify(['09:00-12:00', '12:00-15:00']) },
  });
  await prisma.setting.upsert({
    where: { key: 'tasterFlavorCount' },
    update: { value: JSON.stringify(4) },
    create: { key: 'tasterFlavorCount', value: JSON.stringify(4) },
  });

  if (adminEmail) {
    await prisma.adminUser.upsert({ where: { email: adminEmail }, update: {}, create: { email: adminEmail } });
    console.log('AdminUser ensured:', adminEmail);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
