import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import * as crypto from 'crypto'
import { cookies } from 'next/headers'

// Hash a password with SHA-256
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + (process.env.PASSWORD_SALT || 'star-village-2024')).digest('hex')
}

// Verify password against stored hash
function verifyPassword(password: string, storedHash: string): boolean {
  const hashedInput = hashPassword(password)
  return hashedInput === storedHash || password === storedHash
}

export async function GET(request: NextRequest) {
  try {
    // Check if admin password exists
    const passwordSetting = await db.cafeSetting.findUnique({
      where: { key: 'admin_password_hash' }
    })
    
    const legacyPasswordSetting = await db.cafeSetting.findUnique({
      where: { key: 'admin_password' }
    })
    
    return NextResponse.json({
      hasPassword: !!(passwordSetting?.value || legacyPasswordSetting?.value),
      hasHashedPassword: !!passwordSetting?.value,
      hasLegacyPassword: !!legacyPasswordSetting?.value,
      envPasswordSet: !!process.env.ADMIN_INITIAL_PASSWORD
    })
  } catch (error) {
    console.error('Check error:', error)
    return NextResponse.json({ error: 'Gagal mengecek status' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { password, action, masterKey, newPassword } = body

    // Handle reset password action
    if (action === 'reset-password') {
      // Master key for emergency reset - default: "starvillage2026master"
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
    }

    // Normal login flow
    if (!password) {
      return NextResponse.json({ error: 'Password diperlukan' }, { status: 400 })
    }

    // Check if password is correct
    let isAuthenticated = false

    // Check hashed password in DB
    const passwordSetting = await db.cafeSetting.findUnique({
      where: { key: 'admin_password_hash' }
    })

    // Legacy support - plain text password in DB
    const legacyPasswordSetting = await db.cafeSetting.findUnique({
      where: { key: 'admin_password' }
    })

    // Env variable (ADMIN_INITIAL_PASSWORD) - ALWAYS checked as fallback
    const envPassword = process.env.ADMIN_INITIAL_PASSWORD

    // Check database password first
    if (passwordSetting?.value) {
      isAuthenticated = verifyPassword(password, passwordSetting.value)
    }
    
    // Check legacy password
    if (!isAuthenticated && legacyPasswordSetting?.value) {
      isAuthenticated = password === legacyPasswordSetting.value
      // Migrate to hashed password
      if (isAuthenticated) {
        await db.cafeSetting.upsert({
          where: { key: 'admin_password_hash' },
          create: { key: 'admin_password_hash', value: hashPassword(password) },
          update: { value: hashPassword(password) }
        })
      }
    }
    
    // ALWAYS check env variable as fallback (this allows override)
    if (!isAuthenticated && envPassword && password === envPassword) {
      isAuthenticated = true
      // Update/create the hashed password in DB so next time it works from DB
      await db.cafeSetting.upsert({
        where: { key: 'admin_password_hash' },
        create: { key: 'admin_password_hash', value: hashPassword(password) },
        update: { value: hashPassword(password) }
      })
    }

    if (!isAuthenticated) {
      return NextResponse.json({ error: 'Password salah!' }, { status: 401 })
    }

    // Set session cookie
    const cookieStore = await cookies()
    const sessionToken = `${crypto.randomBytes(32).toString('hex')}.${Date.now()}`
    
    cookieStore.set('admin_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    })

    return NextResponse.json({ success: true, message: 'Login berhasil' })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan saat login' }, { status: 500 })
  }
}
