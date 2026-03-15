import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withAuth, validationErrorResponse } from '@/lib/api-auth'
import { reorderGallerySchema } from '@/lib/validations'

// POST - Reorder gallery images - Admin only
export const POST = withAuth(async (request: NextRequest) => {
  try {
    const body = await request.json()
    
    // Validate input
    const parseResult = reorderGallerySchema.safeParse(body)
    if (!parseResult.success) {
      return validationErrorResponse('Data tidak valid', parseResult.error.errors)
    }
    
    const { orders } = parseResult.data

    // Update each image's order
    for (const item of orders) {
      await db.galleryImage.update({
        where: { id: item.id },
        data: { order: item.order }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error reordering gallery:', error)
    return NextResponse.json({ error: 'Failed to reorder gallery' }, { status: 500 })
  }
})
