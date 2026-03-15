import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withAuth, validationErrorResponse } from '@/lib/api-auth'
import { updateOrderSchema } from '@/lib/validations'

// GET - Get single order (public - for order tracking)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const order = await db.order.findUnique({
      where: { id },
      include: { items: true },
    })

    if (!order) {
      return NextResponse.json({ error: 'Pesanan tidak ditemukan' }, { status: 404 })
    }

    return NextResponse.json({ order })
  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json({ error: 'Gagal mengambil data pesanan' }, { status: 500 })
  }
}

// PUT - Update order (status, payment proof, confirmation, etc) - Admin only
export const PUT = withAuth(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params
    const body = await request.json()
    
    // Validate input
    const parseResult = updateOrderSchema.safeParse(body)
    if (!parseResult.success) {
      return validationErrorResponse('Data tidak valid', parseResult.error.errors)
    }
    
    // Get current order state
    const currentOrder = await db.order.findUnique({
      where: { id },
      include: { items: true },
    })

    if (!currentOrder) {
      return NextResponse.json({ error: 'Pesanan tidak ditemukan' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}
    
    // Handle status change
    if (body.status && body.status !== currentOrder.status) {
      updateData.status = body.status
      
      // If order is being cancelled, return stock
      if (body.status === 'cancelled' && currentOrder.status !== 'cancelled') {
        await db.$transaction(async (tx) => {
          for (const item of currentOrder.items) {
            if (item.itemId) {
              await tx.menuItem.update({
                where: { id: item.itemId },
                data: { stock: { increment: item.quantity } }
              })
            }
          }
        })
      }
      
      // If order is completed, add loyalty points
      if (body.status === 'completed' && currentOrder.status !== 'completed') {
        // Calculate points: 1 point per Rp 10.000
        const pointsToAdd = Math.floor((currentOrder.total * 1000) / 10000)
        
        // Save points earned to order
        updateData.loyaltyPointsEarned = pointsToAdd
        
        if (pointsToAdd > 0 && currentOrder.customerPhone) {
          // Check if customer exists in loyalty
          const existingMember = await db.loyaltyMember.findUnique({
            where: { phone: currentOrder.customerPhone }
          })
          
          if (existingMember) {
            // Update existing member
            const newTotalSpent = existingMember.totalSpent + currentOrder.total
            let newLevel = existingMember.level
            
            // Update level based on total spent
            if (newTotalSpent >= 500) {
              newLevel = 'platinum'
            } else if (newTotalSpent >= 200) {
              newLevel = 'gold'
            } else if (newTotalSpent >= 50) {
              newLevel = 'silver'
            }
            
            await db.loyaltyMember.update({
              where: { phone: currentOrder.customerPhone },
              data: {
                points: { increment: pointsToAdd },
                totalSpent: { increment: currentOrder.total },
                level: newLevel,
              }
            })
          } else {
            // Create new loyalty member
            const initialLevel = currentOrder.total >= 50 ? 'silver' : 'bronze'
            await db.loyaltyMember.create({
              data: {
                name: currentOrder.customerName || 'Customer',
                phone: currentOrder.customerPhone,
                points: pointsToAdd,
                totalSpent: currentOrder.total,
                level: initialLevel,
              }
            })
          }
        }
      }
    }
    
    // Basic fields
    if (body.paymentStatus) updateData.paymentStatus = body.paymentStatus
    if (body.notes !== undefined) updateData.notes = body.notes
    
    // Payment proof fields
    if (body.paymentProofImage !== undefined) {
      updateData.paymentProofImage = body.paymentProofImage
      updateData.paymentProofUploadedAt = new Date()
    }
    if (body.paymentVerified) {
      updateData.paymentStatus = 'paid'
      updateData.paymentVerifiedAt = new Date()
    }
    if (body.paymentRejected) {
      updateData.paymentStatus = 'pending'
      updateData.paymentProofImage = null
      updateData.paymentProofUploadedAt = null
    }
    
    // Customer confirmation (for COD)
    if (body.customerConfirmed !== undefined) {
      updateData.customerConfirmed = body.customerConfirmed
      if (body.customerConfirmed) {
        updateData.customerConfirmedAt = new Date()
      }
    }

    const order = await db.order.update({
      where: { id },
      data: updateData,
      include: { items: true },
    })

    return NextResponse.json({ order })
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json({ error: 'Gagal mengupdate pesanan' }, { status: 500 })
  }
})

// DELETE - Delete order - Admin only
export const DELETE = withAuth(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params
    
    // Get order to check if we need to return stock
    const order = await db.order.findUnique({
      where: { id },
      include: { items: true },
    })
    
    if (!order) {
      return NextResponse.json({ error: 'Pesanan tidak ditemukan' }, { status: 404 })
    }

    // Return stock if order was not cancelled
    if (order.status !== 'cancelled') {
      await db.$transaction(async (tx) => {
        for (const item of order.items) {
          if (item.itemId) {
            await tx.menuItem.update({
              where: { id: item.itemId },
              data: { stock: { increment: item.quantity } }
            })
          }
        }
        
        // Delete order items
        await tx.orderItem.deleteMany({
          where: { orderId: id },
        })

        // Delete order
        await tx.order.delete({
          where: { id },
        })
      })
    } else {
      // Just delete if already cancelled
      await db.orderItem.deleteMany({
        where: { orderId: id },
      })

      await db.order.delete({
        where: { id },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting order:', error)
    return NextResponse.json({ error: 'Gagal menghapus pesanan' }, { status: 500 })
  }
})
