import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { db } from '@/lib/db'
import * as crypto from 'crypto'

// Generate a secure random password for initial setup
function generateSecurePassword(): string {
  return crypto.randomBytes(8).toString('hex') // 16 char random password
}

// Hash a password with SHA-256
export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + (process.env.PASSWORD_SALT || 'star-village-2024')).digest('hex')
}

// Verify password against stored hash
export function verifyPassword(password: string, storedHash: string): boolean {
  const hashedInput = hashPassword(password)
  return hashedInput === storedHash || password === storedHash // Support both plain and hashed
}

// Admin authentication options
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Admin',
      credentials: {
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.password) {
          return null
        }

        try {
          // Get admin password hash from settings
          const passwordSetting = await db.cafeSetting.findUnique({
            where: { key: 'admin_password_hash' }
          })

          // Legacy support: also check old plain text password
          const legacyPasswordSetting = await db.cafeSetting.findUnique({
            where: { key: 'admin_password' }
          })

          let isAuthenticated = false

          if (passwordSetting?.value) {
            // Use hashed password verification
            isAuthenticated = verifyPassword(credentials.password, passwordSetting.value)
          } else if (legacyPasswordSetting?.value) {
            // Legacy plain text comparison (will be migrated)
            isAuthenticated = credentials.password === legacyPasswordSetting.value
            // Migrate to hashed password
            if (isAuthenticated) {
              await db.cafeSetting.upsert({
                where: { key: 'admin_password_hash' },
                create: { key: 'admin_password_hash', value: hashPassword(credentials.password) },
                update: { value: hashPassword(credentials.password) }
              })
            }
          } else {
            // First time setup - create initial password
            const initialPassword = process.env.ADMIN_INITIAL_PASSWORD || generateSecurePassword()
            const hashedPassword = hashPassword(initialPassword)
            
            await db.cafeSetting.create({
              data: { key: 'admin_password_hash', value: hashedPassword }
            })
            
            // Log the initial password (in production, this should be sent securely)
            console.log('🔐 Initial admin password created:', initialPassword)
            console.log('⚠️  Please change this password immediately after first login!')
            
            // If env var is set, verify against it
            if (process.env.ADMIN_INITIAL_PASSWORD && credentials.password === process.env.ADMIN_INITIAL_PASSWORD) {
              isAuthenticated = true
            }
          }

          if (isAuthenticated) {
            return {
              id: 'admin',
              name: 'Admin',
              email: 'admin@starvillage.coffee',
              role: 'admin',
            }
          }

          return null
        } catch (error) {
          console.error('Auth error:', error)
          
          // Emergency fallback - only if environment variable is set
          const emergencyPassword = process.env.ADMIN_EMERGENCY_PASSWORD
          if (emergencyPassword && credentials.password === emergencyPassword) {
            return {
              id: 'admin',
              name: 'Admin',
              email: 'admin@starvillage.coffee',
              role: 'admin',
            }
          }
          
          return null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  pages: {
    signIn: '/admin',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = 'admin'
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string
      }
      return session
    }
  },
  // Use environment variable for secret (required for production)
  // Must match the secret used in api-auth.ts for token verification
  secret: process.env.NEXTAUTH_SECRET || 'dev-secret-change-in-production',
  // Enable debug in development only
  debug: process.env.NODE_ENV === 'development',
}

// Type extensions for next-auth
declare module 'next-auth' {
  interface Session {
    user: {
      name?: string | null
      email?: string | null
      image?: string | null
      role?: string
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: string
  }
}
