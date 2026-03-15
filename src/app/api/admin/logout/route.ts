import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
  try {
    const cookieStore = await cookies()
    
    // Clear admin session cookie
    cookieStore.delete('admin_session')
    
    return NextResponse.json({ success: true, message: 'Logout berhasil' })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan saat logout' }, { status: 500 })
  }
}
