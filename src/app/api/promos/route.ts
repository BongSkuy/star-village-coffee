import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withAuth, validationErrorResponse } from '@/lib/api-auth'
import { createPromoSchema, updatePromoSchema } from '@/lib/validations'

// GET - List all promos (public - for validation)
export async function GET(request: NextRequest) {
  try {
    const promos = await db.promo.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ promos })
  } catch (error) {
    console.error('Error fetching promos:', error)
    return NextResponse.json({ error: 'Gagal mengambil data promo' }, { status: 500 })
  }
}

// POST - Create new promo - Admin only
export const POST = withAuth(async (request: NextRequest) => {
  try {
    const body = await request.json()
    
    // Validate input
    const parseResult = createPromoSchema.safeParse(body)
    if (!parseResult.success) {
      return validationErrorResponse('Data tidak valid', parseResult.error.errors)
    }
    
    const { code, discount, minPurchase, maxUses, expiresAt, isActive } = parseResult.data

    const promo = await db.promo.create({
      data: {
        code: code.toUpperCase(),
        discount,
        minPurchase,
        maxUses,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        isActive,
        usedCount: 0,
      },
    })

    return NextResponse.json({ promo }, { status: 201 })
  } catch (error) {
    console.error('Error creating promo:', error)
    return NextResponse.json({ error: 'Gagal membuat promo' }, { status: 500 })
  }
})

// PUT - Update promo - Admin only
export const PUT = withAuth(async (request: NextRequest) => {
  try {
    const body = await request.json()
    
    // Validate input
    const parseResult = updatePromoSchema.safeParse(body)
    if (!parseResult.success) {
      return validationErrorResponse('Data tidak valid', parseResult.error.errors)
    }
    
    const { id, code, discount, minPurchase, maxUses, expiresAt, isActive } = parseResult.data

    const promo = await db.promo.update({
      where: { id },
      data: {
        code: code?.toUpperCase(),
        discount: discount !== undefined ? discount : undefined,
        minPurchase: minPurchase !== undefined ? minPurchase : undefined,
        maxUses: maxUses !== undefined ? (maxUses ? maxUses : null) : undefined,
        expiresAt: expiresAt !== undefined ? (expiresAt ? new Date(expiresAt) : null) : undefined,
        isActive: isActive !== undefined ? isActive : undefined,
      },
    })

    return NextResponse.json({ promo })
  } catch (error) {
    console.error('Error updating promo:', error)
    return NextResponse.json({ error: 'Gagal mengupdate promo' }, { status: 500 })
  }
})

// DELETE - Delete promo - Admin only
export const DELETE = withAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID diperlukan' }, { status: 400 })
    }

    await db.promo.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting promo:', error)
    return NextResponse.json({ error: 'Gagal menghapus promo' }, { status: 500 })
  }
})
