import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withAuth, validationErrorResponse } from '@/lib/api-auth'
import { createCategorySchema, updateCategorySchema } from '@/lib/validations'

// GET - List all categories (public)
export async function GET(request: NextRequest) {
  try {
    const categories = await db.menuCategory.findMany({
      orderBy: { order: 'asc' },
      include: {
        _count: {
          select: { items: true },
        },
      },
    })

    return NextResponse.json({ categories })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json({ error: 'Gagal mengambil data kategori' }, { status: 500 })
  }
}

// POST - Create new category - Admin only
export const POST = withAuth(async (request: NextRequest) => {
  try {
    const body = await request.json()
    
    // Validate input
    const parseResult = createCategorySchema.safeParse(body)
    if (!parseResult.success) {
      return validationErrorResponse('Data tidak valid', parseResult.error.errors)
    }
    
    const { name, icon, order } = parseResult.data

    // Generate slug from name
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

    // Get max order if not provided
    let categoryOrder = order
    if (categoryOrder === undefined || categoryOrder === null) {
      const maxOrder = await db.menuCategory.aggregate({
        _max: { order: true },
      })
      categoryOrder = (maxOrder._max.order || 0) + 1
    }

    const category = await db.menuCategory.create({
      data: {
        name,
        slug,
        icon: icon || null,
        order: parseInt(String(categoryOrder)),
      },
    })

    return NextResponse.json({ category }, { status: 201 })
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json({ error: 'Gagal membuat kategori' }, { status: 500 })
  }
})

// PUT - Update category - Admin only
export const PUT = withAuth(async (request: NextRequest) => {
  try {
    const body = await request.json()
    
    // Validate input
    const parseResult = updateCategorySchema.safeParse(body)
    if (!parseResult.success) {
      return validationErrorResponse('Data tidak valid', parseResult.error.errors)
    }
    
    const { id, name, icon, order } = parseResult.data

    // Generate slug from name
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

    const category = await db.menuCategory.update({
      where: { id },
      data: {
        name,
        slug,
        icon: icon || null,
        order: order !== undefined ? parseInt(String(order)) : undefined,
      },
    })

    return NextResponse.json({ category })
  } catch (error) {
    console.error('Error updating category:', error)
    return NextResponse.json({ error: 'Gagal mengupdate kategori' }, { status: 500 })
  }
})

// DELETE - Delete category - Admin only
export const DELETE = withAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID diperlukan' }, { status: 400 })
    }

    // Check if category has items
    const itemsCount = await db.menuItem.count({
      where: { categoryId: id },
    })

    if (itemsCount > 0) {
      return NextResponse.json({ 
        error: `Tidak dapat menghapus kategori yang memiliki ${itemsCount} item. Pindahkan atau hapus item terlebih dahulu.` 
      }, { status: 400 })
    }

    await db.menuCategory.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json({ error: 'Gagal menghapus kategori' }, { status: 500 })
  }
})
