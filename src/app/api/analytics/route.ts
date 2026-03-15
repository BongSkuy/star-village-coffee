import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Analytics data for orders and reservations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'daily' // daily, weekly, monthly, custom
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Build date filter
    let dateFilter: any = {}
    const now = new Date()
    
    if (period === 'custom' && startDate && endDate) {
      dateFilter = {
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)),
        }
      }
    } else if (period === 'daily') {
      // Today
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      dateFilter = {
        createdAt: {
          gte: today,
          lte: now,
        }
      }
    } else if (period === 'weekly') {
      // Last 7 days
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      dateFilter = {
        createdAt: {
          gte: weekAgo,
          lte: now,
        }
      }
    } else if (period === 'monthly') {
      // Last 30 days
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      dateFilter = {
        createdAt: {
          gte: monthAgo,
          lte: now,
        }
      }
    }

    // ============ ORDERS ANALYTICS ============
    const orders = await db.order.findMany({
      where: dateFilter,
      include: {
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    const totalOrders = orders.length
    const completedOrders = orders.filter(o => o.status === 'completed')
    const pendingOrders = orders.filter(o => o.status === 'pending')
    const cancelledOrders = orders.filter(o => o.status === 'cancelled')
    const processingOrders = orders.filter(o => ['confirmed', 'processing', 'delivering'].includes(o.status))

    const totalRevenue = completedOrders.reduce((sum, o) => sum + o.total, 0)
    const totalDeliveryFee = orders.reduce((sum, o) => sum + (o.deliveryFee || 0), 0)
    const totalDiscount = orders.reduce((sum, o) => sum + (o.discount || 0), 0)

    const pickupOrders = orders.filter(o => o.orderType === 'pickup')
    const deliveryOrders = orders.filter(o => o.orderType === 'delivery')

    const paymentMethods = orders.reduce((acc, o) => {
      const method = o.paymentMethod || 'cod'
      acc[method] = (acc[method] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const orderSources = orders.reduce((acc, o) => {
      const source = o.source || 'website'
      acc[source] = (acc[source] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Top selling items
    const itemSales: Record<string, { name: string; quantity: number; revenue: number }> = {}
    orders.forEach(order => {
      order.items.forEach(item => {
        const key = `${item.itemName}${item.variantName ? ` (${item.variantName})` : ''}`
        if (!itemSales[key]) {
          itemSales[key] = { name: key, quantity: 0, revenue: 0 }
        }
        itemSales[key].quantity += item.quantity
        itemSales[key].revenue += item.subtotal
      })
    })

    const topSellingItems = Object.values(itemSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10)

    // Daily breakdown
    const dailyBreakdown: Record<string, { date: string; orders: number; revenue: number; reservations: number }> = {}
    orders.forEach(order => {
      const dateKey = order.createdAt.toISOString().split('T')[0]
      if (!dailyBreakdown[dateKey]) {
        dailyBreakdown[dateKey] = { date: dateKey, orders: 0, revenue: 0, reservations: 0 }
      }
      dailyBreakdown[dateKey].orders += 1
      if (order.status === 'completed') {
        dailyBreakdown[dateKey].revenue += order.total
      }
    })

    // Hourly breakdown
    const hourlyBreakdown: Record<number, { hour: number; orders: number }> = {}
    for (let i = 0; i < 24; i++) {
      hourlyBreakdown[i] = { hour: i, orders: 0 }
    }
    orders.forEach(order => {
      const hour = order.createdAt.getHours()
      hourlyBreakdown[hour].orders += 1
    })

    const avgOrderValue = completedOrders.length > 0 
      ? totalRevenue / completedOrders.length 
      : 0

    const peakHours = Object.values(hourlyBreakdown)
      .sort((a, b) => b.orders - a.orders)
      .slice(0, 5)
      .filter(h => h.orders > 0)

    // ============ RESERVATIONS ANALYTICS ============
    const reservations = await db.reservation.findMany({
      where: dateFilter,
      orderBy: { createdAt: 'desc' },
    })

    const totalReservations = reservations.length
    const confirmedReservations = reservations.filter(r => r.status === 'confirmed')
    const pendingReservations = reservations.filter(r => r.status === 'pending')
    const completedReservations = reservations.filter(r => r.status === 'completed')
    const cancelledReservations = reservations.filter(r => r.status === 'cancelled')

    // Total guests
    const totalGuests = reservations.reduce((sum, r) => sum + r.guests, 0)
    const avgGuestsPerReservation = totalReservations > 0 
      ? Math.round(totalGuests / totalReservations) 
      : 0

    // Seating type breakdown
    const indoorReservations = reservations.filter(r => r.seatingType === 'indoor')
    const outdoorReservations = reservations.filter(r => r.seatingType === 'outdoor')

    // Popular time slots
    const timeSlotBreakdown: Record<string, number> = {}
    reservations.forEach(r => {
      const hour = parseInt(r.time.split(':')[0])
      const slot = `${hour}:00 - ${hour + 1}:00`
      timeSlotBreakdown[slot] = (timeSlotBreakdown[slot] || 0) + 1
    })

    const popularTimeSlots = Object.entries(timeSlotBreakdown)
      .map(([slot, count]) => ({ slot, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // Popular days (by reservation date, not created date)
    const dayBreakdown: Record<string, number> = {}
    reservations.forEach(r => {
      const dayName = new Date(r.date).toLocaleDateString('id-ID', { weekday: 'long' })
      dayBreakdown[dayName] = (dayBreakdown[dayName] || 0) + 1
    })

    const popularDays = Object.entries(dayBreakdown)
      .map(([day, count]) => ({ day, count }))
      .sort((a, b) => b.count - a.count)

    // Daily reservations for chart
    reservations.forEach(r => {
      const dateKey = r.createdAt.toISOString().split('T')[0]
      if (!dailyBreakdown[dateKey]) {
        dailyBreakdown[dateKey] = { date: dateKey, orders: 0, revenue: 0, reservations: 0 }
      }
      dailyBreakdown[dateKey].reservations += 1
    })

    const chartData = Object.values(dailyBreakdown).sort((a, b) => a.date.localeCompare(b.date))

    // Today's reservations (for dashboard)
    const today = new Date().toISOString().split('T')[0]
    const todayReservations = reservations.filter(r => r.date === today)

    // Upcoming reservations (future dates)
    const upcomingReservations = reservations.filter(r => {
      const resDate = new Date(r.date)
      return resDate >= new Date(today) && r.status !== 'cancelled'
    })

    return NextResponse.json({
      period,
      dateRange: {
        start: dateFilter.createdAt?.gte || null,
        end: dateFilter.createdAt?.lte || null,
      },
      // Orders data
      orders: {
        summary: {
          totalOrders,
          completedOrders: completedOrders.length,
          pendingOrders: pendingOrders.length,
          cancelledOrders: cancelledOrders.length,
          processingOrders: processingOrders.length,
          totalRevenue,
          totalDeliveryFee,
          totalDiscount,
          avgOrderValue,
        },
        orderTypes: {
          pickup: pickupOrders.length,
          delivery: deliveryOrders.length,
        },
        paymentMethods,
        orderSources,
        topSellingItems,
        peakHours,
        list: orders.map(o => ({
          id: o.id,
          orderNumber: o.orderNumber,
          customerName: o.customerName,
          customerPhone: o.customerPhone,
          customerEmail: o.customerEmail,
          items: o.items,
          subtotal: o.subtotal,
          discount: o.discount,
          deliveryFee: o.deliveryFee,
          total: o.total,
          status: o.status,
          paymentMethod: o.paymentMethod,
          paymentStatus: o.paymentStatus,
          orderType: o.orderType,
          deliveryAddress: o.deliveryAddress,
          source: o.source,
          notes: o.notes,
          createdAt: o.createdAt,
        })),
      },
      // Reservations data
      reservations: {
        summary: {
          totalReservations,
          confirmedReservations: confirmedReservations.length,
          pendingReservations: pendingReservations.length,
          completedReservations: completedReservations.length,
          cancelledReservations: cancelledReservations.length,
          totalGuests,
          avgGuestsPerReservation,
        },
        seatingTypes: {
          indoor: indoorReservations.length,
          outdoor: outdoorReservations.length,
        },
        popularTimeSlots,
        popularDays,
        todayReservations: todayReservations.length,
        upcomingReservations: upcomingReservations.length,
        list: reservations.map(r => ({
          id: r.id,
          reservationCode: r.reservationCode,
          name: r.name,
          phone: r.phone,
          email: r.email,
          date: r.date,
          time: r.time,
          guests: r.guests,
          seatingType: r.seatingType,
          status: r.status,
          notes: r.notes,
          adminNotes: r.adminNotes,
          createdAt: r.createdAt,
        })),
      },
      chartData,
      hourlyData: Object.values(hourlyBreakdown),
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json({ error: 'Gagal mengambil data analisis' }, { status: 500 })
  }
}
