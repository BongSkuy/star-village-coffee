/**
 * Default cafe settings
 * Used as fallback when database settings are not available
 */
export const DEFAULT_SETTINGS = {
  whatsappNumber: '6282148615641',
  cafeName: 'Star Village Coffee',
  cafeTagline: 'Start Your Vibes Here',
  cafeLogo: '/images/logo.png',
  cafeHeroImage: '',
  cafeHeroPositionX: 'center',
  cafeHeroPositionY: 'center',
  cafeHeroPositionXMobile: 'center',
  cafeHeroPositionYMobile: 'center',
  cafeAddress: 'Jl. Tentara Pelajar, Dusun 3, Kiringan, Boyolali, Jawa Tengah',
  instagramHandle: 'starvillage.coffee',
  openHour: 10,
  closeHour: 23,
  // Payment settings
  bankBcaNumber: '',
  bankBcaName: '',
  bankMandiriNumber: '',
  bankMandiriName: '',
  qrisImage: '',
  // Delivery settings
  staffDeliveryFee: 5,
  staffMaxDistance: 10,
  staffFreeDeliveryMin: 100,
  gosendEnabled: true,
} as const

/**
 * Cafe coordinates for map and delivery calculations
 */
export const CAFE_COORDINATES = {
  lat: -7.512980736484782,
  lng: 110.59586423434448,
} as const

/**
 * Default delivery zones
 * Distance in km, fee and minOrder in thousands (K)
 */
export const DELIVERY_ZONES = [
  { name: 'Zona 1', minDistance: 0, maxDistance: 2, fee: 5, minOrder: 20 },
  { name: 'Zona 2', minDistance: 2, maxDistance: 4, fee: 8, minOrder: 30 },
  { name: 'Zona 3', minDistance: 4, maxDistance: 6, fee: 12, minOrder: 40 },
] as const

/**
 * Order status configuration
 */
export const ORDER_STATUS = {
  pending: { label: 'Menunggu Konfirmasi', color: 'bg-yellow-500', step: 1 },
  confirmed: { label: 'Dikonfirmasi', color: 'bg-blue-500', step: 2 },
  processing: { label: 'Sedang Diproses', color: 'bg-purple-500', step: 3 },
  delivering: { label: 'Sedang Diantar', color: 'bg-cyan-500', step: 4 },
  completed: { label: 'Selesai', color: 'bg-green-600', step: 5 },
  cancelled: { label: 'Dibatalkan', color: 'bg-red-500', step: 0 },
} as const

/**
 * Payment status configuration
 */
export const PAYMENT_STATUS = {
  pending: { label: 'Menunggu Pembayaran', color: 'bg-orange-500' },
  waiting_confirmation: { label: 'Menunggu Verifikasi', color: 'bg-yellow-500' },
  paid: { label: 'Sudah Dibayar', color: 'bg-green-500' },
  refunded: { label: 'Dikembalikan', color: 'bg-gray-500' },
} as const

/**
 * Reservation status configuration
 */
export const RESERVATION_STATUS = {
  pending: { label: 'Menunggu Konfirmasi', color: 'bg-yellow-500' },
  confirmed: { label: 'Dikonfirmasi', color: 'bg-green-500' },
  completed: { label: 'Selesai', color: 'bg-blue-500' },
  cancelled: { label: 'Dibatalkan', color: 'bg-red-500' },
} as const

/**
 * Category mapping for menu filtering
 */
export const CATEGORY_MAPPING: Record<string, string[]> = {
  coffee: ['classic-coffee', 'signature-coffee', 'manual-brew', 'coffee-mocktail', 'kopi-susu'],
  'non-coffee': ['milky-base', 'mocktail', 'tea-selection', 'juice', 'my-bottle'],
  food: ['food', 'mie', 'burger'],
  snacks: ['snack', 'roti-bakar', 'toast'],
}

/**
 * Google Maps embed URL for the cafe
 */
export const GOOGLE_MAPS_EMBED = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3955.6481453086187!2d110.59482667477042!3d-7.5129947!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e7a6f1a40a98545%3A0xc05befafa594328!2sStar%20Village!5e0!3m2!1sen!2sid!4v1699999999999!5m2!1sen!2sid'

/**
 * Cafe facilities
 */
export const FACILITIES = [
  { name: 'Free Wi-Fi', icon: 'wifi' },
  { name: 'Stop Kontak', icon: 'power' },
  { name: 'Games', icon: 'gamepad2' },
  { name: 'Mushola', icon: 'building' },
  { name: 'Area Luas', icon: 'users' },
  { name: 'Cozy Vibes', icon: 'heart' },
] as const
