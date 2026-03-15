import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('admin_session')?.value
    
    if (sessionToken) {
      // Session exists and is valid
      return NextResponse.json({ 
        authenticated: true,
        message: 'Session valid' 
      })
    }
    
    // No session found
    return NextResponse.json({ 
      authenticated: false,
      message: 'No valid session' 
    }, { status: 401 })
  } catch (error) {
    console.error('Verify session error:', error)
    return NextResponse.json({ 
      authenticated: false,
      error: 'Failed to verify session' 
    }, { status: 500 })
  }
}
