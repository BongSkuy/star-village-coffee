import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { withAuth, validationErrorResponse } from '@/lib/api-auth';
import { createMenuItemSchema, updateMenuItemSchema } from '@/lib/validations';

// GET - List all menu items grouped by category (public)
export async function GET() {
  try {
    const categories = await db.menuCategory.findMany({
      orderBy: { order: 'asc' },
      include: {
        items: {
          orderBy: { order: 'asc' },
          include: {
            variants: true,
          },
        },
      },
    });

    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Error fetching menu:', error);
    return NextResponse.json(
      { error: 'Failed to fetch menu' },
      { status: 500 }
    );
  }
}

// POST - Create new menu item - Admin only
export const POST = withAuth(async (request: NextRequest) => {
  try {
    const body = await request.json();
    
    // Validate input
    const parseResult = createMenuItemSchema.safeParse(body);
    if (!parseResult.success) {
      return validationErrorResponse('Data tidak valid', parseResult.error.errors);
    }
    
    const { 
      name, 
      description, 
      image, 
      categoryId, 
      variants, 
      isPopular, 
      isNew, 
      isPromo, 
      stock, 
      isAvailable 
    } = parseResult.data;

    // Get the max order for the category
    const maxOrder = await db.menuItem.aggregate({
      where: { categoryId },
      _max: { order: true },
    });
    const order = (maxOrder._max.order || 0) + 1;

    const item = await db.menuItem.create({
      data: {
        name,
        description: description || null,
        image: image || null,
        categoryId,
        isPopular: isPopular || false,
        isNew: isNew || false,
        isPromo: isPromo || false,
        stock: stock || 100,
        isAvailable: isAvailable !== false,
        order,
        variants: {
          create: variants?.map((v) => ({
            name: v.name,
            price: v.price,
          })) || [],
        },
      },
      include: {
        variants: true,
        category: true,
      },
    });

    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    console.error('Error creating menu item:', error);
    return NextResponse.json(
      { error: 'Gagal membuat menu item' },
      { status: 500 }
    );
  }
});

// PUT - Update menu item - Admin only
export const PUT = withAuth(async (request: NextRequest) => {
  try {
    const body = await request.json();
    
    // Validate input
    const parseResult = updateMenuItemSchema.safeParse(body);
    if (!parseResult.success) {
      return validationErrorResponse('Data tidak valid', parseResult.error.errors);
    }
    
    const { 
      id, 
      name, 
      description, 
      image, 
      categoryId, 
      variants, 
      isPopular, 
      isNew, 
      isPromo, 
      stock, 
      isAvailable 
    } = parseResult.data;

    // Delete existing variants and create new ones
    await db.itemVariant.deleteMany({
      where: { itemId: id },
    });

    const item = await db.menuItem.update({
      where: { id },
      data: {
        name,
        description: description || null,
        image: image || null,
        categoryId,
        isPopular: isPopular || false,
        isNew: isNew || false,
        isPromo: isPromo || false,
        stock: stock || 100,
        isAvailable: isAvailable !== false,
        variants: {
          create: variants?.map((v) => ({
            name: v.name,
            price: v.price,
          })) || [],
        },
      },
      include: {
        variants: true,
        category: true,
      },
    });

    return NextResponse.json({ item });
  } catch (error) {
    console.error('Error updating menu item:', error);
    return NextResponse.json(
      { error: 'Gagal mengupdate menu item' },
      { status: 500 }
    );
  }
});

// DELETE - Delete menu item - Admin only
export const DELETE = withAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID diperlukan' },
        { status: 400 }
      );
    }

    // Variants will be deleted automatically due to cascade
    await db.menuItem.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    return NextResponse.json(
      { error: 'Gagal menghapus menu item' },
      { status: 500 }
    );
  }
});
