import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withAuth, validationErrorResponse } from '@/lib/api-auth'
import { createGalleryImageSchema } from '@/lib/validations'

// GET - Get all gallery images (public)
export async function GET() {
  try {
    // Check if galleryImage model exists on db
    if (!db.galleryImage) {
      return NextResponse.json({ images: [] })
    }
    
    const images = await db.galleryImage.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' }
    })
    
    return NextResponse.json({ images })
  } catch (error) {
    console.error('Error fetching gallery:', error)
    // Return empty array instead of error to prevent UI break
    return NextResponse.json({ images: [] })
  }
}

// POST - Add new gallery image - Admin only
export const POST = withAuth(async (request: NextRequest) => {
  try {
    const body = await request.json()
    
    // Validate input
    const parseResult = createGalleryImageSchema.safeParse(body)
    if (!parseResult.success) {
      return validationErrorResponse('Data tidak valid', parseResult.error.errors)
    }
    
    const { title, description, imageUrl, order } = parseResult.data
    
    if (!db.galleryImage) {
      return NextResponse.json({ error: 'Gallery model tidak tersedia' }, { status: 500 })
    }
    
    const image = await db.galleryImage.create({
      data: {
        title: title || null,
        description: description || null,
        imageUrl,
        order: order || 0
      }
    })
    
    return NextResponse.json({ success: true, image })
  } catch (error) {
    console.error('Error adding gallery image:', error)
    return NextResponse.json({ error: 'Gagal menambahkan gambar' }, { status: 500 })
  }
})

// DELETE - Delete gallery image - Admin only
export const DELETE = withAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'ID diperlukan' }, { status: 400 })
    }
    
    if (!db.galleryImage) {
      return NextResponse.json({ error: 'Gallery model tidak tersedia' }, { status: 500 })
    }
    
    await db.galleryImage.delete({
      where: { id }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting gallery image:', error)
    return NextResponse.json({ error: 'Gagal menghapus gambar' }, { status: 500 })
  }
})
