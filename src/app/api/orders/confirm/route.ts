import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// POST - Customer confirms their order (public, no auth required)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderNumber } = body

    if (!orderNumber) {
      return NextResponse.json({ error: 'Nomor pesanan diperlukan' }, { status: 400 })
    }

    // Find the order
    const order = await db.order.findFirst({
      where: { orderNumber },
    })

    if (!order) {
      return NextResponse.json({ error: 'Pesanan tidak ditemukan' }, { status: 404 })
    }

    // Check if already confirmed
    if (order.customerConfirmed) {
      return NextResponse.json({ 
        message: 'Pesanan sudah dikonfirmasi',
        order 
      })
    }

    // Update the order
    const updatedOrder = await db.order.update({
      where: { id: order.id },
      data: {
        customerConfirmed: true,
        customerConfirmedAt: new Date(),
        // Also change status from pending to confirmed
        status: order.status === 'pending' ? 'confirmed' : order.status,
      },
      include: { items: true },
    })

    return NextResponse.json({ 
      success: true,
      message: 'Pesanan berhasil dikonfirmasi',
      order: updatedOrder 
    })
  } catch (error) {
    console.error('Error confirming order:', error)
    return NextResponse.json({ error: 'Gagal mengkonfirmasi pesanan' }, { status: 500 })
  }
}
