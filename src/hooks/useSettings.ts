'use client'

import useSWR from 'swr'
import { DEFAULT_SETTINGS } from '@/lib/constants'

/**
 * Settings interface matching the database schema and DEFAULT_SETTINGS
 */
export interface Settings {
  whatsappNumber: string
  cafeName: string
  cafeTagline: string
  cafeLogo: string
  cafeHeroImage: string
  cafeHeroPositionX: string
  cafeHeroPositionY: string
  cafeHeroPositionXMobile: string
  cafeHeroPositionYMobile: string
  cafeAddress: string
  instagramHandle: string
  openHour: number
  closeHour: number
  // Payment settings
  bankBcaNumber: string
  bankBcaName: string
  bankMandiriNumber: string
  bankMandiriName: string
  qrisImage: string
  // Delivery settings
  staffDeliveryFee: number
  staffMaxDistance: number
  staffFreeDeliveryMin: number
  gosendEnabled: boolean
}

/**
 * Raw settings from API (key-value pairs with descriptions)
 */
interface ApiSettings {
  [key: string]: { value: string; description: string }
}

/**
 * Parse API settings response into typed Settings object
 */
function parseSettings(apiSettings: ApiSettings | undefined): Settings {
  if (!apiSettings) {
    return { ...DEFAULT_SETTINGS } as Settings
  }

  return {
    whatsappNumber: apiSettings.cafe_phone?.value || DEFAULT_SETTINGS.whatsappNumber,
    cafeName: apiSettings.cafe_name?.value || DEFAULT_SETTINGS.cafeName,
    cafeTagline: apiSettings.cafe_tagline?.value || DEFAULT_SETTINGS.cafeTagline,
    cafeLogo: apiSettings.cafe_logo?.value || DEFAULT_SETTINGS.cafeLogo,
    cafeHeroImage: apiSettings.cafe_hero_image?.value || DEFAULT_SETTINGS.cafeHeroImage,
    cafeHeroPositionX: apiSettings.cafe_hero_position_x?.value || DEFAULT_SETTINGS.cafeHeroPositionX,
    cafeHeroPositionY: apiSettings.cafe_hero_position_y?.value || DEFAULT_SETTINGS.cafeHeroPositionY,
    cafeHeroPositionXMobile: apiSettings.cafe_hero_position_x_mobile?.value || DEFAULT_SETTINGS.cafeHeroPositionXMobile,
    cafeHeroPositionYMobile: apiSettings.cafe_hero_position_y_mobile?.value || DEFAULT_SETTINGS.cafeHeroPositionYMobile,
    cafeAddress: apiSettings.cafe_address?.value || DEFAULT_SETTINGS.cafeAddress,
    instagramHandle: apiSettings.cafe_instagram?.value || DEFAULT_SETTINGS.instagramHandle,
    openHour: parseInt(apiSettings.open_hour?.value) || DEFAULT_SETTINGS.openHour,
    closeHour: parseInt(apiSettings.close_hour?.value) || DEFAULT_SETTINGS.closeHour,
    // Payment settings
    bankBcaNumber: apiSettings.bank_bca_number?.value || '',
    bankBcaName: apiSettings.bank_bca_name?.value || '',
    bankMandiriNumber: apiSettings.bank_mandiri_number?.value || '',
    bankMandiriName: apiSettings.bank_mandiri_name?.value || '',
    qrisImage: apiSettings.qris_image?.value || '',
    // Delivery settings
    staffDeliveryFee: parseInt(apiSettings.staff_delivery_fee?.value) || DEFAULT_SETTINGS.staffDeliveryFee,
    staffMaxDistance: parseInt(apiSettings.staff_max_distance?.value) || DEFAULT_SETTINGS.staffMaxDistance,
    staffFreeDeliveryMin: parseInt(apiSettings.staff_free_delivery_min?.value) || DEFAULT_SETTINGS.staffFreeDeliveryMin,
    gosendEnabled: apiSettings.gosend_enabled?.value === 'true',
  }
}

/**
 * SWR fetcher for settings
 */
const settingsFetcher = async (url: string): Promise<Settings> => {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error('Failed to fetch settings')
  }
  const json = await res.json()
  return parseSettings(json.settings)
}

/**
 * Hook to fetch and manage cafe settings
 * Uses SWR for caching and automatic revalidation
 * 
 * @example
 * ```tsx
 * const { settings, isLoading, error } = useSettings()
 * 
 * if (isLoading) return <Loading />
 * if (error) return <Error />
 * 
 * return <div>{settings.cafeName}</div>
 * ```
 */
export function useSettings() {
  const { data, error, isLoading, mutate } = useSWR<Settings>(
    '/api/settings',
    settingsFetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 60000, // Dedupe requests within 60 seconds
    }
  )

  return {
    settings: data ?? ({ ...DEFAULT_SETTINGS } as Settings),
    isLoading,
    error,
    refresh: mutate,
  }
}

/**
 * Hook for fetching settings without SWR (for one-time use)
 * Useful for server components or non-reactive contexts
 */
export async function fetchSettings(): Promise<Settings> {
  try {
    const res = await fetch('/api/settings')
    if (!res.ok) {
      return { ...DEFAULT_SETTINGS } as Settings
    }
    const json = await res.json()
    return parseSettings(json.settings)
  } catch {
    return { ...DEFAULT_SETTINGS } as Settings
  }
}
