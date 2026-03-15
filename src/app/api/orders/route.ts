import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { validationErrorResponse } from '@/lib/api-auth'
import { createOrderSchema } from '@/lib/validations'

// GET - List all orders or get single order by orderNumber (public for tracking, admin for all)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const orderNumber = searchParams.get('orderNumber')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // If orderNumber is provided, fetch single order
    if (orderNumber) {
      const order = await db.order.findFirst({
        where: { orderNumber },
        include: {
          items: true,
        },
      })

      if (!order) {
        return NextResponse.json({ error: 'Pesanan tidak ditemukan' }, { status: 404 })
      }

      return NextResponse.json({ order })
    }

    // Otherwise, list all orders
    const where: Record<string, string> = {}
    if (status && status !== 'all') {
      where.status = status
    }

    const orders = await db.order.findMany({
      where,
      include: {
        items: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    })

    const total = await db.order.count({ where })

    return NextResponse.json({ orders, total })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json({ error: 'Gagal mengambil data pesanan' }, { status: 500 })
  }
}

// POST - Create new order (public - for customer orders)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const parseResult = createOrderSchema.safeParse(body)
    if (!parseResult.success) {
      return validationErrorResponse('Data tidak valid', parseResult.error.errors)
    }
    
    const {
      customerName,
      customerPhone,
      customerEmail,
      items,
      subtotal,
      discount,
      voucherCode,
      total,
      notes,
      source,
      paymentMethod,
      paymentStatus,
      orderType,
      deliveryAddress,
      deliveryNotes,
      deliveryFee,
      deliveryMethod,
      deliveryLat,
      deliveryLng,
      deliveryDistance,
      estimatedTime,
    } = parseResult.data

    // Check stock availability for all items
    const stockIssues: string[] = []
    for (const item of items || []) {
      if (item.itemId) {
        const menuItem = await db.menuItem.findUnique({
          where: { id: item.itemId },
          select: { name: true, stock: true, isAvailable: true }
        })
        
        if (menuItem) {
          if (!menuItem.isAvailable) {
            stockIssues.push(`${menuItem.name} tidak tersedia`)
          } else if (menuItem.stock < item.quantity) {
            stockIssues.push(`${menuItem.name} stok tidak mencukupi (tersisa ${menuItem.stock})`)
          }
        }
      }
    }

    if (stockIssues.length > 0) {
      return NextResponse.json({ 
        error: 'Stok tidak mencukupi',
        details: stockIssues 
      }, { status: 400 })
    }

    // Generate order number
    const lastOrder = await db.order.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { orderNumber: true },
    })

    let orderNumber = 'SV-0001'
    if (lastOrder?.orderNumber) {
      const lastNum = parseInt(lastOrder.orderNumber.replace('SV-', ''))
      orderNumber = `SV-${String(lastNum + 1).padStart(4, '0')}`
    }

    // Create order with items and deduct stock in a transaction
    const order = await db.$transaction(async (tx) => {
      // Deduct stock for each item
      for (const item of items || []) {
        if (item.itemId) {
          await tx.menuItem.update({
            where: { id: item.itemId },
            data: { stock: { decrement: item.quantity } }
          })
        }
      }

      // Create the order
      return tx.order.create({
        data: {
          orderNumber,
          customerName,
          customerPhone,
          customerEmail,
          subtotal: subtotal || 0,
          discount: discount || 0,
          voucherCode,
          total: total || 0,
          notes: notes,
          status: 'pending',
          source: source || 'website',
          paymentMethod: paymentMethod || 'cod',
          paymentStatus: paymentStatus || 'pending',
          // Delivery fields
          orderType: orderType || 'pickup',
          deliveryAddress: deliveryAddress || null,
          deliveryNotes: deliveryNotes || null,
          deliveryFee: deliveryFee || 0,
          deliveryMethod: deliveryMethod || null,
          deliveryLat: deliveryLat || null,
          deliveryLng: deliveryLng || null,
          deliveryDistance: deliveryDistance || null,
          estimatedTime: estimatedTime || null,
          items: {
            create: items?.map((item) => ({
              itemId: item.itemId,
              itemName: item.itemName,
              variantName: item.variantName,
              variantId: item.variantId,
              price: item.price,
              quantity: item.quantity,
              subtotal: item.subtotal || item.price * item.quantity,
              notes: item.notes,
            })) || [],
          },
        },
        include: { items: true },
      })
    })

    // Increment promo usage if voucher used
    if (voucherCode) {
      await db.promo.updateMany({
        where: { code: voucherCode },
        data: { usedCount: { increment: 1 } },
      })
    }

    return NextResponse.json({ order }, { status: 201 })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json({ error: 'Gagal membuat pesanan' }, { status: 500 })
  }
}
