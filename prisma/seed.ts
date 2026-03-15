import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

// Hash password helper
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + (process.env.PASSWORD_SALT || 'star-village-2024')).digest('hex')
}

const menuData = {
  categories: [
    {
      name: 'Classic Coffee',
      slug: 'classic-coffee',
      icon: 'coffee',
      order: 1,
      items: [
        { name: 'Espresso', variants: [{ name: 'HOT', price: 10 }] },
        { name: 'Americano', variants: [{ name: 'HOT', price: 12 }, { name: 'ICE', price: 13 }] },
        { name: 'Cafe Latte', variants: [{ name: 'HOT', price: 15 }, { name: 'ICE', price: 17 }] },
        { name: 'Cappuccino', variants: [{ name: 'HOT', price: 18 }, { name: 'ICE', price: 19 }] },
      ],
    },
    {
      name: 'Signature Coffee',
      slug: 'signature-coffee',
      icon: 'sparkles',
      order: 2,
      items: [
        { name: 'Salted Caramel Ice', variants: [{ name: 'ICE', price: 20 }] },
        { name: 'Butterscotch Ice', variants: [{ name: 'ICE', price: 20 }] },
      ],
    },
    {
      name: 'Manual Brew',
      slug: 'manual-brew',
      icon: 'flame',
      order: 3,
      items: [
        { name: 'Kopi Tubruk', variants: [{ name: 'HOT', price: 10 }] },
        { name: 'V60', variants: [{ name: 'HOT', price: 15 }] },
        { name: 'Vietnam Drip', variants: [{ name: 'ICE', price: 15 }] },
      ],
    },
    {
      name: 'Coffee Mocktail',
      slug: 'coffee-mocktail',
      icon: 'wine',
      order: 4,
      items: [
        { name: 'Calamansi Coffee Ice', variants: [{ name: 'ICE', price: 20 }] },
        { name: 'Summer Kiss Ice', variants: [{ name: 'ICE', price: 20 }] },
      ],
    },
    {
      name: 'Milky Base',
      slug: 'milky-base',
      icon: 'milk',
      order: 5,
      items: [
        { name: 'Green Tea', variants: [{ name: 'HOT', price: 17 }, { name: 'ICE', price: 18 }] },
        { name: 'Red Velvet', variants: [{ name: 'HOT', price: 17 }, { name: 'ICE', price: 18 }] },
        { name: 'Chocolatte', variants: [{ name: 'HOT', price: 17 }, { name: 'ICE', price: 18 }] },
      ],
    },
    {
      name: 'Kopi Susu',
      slug: 'kopi-susu',
      icon: 'coffee',
      order: 6,
      items: [
        { name: 'Kopi Susu Aren Ice', variants: [{ name: 'ICE', price: 17 }] },
        { name: 'Kopi Susu Pandan Ice', variants: [{ name: 'ICE', price: 17 }] },
      ],
    },
    {
      name: 'Mocktail',
      slug: 'mocktail',
      icon: 'glass-water',
      order: 7,
      items: [
        { name: 'Mojito', variants: [{ name: 'ICE', price: 15 }] },
        { name: 'Kremint', variants: [{ name: 'ICE', price: 15 }] },
        { name: 'Lemoncelo', variants: [{ name: 'ICE', price: 17 }] },
      ],
    },
    {
      name: 'Tea Selection',
      slug: 'tea-selection',
      icon: 'leaf',
      order: 8,
      items: [
        { name: 'Original Tea', variants: [{ name: 'HOT', price: 5 }, { name: 'ICE', price: 8 }] },
        { name: 'Lemon Tea', variants: [{ name: 'HOT', price: 10 }, { name: 'ICE', price: 13 }] },
        { name: 'Lychee Tea', variants: [{ name: 'HOT', price: 10 }, { name: 'ICE', price: 13 }] },
      ],
    },
    {
      name: 'Juice',
      slug: 'juice',
      icon: 'cup-straw',
      order: 9,
      items: [
        { name: 'Mangga', variants: [{ name: 'ICE', price: 15 }] },
        { name: 'Strawberry', variants: [{ name: 'ICE', price: 15 }] },
      ],
    },
    {
      name: 'My Bottle',
      slug: 'my-bottle',
      icon: 'bottle',
      order: 10,
      items: [
        { name: 'Kopasus', variants: [{ name: '500ML', price: 30 }, { name: '1000ML', price: 60 }] },
        { name: 'Kopsu Aren', variants: [{ name: '500ML', price: 30 }, { name: '1000ML', price: 60 }] },
        { name: 'Kopsu Pandan', variants: [{ name: '500ML', price: 30 }, { name: '1000ML', price: 60 }] },
        { name: 'Green Tea', variants: [{ name: '500ML', price: 30 }, { name: '1000ML', price: 60 }] },
        { name: 'Chocolate', variants: [{ name: '500ML', price: 30 }, { name: '1000ML', price: 60 }] },
        { name: 'Red Velvet', variants: [{ name: '500ML', price: 30 }, { name: '1000ML', price: 60 }] },
      ],
    },
    {
      name: 'Snack',
      slug: 'snack',
      icon: 'cookie',
      order: 11,
      items: [
        { name: 'Tempe Cocol', variants: [{ name: 'REGULAR', price: 9.5 }] },
        { name: 'Tahu Cocol', variants: [{ name: 'REGULAR', price: 9.5 }] },
        { name: 'Pisang Goreng', variants: [{ name: 'REGULAR', price: 10 }] },
        { name: 'Mendoan', variants: [{ name: 'REGULAR', price: 10 }] },
        { name: 'Basreng Daun Jeruk', variants: [{ name: 'REGULAR', price: 10 }] },
        { name: 'French Fries Ori', variants: [{ name: 'REGULAR', price: 11 }] },
        { name: 'French Fries Balado', variants: [{ name: 'REGULAR', price: 12 }] },
        { name: 'Spaghetti Bolognaise', variants: [{ name: 'REGULAR', price: 12 }] },
        { name: 'Brokoli Crispy', variants: [{ name: 'REGULAR', price: 13.5 }] },
        { name: 'Singkong Keju', variants: [{ name: 'REGULAR', price: 13.5 }] },
        { name: 'Cireng', variants: [{ name: 'REGULAR', price: 15.5 }] },
        { name: 'Getuk Crispy', variants: [{ name: 'REGULAR', price: 15.5 }] },
        { name: 'Cuangki', variants: [{ name: 'REGULAR', price: 16 }] },
        { name: 'Platter', variants: [{ name: 'REGULAR', price: 17.5 }] },
      ],
    },
    {
      name: 'Roti Bakar',
      slug: 'roti-bakar',
      icon: 'toast',
      order: 12,
      items: [
        { name: 'Caramel Ori', variants: [{ name: 'REGULAR', price: 9.5 }] },
        { name: 'Coklat', variants: [{ name: 'REGULAR', price: 9.5 }] },
        { name: 'Coklat Keju', variants: [{ name: 'REGULAR', price: 10 }] },
        { name: 'Coklat Vanila', variants: [{ name: 'REGULAR', price: 10 }] },
        { name: 'Coklat Pisang', variants: [{ name: 'REGULAR', price: 10 }] },
        { name: 'Keju', variants: [{ name: 'REGULAR', price: 10 }] },
        { name: 'Strawberry', variants: [{ name: 'REGULAR', price: 10 }] },
        { name: 'Sosis Telur', variants: [{ name: 'REGULAR', price: 11 }] },
      ],
    },
    {
      name: 'Toast',
      slug: 'toast',
      icon: 'sandwich',
      order: 13,
      items: [
        { name: 'Caramel Ori', variants: [{ name: 'REGULAR', price: 12 }] },
        { name: 'Smoked Beef', variants: [{ name: 'REGULAR', price: 15 }] },
        { name: 'Coklat', variants: [{ name: 'REGULAR', price: 15 }] },
      ],
    },
    {
      name: 'Burger',
      slug: 'burger',
      icon: 'hamburger',
      order: 14,
      items: [
        { name: 'Chicken Patty Burger', variants: [{ name: 'REGULAR', price: 16.5 }] },
        { name: 'Chicken Garlic Burger', variants: [{ name: 'REGULAR', price: 18 }] },
        { name: 'Beef Patty Burger', variants: [{ name: 'REGULAR', price: 25 }] },
      ],
    },
    {
      name: 'Food',
      slug: 'food',
      icon: 'utensils',
      order: 15,
      items: [
        { name: 'Sego Telur Crispy', variants: [{ name: 'REGULAR', price: 14 }] },
        { name: 'Nasi Telur Orak Arik', variants: [{ name: 'REGULAR', price: 14.5 }] },
        { name: 'Nasi Ayam Katsu Teriyaki', variants: [{ name: 'REGULAR', price: 14.5 }] },
        { name: 'Nasi Goreng', variants: [{ name: 'REGULAR', price: 15 }] },
        { name: 'Nasi Ayam Sambal Bawang', variants: [{ name: 'REGULAR', price: 15.5 }] },
        { name: 'Nasi Kulit Sambal Bawang', variants: [{ name: 'REGULAR', price: 15.5 }] },
        { name: 'Nasi Goreng Spesial', variants: [{ name: 'REGULAR', price: 17 }] },
        { name: 'Nasi Ayam Teriyaki', variants: [{ name: 'REGULAR', price: 24 }] },
      ],
    },
    {
      name: 'Mie',
      slug: 'mie',
      icon: 'bowl-food',
      order: 16,
      items: [
        { name: 'Indomie Telur Rebus', variants: [{ name: 'REGULAR', price: 10 }] },
        { name: 'Mie Dok Dok', variants: [{ name: 'REGULAR', price: 12 }] },
        { name: 'Indomie Telur Abon', variants: [{ name: 'REGULAR', price: 12.5 }] },
        { name: 'Indomie Telur Kornet', variants: [{ name: 'REGULAR', price: 14.5 }] },
        { name: 'Indomie Ayam Katsu', variants: [{ name: 'REGULAR', price: 16 }] },
        { name: 'Indomie Carbonara', variants: [{ name: 'REGULAR', price: 16 }] },
      ],
    },
    {
      name: 'Tambahan',
      slug: 'tambahan',
      icon: 'plus-circle',
      order: 17,
      items: [
        { name: 'Es Batu', variants: [{ name: 'REGULAR', price: 4 }] },
        { name: 'Topping Telur', variants: [{ name: 'REGULAR', price: 5 }] },
        { name: 'Nasi Putih', variants: [{ name: 'REGULAR', price: 5 }] },
      ],
    },
  ],
};

