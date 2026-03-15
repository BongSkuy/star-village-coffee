import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withAuth } from '@/lib/api-auth'

// GET - Get all reviews (with optional filter for active only)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get('activeOnly') === 'true'
    
    const reviews = await db.review.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }]
    })

    return NextResponse.json({ reviews })
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json({ reviews: [] })
  }
}

// POST - Create new review - Admin only
export const POST = withAuth(async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { name, avatar, rating, comment, source, sourceUrl, order } = body

    const review = await db.review.create({
      data: {
        name,
        avatar: avatar || null,
        rating: rating || 5,
        comment,
        source: source || 'google',
        sourceUrl: sourceUrl || null,
        order: order || 0,
        isActive: true
      }
    })

    return NextResponse.json({ success: true, review })
  } catch (error) {
    console.error('Error creating review:', error)
    return NextResponse.json({ error: 'Gagal membuat ulasan' }, { status: 500 })
  }
})

// PUT - Update review - Admin only
export const PUT = withAuth(async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { id, name, avatar, rating, comment, source, sourceUrl, order, isActive } = body

    if (!id) {
      return NextResponse.json({ error: 'ID diperlukan' }, { status: 400 })
    }

    const review = await db.review.update({
      where: { id },
      data: {
        name,
        avatar: avatar || null,
        rating,
        comment,
        source,
        sourceUrl: sourceUrl || null,
        order: order || 0,
        isActive: isActive ?? true
      }
    })

    return NextResponse.json({ success: true, review })
  } catch (error) {
    console.error('Error updating review:', error)
    return NextResponse.json({ error: 'Gagal mengupdate ulasan' }, { status: 500 })
  }
})

// DELETE - Delete review - Admin only
export const DELETE = withAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID diperlukan' }, { status: 400 })
    }

    await db.review.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting review:', error)
    return NextResponse.json({ error: 'Gagal menghapus ulasan' }, { status: 500 })
  }
})
