import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withAuth } from '@/lib/api-auth'

// GET - Check loyalty points by phone number (public)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const phone = searchParams.get('phone')
    const admin = searchParams.get('admin')

    // If admin=true, return all members (admin only)
    if (admin === 'true') {
      const isAuth = await checkAuthFromRequest(request)
      if (!isAuth) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      
      const members = await db.loyaltyMember.findMany({
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
          points: true,
          level: true,
          totalSpent: true,
          createdAt: true,
        },
      })
      return NextResponse.json({ members })
    }

    if (!phone) {
      return NextResponse.json({ error: 'Nomor telepon diperlukan' }, { status: 400 })
    }

    // Find loyalty member by phone
    const member = await db.loyaltyMember.findUnique({
      where: { phone },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        points: true,
        level: true,
        totalSpent: true,
        createdAt: true,
      },
    })

    if (!member) {
      return NextResponse.json({ error: 'Member tidak ditemukan' }, { status: 404 })
    }

    // Get recent orders for this member
    const recentOrders = await db.order.findMany({
      where: { customerPhone: phone },
      select: {
        orderNumber: true,
        total: true,
        status: true,
        loyaltyPointsEarned: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    })

    return NextResponse.json({ member, recentOrders })
  } catch (error) {
    console.error('Error fetching loyalty info:', error)
    return NextResponse.json({ error: 'Gagal mengambil data loyalitas' }, { status: 500 })
  }
}

// Helper to check auth from request
async function checkAuthFromRequest(request: NextRequest): Promise<boolean> {
  const cookieHeader = request.headers.get('cookie') || ''
  return cookieHeader.includes('admin_session') || 
         cookieHeader.includes('next-auth.session-token') ||
         cookieHeader.includes('__Secure-next-auth.session-token')
}

// POST - Create or update loyalty member (for registration)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, phone, email } = body

    if (!name || !phone) {
      return NextResponse.json({ error: 'Nama dan nomor telepon diperlukan' }, { status: 400 })
    }

    // Check if member already exists
    const existingMember = await db.loyaltyMember.findUnique({
      where: { phone },
    })

    if (existingMember) {
      // Update existing member
      const updatedMember = await db.loyaltyMember.update({
        where: { phone },
        data: {
          name,
          email: email || existingMember.email,
        },
      })
      return NextResponse.json({ member: updatedMember, isNew: false })
    }

    // Create new member
    const newMember = await db.loyaltyMember.create({
      data: {
        name,
        phone,
        email,
        points: 0,
        totalSpent: 0,
        level: 'bronze',
      },
    })

    return NextResponse.json({ member: newMember, isNew: true }, { status: 201 })
  } catch (error) {
    console.error('Error creating/updating loyalty member:', error)
    return NextResponse.json({ error: 'Gagal membuat/update member' }, { status: 500 })
  }
}

// PUT - Update loyalty member points (Admin only)
export const PUT = withAuth(async (request: NextRequest) => {
  try {
    const body = await request.json()
    const { id, phone, points, pointsAction, name, email, level } = body

    // Find member by id or phone
    const where = id ? { id } : { phone }
    const existingMember = await db.loyaltyMember.findUnique({ where })

    if (!existingMember) {
      return NextResponse.json({ error: 'Member tidak ditemukan' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}

    // Handle points update
    if (points !== undefined) {
      if (pointsAction === 'add') {
        updateData.points = { increment: points }
      } else if (pointsAction === 'redeem' || pointsAction === 'subtract') {
        if (existingMember.points < points) {
          return NextResponse.json({ error: 'Points tidak mencukupi' }, { status: 400 })
        }
        updateData.points = { decrement: points }
      } else {
        // Set absolute value
        updateData.points = points
      }
    }

    // Update other fields
    if (name) updateData.name = name
    if (email !== undefined) updateData.email = email
    if (level) updateData.level = level

    const updatedMember = await db.loyaltyMember.update({
      where,
      data: updateData,
    })

    return NextResponse.json({ member: updatedMember })
  } catch (error) {
    console.error('Error updating loyalty member:', error)
    return NextResponse.json({ error: 'Gagal mengupdate member' }, { status: 500 })
  }
})

// DELETE - Delete loyalty member (Admin only)
export const DELETE = withAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const phone = searchParams.get('phone')

    if (!id && !phone) {
      return NextResponse.json({ error: 'ID atau nomor telepon diperlukan' }, { status: 400 })
    }

    const where = id ? { id } : { phone }
    
    await db.loyaltyMember.delete({ where })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting loyalty member:', error)
    return NextResponse.json({ error: 'Gagal menghapus member' }, { status: 500 })
  }
})
