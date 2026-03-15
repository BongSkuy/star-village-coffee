import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Menu data from Star Village Coffee Menu PDF
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
      name: 'Kopi Susu',
      slug: 'kopi-susu',
      icon: 'coffee',
      order: 5,
      items: [
        { name: 'Kopi Susu Aren Ice', variants: [{ name: 'ICE', price: 17 }] },
        { name: 'Kopi Susu Pandan Ice', variants: [{ name: 'ICE', price: 17 }] },
      ],
    },
    {
      name: 'Milky Base',
      slug: 'milky-base',
      icon: 'milk',
      order: 6,
      items: [
        { name: 'Green Tea', variants: [{ name: 'HOT', price: 17 }, { name: 'ICE', price: 18 }] },
        { name: 'Red Velvet', variants: [{ name: 'HOT', price: 17 }, { name: 'ICE', price: 18 }] },
        { name: 'Chocolatte', variants: [{ name: 'HOT', price: 17 }, { name: 'ICE', price: 18 }] },
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
  ],
}

// GET - Check seed status
export async function GET(request: NextRequest) {
  try {
    const categoriesCount = await db.menuCategory.count()
    const itemsCount = await db.menuItem.count()
    
    return NextResponse.json({
      seeded: categoriesCount > 0,
      categoriesCount,
      itemsCount,
      message: categoriesCount > 0 
        ? 'Database already seeded' 
        : 'Database is empty. Call POST /api/seed to seed the database.'
    })
  } catch (error) {
    console.error('Error checking seed status:', error)
    return NextResponse.json({ error: 'Failed to check seed status' }, { status: 500 })
  }
}

// POST - Seed the database
export async function POST(request: NextRequest) {
  try {
    // Check if already seeded
    const existingCategories = await db.menuCategory.count()
    if (existingCategories > 0) {
      return NextResponse.json({ 
        message: 'Database already seeded. Clear data first if you want to re-seed.',
        categoriesCount: existingCategories
      })
    }

    let totalCategories = 0
    let totalItems = 0
    let totalVariants = 0

    // Seed new data
    for (const categoryData of menuData.categories) {
      const category = await db.menuCategory.create({
        data: {
          name: categoryData.name,
          slug: categoryData.slug,
          icon: categoryData.icon,
          order: categoryData.order,
        },
      })
      totalCategories++

      for (let i = 0; i < categoryData.items.length; i++) {
        const itemData = categoryData.items[i]
        const item = await db.menuItem.create({
          data: {
            name: itemData.name,
            categoryId: category.id,
            order: i,
          },
        })
        totalItems++

        for (const variantData of itemData.variants) {
          await db.itemVariant.create({
            data: {
              name: variantData.name,
              price: variantData.price,
              itemId: item.id,
            },
          })
          totalVariants++
        }
      }
    }

    return NextResponse.json({ 
      success: true,
      message: 'Database seeded successfully!',
      stats: {
        categories: totalCategories,
        items: totalItems,
        variants: totalVariants
      }
    })
  } catch (error) {
    console.error('Error seeding database:', error)
    return NextResponse.json({ error: 'Failed to seed database' }, { status: 500 })
  }
}

// DELETE - Clear all menu data
export async function DELETE(request: NextRequest) {
  try {
    await db.itemVariant.deleteMany()
    await db.menuItem.deleteMany()
    await db.menuCategory.deleteMany()

    return NextResponse.json({ 
      success: true,
      message: 'All menu data has been cleared'
    })
  } catch (error) {
    console.error('Error clearing database:', error)
    return NextResponse.json({ error: 'Failed to clear database' }, { status: 500 })
  }
}
