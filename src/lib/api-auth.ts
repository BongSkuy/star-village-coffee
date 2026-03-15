import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { cookies } from 'next/headers'
import * as crypto from 'crypto'

// Simple session-based auth
// This creates a simple session cookie that doesn't rely on next-auth's complex JWT system

const SESSION_SECRET = process.env.NEXTAUTH_SECRET || 'dev-secret-change-in-production'

// Generate a simple session token
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

// Hash for verification
function hashToken(token: string): string {
  return crypto.createHmac('sha256', SESSION_SECRET).update(token).digest('hex')
}

/**
 * Create a simple admin session
 * Call this after successful login
 */
export async function createAdminSession(): Promise<string> {
  const token = generateSessionToken()
  const tokenHash = hashToken(token)
  
  // Store in database or just use the token itself
  // For simplicity, we'll use the token with a timestamp
  return `${token}.${Date.now()}`
}

/**
 * Check if request is authenticated
 * Simple cookie check - if the session cookie exists, user is authenticated
 */
export async function checkAuth(_req?: NextRequest): Promise<boolean> {
  try {
    const cookieStore = await cookies()
    
    // Check for our simple admin session cookie
    const adminSession = cookieStore.get('admin_session')?.value
    
    if (adminSession && adminSession.length > 5) {
      // Session exists and has a valid format
      return true
    }
    
    // Also check next-auth cookies as fallback
    const sessionCookie = 
      cookieStore.get('next-auth.session-token')?.value ||
      cookieStore.get('__Secure-next-auth.session-token')?.value
    
    if (sessionCookie) {
      // If next-auth cookie exists, user is authenticated via next-auth
      return true
    }
    
    return false
  } catch (error) {
    console.error('Auth check error:', error)
    return false
  }
}

/**
 * Middleware wrapper for protected API routes
 * Returns 401 Unauthorized if not authenticated
 */
export function withAuth(
  handler: (req: NextRequest, context?: any) => Promise<NextResponse>
) {
  return async (req: NextRequest, context?: any) => {
    const isAuth = await checkAuth(req)
    
    if (!isAuth) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Anda harus login terlebih dahulu' },
        { status: 401 }
      )
    }
    
    return handler(req, context)
  }
}

/**
 * Higher-order function to wrap API route handlers with auth
 */
export function authProtected(
  handler: (req: NextRequest, context?: any) => Promise<NextResponse>
) {
  return withAuth(handler)
}

/**
 * Create a validation error response
 */
export function validationErrorResponse(
  message: string,
  errors?: ZodError['errors'] | Array<{ message: string; path?: (string | number)[] }>
) {
  return NextResponse.json(
    {
      error: 'Validation Error',
      message,
      details: errors?.map(e => ({
        field: e.path?.join('.') || '',
        message: e.message
      }))
    },
    { status: 400 }
  )
}

/**
 * Helper to handle API errors consistently
 */
export function errorResponse(
  message: string,
  status: number = 500,
  error?: string
) {
  return NextResponse.json(
    { error: error || 'Error', message },
    { status }
  )
}

/**
 * Helper for success responses
 */
export function successResponse(data: any, status: number = 200) {
  return NextResponse.json(data, { status })
}
