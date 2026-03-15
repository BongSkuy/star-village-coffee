import { z } from 'zod'

// ==================== ORDER SCHEMAS ====================

export const orderItemSchema = z.object({
  itemId: z.string().min(1, 'Item ID diperlukan'),
  itemName: z.string().min(1, 'Nama item diperlukan'),
  variantName: z.string().optional().nullable(),
  variantId: z.string().optional().nullable(),
  price: z.number().min(0, 'Harga tidak valid'),
  quantity: z.number().int().min(1, 'Quantity minimal 1'),
  subtotal: z.number().min(0, 'Subtotal tidak valid'),
  notes: z.string().max(200).optional().nullable(),
})

export const createOrderSchema = z.object({
  customerName: z.string().min(2, 'Nama minimal 2 karakter').max(100),
  customerPhone: z.string().min(10, 'Nomor telepon tidak valid').max(15),
  customerEmail: z.string().email('Email tidak valid').optional().nullable(),
  subtotal: z.number().min(0),
  discount: z.number().min(0).default(0),
  voucherCode: z.string().optional().nullable(),
  total: z.number().min(0),
  status: z.enum(['pending', 'confirmed', 'processing', 'delivering', 'completed', 'cancelled']).default('pending'),
  paymentStatus: z.enum(['pending', 'waiting_confirmation', 'paid', 'refunded']).default('pending'),
  paymentMethod: z.enum(['cash', 'transfer', 'qris', 'cod']).default('cod'),
  notes: z.string().max(500).optional().nullable(),
  source: z.enum(['website', 'whatsapp', 'walkin']).default('website'),
  orderType: z.enum(['pickup', 'delivery']).default('pickup'),
  deliveryAddress: z.string().optional().nullable(),
  deliveryNotes: z.string().max(500).optional().nullable(),
  deliveryFee: z.number().min(0).default(0),
  deliveryMethod: z.enum(['staff', 'gosend']).optional().nullable(),
  deliveryLat: z.number().optional().nullable(),
  deliveryLng: z.number().optional().nullable(),
  deliveryDistance: z.number().min(0).optional().nullable(),
  deliveryZone: z.string().optional().nullable(),
  estimatedTime: z.string().optional().nullable(),
  items: z.array(orderItemSchema).min(1, 'Minimal 1 item diperlukan'),
})

export const updateOrderSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'processing', 'delivering', 'completed', 'cancelled']).optional(),
  paymentStatus: z.enum(['pending', 'waiting_confirmation', 'paid', 'refunded']).optional(),
  paymentVerified: z.boolean().optional(),
  paymentRejected: z.boolean().optional(),
  notes: z.string().max(500).optional().nullable(),
  paymentProofImage: z.string().optional().nullable(),
  customerConfirmed: z.boolean().optional(),
})

// ==================== RESERVATION SCHEMAS ====================

export const createReservationSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter').max(100),
  phone: z.string().min(10, 'Nomor telepon tidak valid').max(15),
  email: z.string().email('Email tidak valid').optional().nullable().or(z.literal('')),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal tidak valid'),
  time: z.string().regex(/^\d{2}:\d{2}$/, 'Format waktu tidak valid'),
  guests: z.number().int().min(1, 'Minimal 1 tamu').max(50, 'Maksimal 50 tamu'),
  seatingType: z.enum(['indoor', 'outdoor']).default('indoor'),
  notes: z.string().max(500).optional().nullable(),
})

export const updateReservationSchema = z.object({
  id: z.string().min(1),
  status: z.enum(['pending', 'confirmed', 'completed', 'cancelled']).optional(),
  adminNotes: z.string().max(500).optional().nullable(),
})

// ==================== MENU SCHEMAS ====================

export const variantSchema = z.object({
  name: z.string().min(1, 'Nama varian diperlukan'),
  price: z.number().min(0, 'Harga tidak valid'),
})

export const createMenuItemSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter').max(100),
  description: z.string().max(500).optional().nullable(),
  image: z.string().url('URL gambar tidak valid').optional().nullable().or(z.literal('')),
  categoryId: z.string().min(1, 'Kategori diperlukan'),
  variants: z.array(variantSchema).min(1, 'Minimal 1 varian diperlukan'),
  stock: z.number().int().min(0, 'Stok tidak valid').default(100),
  isPopular: z.boolean().default(false),
  isNew: z.boolean().default(false),
  isPromo: z.boolean().default(false),
  isAvailable: z.boolean().default(true),
})

export const updateMenuItemSchema = createMenuItemSchema.extend({
  id: z.string().min(1, 'ID diperlukan'),
})

// ==================== CATEGORY SCHEMAS ====================

