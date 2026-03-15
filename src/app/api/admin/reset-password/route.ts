import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import * as crypto from 'crypto'

// Hash a password with SHA-256
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + (process.env.PASSWORD_SALT || 'star-village-2024')).digest('hex')
}

// This endpoint allows resetting the admin password with a master key
// Master key is hardcoded as fallback: "starvillage2026master"
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { newPassword, masterKey } = body

    // Master key for emergency reset
    // Can be overridden with env variable ADMIN_MASTER_KEY
    const validMasterKey = process.env.ADMIN_MASTER_KEY || 'starvillage2026master'
    
    if (masterKey !== validMasterKey) {
      return NextResponse.json({ error: 'Master key tidak valid' }, { status: 401 })
    }

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json({ error: 'Password baru minimal 6 karakter' }, { status: 400 })
    }

    // Create/update hashed password
    const hashedPassword = hashPassword(newPassword)
    
    await db.cafeSetting.upsert({
      where: { key: 'admin_password_hash' },
      create: { key: 'admin_password_hash', value: hashedPassword },
      update: { value: hashedPassword }
    })

    // Remove legacy password if exists
    try {
      await db.cafeSetting.delete({
        where: { key: 'admin_password' }
      })
    } catch {}

    return NextResponse.json({ 
      success: true, 
      message: 'Password admin berhasil direset! Silakan login dengan password baru.' 
    })
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json({ error: 'Gagal mereset password' }, { status: 500 })
  }
}
