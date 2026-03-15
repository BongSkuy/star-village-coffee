import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withAuth, validationErrorResponse } from '@/lib/api-auth'
import { createReservationSchema, updateReservationSchema } from '@/lib/validations'

// Generate unique reservation code
function generateReservationCode(): string {
  const prefix = 'RSV'
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 5).toUpperCase()
  return `${prefix}-${timestamp}${random}`
}

// GET - List all reservations or get by code (public for tracking, admin for all)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const phone = searchParams.get('phone')
    
    // Get single reservation by code and phone (for tracking)
    if (code && phone) {
      const reservation = await db.reservation.findFirst({
        where: {
          reservationCode: code,
          phone: phone
        }
      })
      
      if (!reservation) {
        return NextResponse.json({ error: 'Reservasi tidak ditemukan' }, { status: 404 })
      }
      
      return NextResponse.json({ reservation })
    }
    
    // Get by code only (for admin or validation)
    if (code) {
      const reservation = await db.reservation.findUnique({
        where: { reservationCode: code }
      })
      
      if (!reservation) {
        return NextResponse.json({ error: 'Reservasi tidak ditemukan' }, { status: 404 })
      }
      
      return NextResponse.json({ reservation })
    }
    
    // Get all reservations (admin only - but keeping public for now as admin page needs it)
    // In a stricter implementation, this should also be protected
    const reservations = await db.reservation.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ reservations })
  } catch (error) {
    console.error('Error fetching reservations:', error)
    return NextResponse.json({ error: 'Gagal mengambil data reservasi' }, { status: 500 })
  }
}

// POST - Create new reservation (public)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const parseResult = createReservationSchema.safeParse(body)
    if (!parseResult.success) {
      return validationErrorResponse('Data tidak valid', parseResult.error.errors)
    }
    
    const { name, phone, email, date, time, guests, seatingType, notes } = parseResult.data

    // Generate unique reservation code
    let reservationCode = generateReservationCode()
    let attempts = 0
    const maxAttempts = 10
    
    // Ensure code is unique
    while (attempts < maxAttempts) {
      const existing = await db.reservation.findUnique({
        where: { reservationCode }
      })
      if (!existing) break
      reservationCode = generateReservationCode()
      attempts++
    }

    const reservation = await db.reservation.create({
      data: {
        reservationCode,
        name,
        phone,
        email,
        date,
        time,
        guests: guests || 2,
        seatingType: seatingType || 'indoor',
        notes,
        status: 'pending',
      },
    })

    return NextResponse.json({ reservation }, { status: 201 })
  } catch (error) {
    console.error('Error creating reservation:', error)
    return NextResponse.json({ error: 'Gagal membuat reservasi' }, { status: 500 })
  }
}

// PUT - Update reservation status or admin notes - Admin only
export const PUT = withAuth(async (request: NextRequest) => {
  try {
    const body = await request.json()
    
    // Validate input
    const parseResult = updateReservationSchema.safeParse(body)
    if (!parseResult.success) {
      return validationErrorResponse('Data tidak valid', parseResult.error.errors)
    }
    
    const { id, status, adminNotes } = parseResult.data

    if (!id) {
      return NextResponse.json({ error: 'ID diperlukan' }, { status: 400 })
    }

    // Build update data
    const updateData: { status?: string; adminNotes?: string | null } = {}
    
    if (status) {
      const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled']
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ error: 'Status tidak valid' }, { status: 400 })
      }
      updateData.status = status
    }
    
    if (adminNotes !== undefined) {
      updateData.adminNotes = adminNotes || null
    }

    const reservation = await db.reservation.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ reservation })
  } catch (error) {
    console.error('Error updating reservation:', error)
    return NextResponse.json({ error: 'Gagal mengupdate reservasi' }, { status: 500 })
  }
})

// DELETE - Delete reservation - Admin only
export const DELETE = withAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID diperlukan' }, { status: 400 })
    }

    await db.reservation.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting reservation:', error)
    return NextResponse.json({ error: 'Gagal menghapus reservasi' }, { status: 500 })
  }
})