export const createCategorySchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter').max(50),
  icon: z.string().max(50).optional().nullable(),
  order: z.number().int().min(0).optional(),
})

export const updateCategorySchema = createCategorySchema.extend({
  id: z.string().min(1, 'ID diperlukan'),
})

// ==================== PROMO SCHEMAS ====================

export const createPromoSchema = z.object({
  code: z.string().min(3, 'Kode minimal 3 karakter').max(20).toUpperCase(),
  discount: z.number().min(1, 'Diskon minimal 1%').max(100, 'Diskon maksimal 100%'),
  minPurchase: z.number().min(0, 'Minimal pembelian tidak valid').default(0),
  maxUses: z.number().int().min(1).optional().nullable(),
  expiresAt: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
})

export const updatePromoSchema = createPromoSchema.extend({
  id: z.string().min(1, 'ID diperlukan'),
})

// ==================== SETTINGS SCHEMAS ====================

export const settingsSchema = z.object({
  cafe_name: z.string().max(100).optional(),
  cafe_tagline: z.string().max(200).optional(),
  cafe_description: z.string().max(1000).optional(),
  cafe_address: z.string().max(500).optional(),
  cafe_phone: z.string().max(20).optional(),
  cafe_instagram: z.string().max(50).optional(),
  cafe_logo: z.string().optional(),
  cafe_hero_image: z.string().optional(),
  cafe_hero_position_x: z.enum(['left', 'center', 'right']).optional(),
  cafe_hero_position_y: z.enum(['top', 'center', 'bottom']).optional(),
  cafe_hero_position_x_mobile: z.enum(['left', 'center', 'right']).optional(),
  cafe_hero_position_y_mobile: z.enum(['top', 'center', 'bottom']).optional(),
  open_hour: z.string().regex(/^\d{1,2}$/, 'Jam tidak valid').optional(),
  close_hour: z.string().regex(/^\d{1,2}$/, 'Jam tidak valid').optional(),
  bank_bca_number: z.string().max(30).optional(),
  bank_bca_name: z.string().max(100).optional(),
  bank_mandiri_number: z.string().max(30).optional(),
  bank_mandiri_name: z.string().max(100).optional(),
  qris_image: z.string().optional(),
  whatsapp_admin: z.string().max(20).optional(),
  staff_delivery_fee: z.string().optional(),
  staff_max_distance: z.string().optional(),
  staff_free_delivery_min: z.string().optional(),
  gosend_enabled: z.string().optional(),
})

// ==================== GALLERY SCHEMAS ====================

export const createGallerySchema = z.object({
  title: z.string().max(100).optional().nullable(),
  description: z.string().max(500).optional().nullable(),
  imageUrl: z.string().url('URL gambar tidak valid'),
})

export const createGalleryImageSchema = createGallerySchema

export const reorderGallerySchema = z.object({
  orders: z.array(z.object({
    id: z.string(),
    order: z.number().int().min(0)
  }))
})

// ==================== NEWSLETTER SCHEMAS ====================

export const subscribeNewsletterSchema = z.object({
  email: z.string().email('Email tidak valid'),
  name: z.string().max(100).optional().nullable(),
})

// ==================== LOYALTY SCHEMAS ====================

export const checkLoyaltySchema = z.object({
  phone: z.string().min(10, 'Nomor telepon tidak valid'),
})

export const redeemPointsSchema = z.object({
  phone: z.string().min(10, 'Nomor telepon tidak valid'),
  points: z.number().int().min(1, 'Minimal 1 poin'),
})

// ==================== DELIVERY SCHEMAS ====================

export const checkDeliverySchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
})

export const deliveryZonesSchema = z.object({
  zones: z.array(z.object({
    id: z.string().optional(),
    name: z.string(),
    minDistance: z.number().min(0),
    maxDistance: z.number().min(0),
    fee: z.number().min(0),
    minOrder: z.number().min(0),
  }))
})

export const updateDeliveryZonesSchema = deliveryZonesSchema

// ==================== VALIDATION HELPER ====================

/**
 * Validate data against a Zod schema
 * Returns parsed data or throws with formatted error message
 */
export function validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data)
  
  if (!result.success) {
    const firstError = result.error.errors[0]
    throw new Error(firstError?.message || 'Validation failed')
  }
  
  return result.data
}

/**
 * Validate and return error message string or null
 */
export function validateOrError<T>(schema: z.ZodSchema<T>, data: unknown): { data: T; error: null } | { data: null; error: string } {
  const result = schema.safeParse(data)
  
  if (!result.success) {
    const firstError = result.error.errors[0]
    return { data: null, error: firstError?.message || 'Validation failed' }
  }
  
  return { data: result.data, error: null }
}
