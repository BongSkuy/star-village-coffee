import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withAuth } from '@/lib/api-auth'

// PUT - Update reservation (Admin only)
export const PUT = withAuth(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params
    const body = await request.json()
    const { status, notes, name, phone, email, date, time, guests } = body

    const reservation = await db.reservation.update({
      where: { id },
      data: {
        status: status || undefined,
        notes: notes !== undefined ? notes : undefined,
        name: name || undefined,
        phone: phone || undefined,
        email: email !== undefined ? email : undefined,
        date: date || undefined,
        time: time || undefined,
        guests: guests !== undefined ? parseInt(guests) : undefined,
      },
    })

    return NextResponse.json({ reservation })
  } catch (error) {
    console.error('Error updating reservation:', error)
    return NextResponse.json({ error: 'Gagal mengupdate reservasi' }, { status: 500 })
  }
})

// DELETE - Delete reservation (Admin only)
export const DELETE = withAuth(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params

    await db.reservation.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting reservation:', error)
    return NextResponse.json({ error: 'Gagal menghapus reservasi' }, { status: 500 })
  }
})
