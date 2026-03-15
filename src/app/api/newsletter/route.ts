import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withAuth } from '@/lib/api-auth'

// POST - Subscribe to newsletter (public)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name } = body

    if (!email) {
      return NextResponse.json({ error: 'Email diperlukan' }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Format email tidak valid' }, { status: 400 })
    }

    // Check if email already exists
    const existingSubscriber = await db.newsletterSubscriber.findUnique({
      where: { email },
    })

    if (existingSubscriber) {
      // If subscriber exists but is inactive, reactivate
      if (!existingSubscriber.isActive) {
        await db.newsletterSubscriber.update({
          where: { email },
          data: { 
            isActive: true,
            name: name || existingSubscriber.name,
          },
        })
        return NextResponse.json({ 
          message: 'Selamat datang kembali! Anda telah berlangganan newsletter.',
          isNew: false 
        })
      }
      
      return NextResponse.json({ 
        message: 'Email sudah terdaftar di newsletter',
        isNew: false 
      })
    }

    // Create new subscriber
    await db.newsletterSubscriber.create({
      data: {
        email,
        name,
        isActive: true,
      },
    })

    return NextResponse.json({ 
      message: 'Terima kasih! Anda telah berlangganan newsletter.',
      isNew: true 
    }, { status: 201 })
  } catch (error) {
    console.error('Error subscribing to newsletter:', error)
    return NextResponse.json({ error: 'Gagal berlangganan newsletter' }, { status: 500 })
  }
}

// GET - List all subscribers (Admin only)
export const GET = withAuth(async (request: NextRequest) => {
  try {
    const subscribers = await db.newsletterSubscriber.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ subscribers })
  } catch (error) {
    console.error('Error fetching subscribers:', error)
    return NextResponse.json({ error: 'Gagal mengambil data subscriber' }, { status: 500 })
  }
})
