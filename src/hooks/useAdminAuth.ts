'use client'

import { signIn, signOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState, useCallback } from 'react'

/**
 * Hook for admin authentication
 * Uses NextAuth for secure session management
 */
export function useAdminAuth() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const isAuthenticated = status === 'authenticated' && session?.user?.role === 'admin'
  const isLoading = status === 'loading'

  const login = useCallback(async (password: string) => {
    setLoading(true)
    setError(null)

    try {
      const result = await signIn('credentials', {
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Password salah!')
        return false
      }

      if (result?.ok) {
        router.refresh()
        return true
      }

      setError('Terjadi kesalahan. Coba lagi.')
      return false
    } catch (err) {
      setError('Terjadi kesalahan. Coba lagi.')
      return false
    } finally {
      setLoading(false)
    }
  }, [router])

  const logout = useCallback(async () => {
    await signOut({ redirect: false })
    router.refresh()
  }, [router])

  return {
    isAuthenticated,
    isLoading,
    loading,
    error,
    login,
    logout,
    session,
  }
}
