import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, subtotal } = body

    if (!code) {
      return NextResponse.json({ valid: false, error: 'Kode voucher diperlukan' })
    }

    // Find promo by code
    const promo = await db.promo.findUnique({
      where: { code: code.toUpperCase() },
    })

    if (!promo) {
      return NextResponse.json({ valid: false, error: 'Kode voucher tidak ditemukan' })
    }

    // Check if active
    if (!promo.isActive) {
      return NextResponse.json({ valid: false, error: 'Voucher sudah tidak aktif' })
    }

    // Check expiry
    if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) {
      return NextResponse.json({ valid: false, error: 'Voucher sudah kedaluwarsa' })
    }

    // Check usage limit
    if (promo.maxUses && promo.usedCount >= promo.maxUses) {
      return NextResponse.json({ valid: false, error: 'Voucher sudah mencapai batas penggunaan' })
    }

    // Check minimum purchase
    if (subtotal && subtotal < promo.minPurchase) {
      return NextResponse.json({ 
        valid: false, 
        error: `Minimum pembelian ${promo.minPurchase * 1000}K untuk voucher ini` 
      })
    }

    return NextResponse.json({ 
      valid: true, 
      promo: {
        code: promo.code,
        discount: promo.discount,
        minPurchase: promo.minPurchase,
      }
    })
  } catch (error) {
    console.error('Error validating promo:', error)
    return NextResponse.json({ valid: false, error: 'Gagal memvalidasi voucher' }, { status: 500 })
  }
}
