import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import * as crypto from 'crypto'

// Hash a password with SHA-256
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + (process.env.PASSWORD_SALT || 'star-village-2024')).digest('hex')
}

export async function GET() {
  try {
    // Check if admin password already exists
    const existingPassword = await db.cafeSetting.findUnique({
      where: { key: 'admin_password_hash' }
    })
    
    const legacyPassword = await db.cafeSetting.findUnique({
      where: { key: 'admin_password' }
    })
    
    return NextResponse.json({
      hasPassword: !!(existingPassword?.value || legacyPassword?.value),
      hasHashedPassword: !!existingPassword?.value,
      hasLegacyPassword: !!legacyPassword?.value,
    })
  } catch (error) {
    console.error('Setup check error:', error)
    return NextResponse.json({ error: 'Gagal mengecek status' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { password, setupKey } = body

    // Simple security - require setup key to prevent unauthorized setup
    // Default setup key is "starvillage2026"
    const validSetupKey = process.env.ADMIN_SETUP_KEY || 'starvillage2026'
    
    if (setupKey !== validSetupKey) {
      return NextResponse.json({ error: 'Setup key tidak valid' }, { status: 401 })
    }

    if (!password || password.length < 6) {
      return NextResponse.json({ error: 'Password minimal 6 karakter' }, { status: 400 })
    }

    // Check if password already exists
    const existingPassword = await db.cafeSetting.findUnique({
      where: { key: 'admin_password_hash' }
    })

    if (existingPassword?.value) {
      return NextResponse.json({ error: 'Password admin sudah ada. Gunakan fitur ganti password.' }, { status: 400 })
    }

    // Create hashed password
    const hashedPassword = hashPassword(password)
    
    await db.cafeSetting.upsert({
      where: { key: 'admin_password_hash' },
      create: { key: 'admin_password_hash', value: hashedPassword },
      update: { value: hashedPassword }
    })

    // Remove legacy password if exists
    await db.cafeSetting.deleteMany({
      where: { key: 'admin_password' }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Password admin berhasil dibuat! Silakan login dengan password baru.' 
    })
  } catch (error) {
    console.error('Setup error:', error)
    return NextResponse.json({ error: 'Gagal membuat password' }, { status: 500 })
  }
}