// Sample reviews data
const reviewsData = [
  {
    name: 'Anisa Rahma',
    rating: 5,
    comment: 'Tempatnya cozy banget! Kopinya enak, barista nya ramah-ramah. Recommended buat yang cari tempat nongkrong di Boyolali.',
    source: 'google',
    order: 1,
  },
  {
    name: 'Budi Santoso',
    rating: 5,
    comment: 'Kopi susu aren nya juara! Harga terjangkau, tempat nyaman buat kerja. Pasti balik lagi.',
    source: 'google',
    order: 2,
  },
  {
    name: 'Dewi Lestari',
    rating: 4,
    comment: 'Suasananya asyik, ada indoor dan outdoor. Makanannya juga enak, terutama nasi goreng spesialnya.',
    source: 'google',
    order: 3,
  },
  {
    name: 'Reza Firmansyah',
    rating: 5,
    comment: 'Best coffee shop di Boyolali! Manual brew nya mantap, pelayanan ramah. WiFi kencang buat kerja.',
    source: 'tiktok',
    order: 4,
  },
  {
    name: 'Siti Nurhaliza',
    rating: 5,
    comment: 'Tempat favorit buat hangout sama teman-teman. Banyak pilihan menu, dari kopi sampe makanan berat. Love it! ❤️',
    source: 'instagram',
    order: 5,
  },
];

