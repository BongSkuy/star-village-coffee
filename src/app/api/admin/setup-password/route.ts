import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import * as crypto from 'crypto'

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + (process.env.PASSWORD_SALT || 'star-village-2024')).digest('hex')
}

// Set admin password - requires secret key for security
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { newPassword, secretKey } = body

    // Simple security - require a secret key
    // Default key is 'star-village-setup-2024' or set ADMIN_SETUP_KEY env var
    const validSecretKey = process.env.ADMIN_SETUP_KEY || 'star-village-setup-2024'
    
    if (secretKey !== validSecretKey) {
      return NextResponse.json({ error: 'Invalid secret key' }, { status: 403 })
    }

    if (!newPassword || newPassword.length < 4) {
      return NextResponse.json({ error: 'Password minimal 4 karakter' }, { status: 400 })
    }

    // Hash the new password
    const hashedPassword = hashPassword(newPassword)

    // Upsert the password
    await db.cafeSetting.upsert({
      where: { key: 'admin_password_hash' },
      create: { 
        key: 'admin_password_hash', 
        value: hashedPassword,
        description: 'Hashed admin password'
      },
      update: { value: hashedPassword }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Password admin berhasil diset!',
      password: newPassword,
      hint: `Sekarang login dengan password tersebut`
    })
  } catch (error) {
    console.error('Setup error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

// GET - Just info
export async function GET() {
  return NextResponse.json({
    message: 'POST to this endpoint with { "newPassword": "your-password", "secretKey": "star-village-setup-2024" } to set admin password'
  })
}
