import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format price (input in thousands, output in rupiah)
 * @param priceInThousands - Price in thousands (e.g., 25 = Rp 25.000)
 * @returns Formatted price string (e.g., "Rp 25.000")
 */
export const formatPrice = (priceInThousands: number): string => {
  return `Rp ${(priceInThousands * 1000).toLocaleString('id-ID')}`
}

/**
 * Format date to Indonesian locale
 * @param date - Date string or Date object
 * @returns Formatted date string (e.g., "15 Jan 2024, 14:30")
 */
export const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Validate phone number (Indonesian format)
 * @param phone - Phone number string
 * @returns True if valid Indonesian phone number
 */
export const isValidPhone = (phone: string): boolean => {
  const cleaned = phone.replace(/\D/g, '')
  return /^(08|628)\d{8,12}$/.test(cleaned)
}

/**
 * Clean phone number to international format (62xxx)
 * @param phone - Phone number string
 * @returns Cleaned phone number in international format
 */
export const cleanPhone = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.startsWith('08')) {
    return '62' + cleaned.substring(1)
  }
  return cleaned
}

/**
 * Generate unique order number
 * @returns Order number string (e.g., "SVC-ABC123-XYZ9")
 */
export const generateOrderNumber = (): string => {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `SVC-${timestamp}-${random}`
}

/**
 * Generate unique reservation code
 * @returns Reservation code string (e.g., "RSV-ABC123")
 */
export const generateReservationCode = (): string => {
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `RSV-${random}`
}