// Delivery zones data
const deliveryZonesData = [
  { name: 'Zona 1', minDistance: 0, maxDistance: 2, fee: 5, minOrder: 30, isActive: true },
  { name: 'Zona 2', minDistance: 2, maxDistance: 4, fee: 8, minOrder: 50, isActive: true },
  { name: 'Zona 3', minDistance: 4, maxDistance: 6, fee: 12, minOrder: 75, isActive: true },
];

async function main() {
  console.log('🌱 Starting seed...');

  // Clear existing data (except settings)
  await prisma.itemVariant.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.menuCategory.deleteMany();
  await prisma.review.deleteMany();
  await prisma.deliveryZone.deleteMany();

  // Seed menu data
  console.log('📝 Seeding menu data...');
  for (const categoryData of menuData.categories) {
    const category = await prisma.menuCategory.create({
      data: {
        name: categoryData.name,
        slug: categoryData.slug,
        icon: categoryData.icon,
        order: categoryData.order,
      },
    });

    for (let i = 0; i < categoryData.items.length; i++) {
      const itemData = categoryData.items[i];
      const item = await prisma.menuItem.create({
        data: {
          name: itemData.name,
          categoryId: category.id,
          order: i,
        },
      });

      for (const variantData of itemData.variants) {
        await prisma.itemVariant.create({
          data: {
            name: variantData.name,
            price: variantData.price,
            itemId: item.id,
          },
        });
      }
    }

    console.log(`✅ Created category: ${categoryData.name}`);
  }

  // Seed reviews
  console.log('⭐ Seeding reviews...');
  for (const reviewData of reviewsData) {
    await prisma.review.create({
      data: {
        name: reviewData.name,
        rating: reviewData.rating,
        comment: reviewData.comment,
        source: reviewData.source,
        order: reviewData.order,
        isActive: true,
      },
    });
  }
  console.log(`✅ Created ${reviewsData.length} reviews`);

  // Seed delivery zones
  console.log('🚚 Seeding delivery zones...');
  for (const zoneData of deliveryZonesData) {
    await prisma.deliveryZone.create({
      data: zoneData,
    });
  }
  console.log(`✅ Created ${deliveryZonesData.length} delivery zones`);

  // Seed admin password (hashed)
  const existingAdminPassword = await prisma.cafeSetting.findUnique({
    where: { key: 'admin_password_hash' }
  });

  if (!existingAdminPassword) {
    const defaultPassword = process.env.ADMIN_INITIAL_PASSWORD || 'starvillage2024';
    await prisma.cafeSetting.create({
      data: {
        key: 'admin_password_hash',
        value: hashPassword(defaultPassword),
        description: 'Hashed password untuk login admin dashboard'
      }
    });
    console.log('🔐 Created default admin password');
    console.log('⚠️  IMPORTANT: Change the admin password after first login!');
  } else {
    console.log('🔐 Admin password already exists');
  }

  // Seed cafe settings
  const defaultSettings = [
    { key: 'cafe_name', value: 'Star Village Coffee', description: 'Nama kafe' },
    { key: 'cafe_tagline', value: 'Start Your Vibes Here', description: 'Tagline kafe' },
    { key: 'cafe_address', value: 'Jl. Tentara Pelajar, Dusun 3, Kiringan, Boyolali, Jawa Tengah', description: 'Alamat kafe' },
    { key: 'cafe_phone', value: '6281225448358', description: 'Nomor telepon/WhatsApp' },
    { key: 'cafe_instagram', value: '@starvillage.coffee', description: 'Instagram handle' },
    { key: 'open_hour', value: '10', description: 'Jam buka' },
    { key: 'close_hour', value: '23', description: 'Jam tutup' },
    { key: 'whatsapp_admin', value: '6281225448358', description: 'Nomor WhatsApp admin' },
  ];

  for (const setting of defaultSettings) {
    const existing = await prisma.cafeSetting.findUnique({
      where: { key: setting.key }
    });
    
    if (!existing) {
      await prisma.cafeSetting.create({
        data: setting
      });
    }
  }
  console.log('⚙️ Cafe settings seeded');

  console.log('✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
