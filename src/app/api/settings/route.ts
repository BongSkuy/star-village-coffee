import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withAuth } from '@/lib/api-auth'

// Default settings
const DEFAULT_SETTINGS: Record<string, { value: string; description: string }> = {
  cafe_name: { value: 'Star Village Coffee', description: 'Nama kafe' },
  cafe_tagline: { value: 'Your Daily Dose of Happiness', description: 'Tagline kafe' },
  cafe_description: { value: '', description: 'Deskripsi kafe' },
  cafe_address: { value: 'Jl. Tentara Pelajar, Dusun 3, Kiringan, Boyolali, Jawa Tengah', description: 'Alamat kafe' },
  cafe_phone: { value: '6281225448358', description: 'Nomor telepon/WhatsApp' },
  cafe_instagram: { value: '@starvillage.coffee', description: 'Instagram handle' },
  cafe_email: { value: 'hello@starvillage.coffee', description: 'Email kafe' },
  cafe_logo: { value: '/images/logo.png', description: 'Logo cafe URL' },
  cafe_hero_image: { value: '', description: 'Foto hero section URL' },
  cafe_og_image: { value: '/images/logo.png', description: 'Foto preview saat share link (WhatsApp, Facebook, dll). Ukuran ideal: 1200x630px' },
  cafe_hero_position_x: { value: 'center', description: 'Posisi horizontal foto hero - Desktop (left, center, right)' },
  cafe_hero_position_y: { value: 'center', description: 'Posisi vertikal foto hero - Desktop (top, center, bottom)' },
  cafe_hero_position_x_mobile: { value: 'center', description: 'Posisi horizontal foto hero - Mobile (left, center, right)' },
  cafe_hero_position_y_mobile: { value: 'center', description: 'Posisi vertikal foto hero - Mobile (top, center, bottom)' },
  open_hour: { value: '10', description: 'Jam buka (format 24 jam)' },
  close_hour: { value: '23', description: 'Jam tutup (format 24 jam)' },
  currency: { value: 'IDR', description: 'Mata uang' },
  price_unit: { value: 'K', description: 'Satuan harga (K = ribuan)' },
  
  // Payment settings
  bank_bca_number: { value: '', description: 'Nomor rekening BCA' },
  bank_bca_name: { value: '', description: 'Nama pemilik rekening BCA' },
  bank_mandiri_number: { value: '', description: 'Nomor rekening Mandiri' },
  bank_mandiri_name: { value: '', description: 'Nama pemilik rekening Mandiri' },
  qris_image: { value: '', description: 'URL gambar QRis' },
  
  // Delivery settings
  staff_delivery_fee: { value: '5', description: 'Biaya delivery per km (dalam ribuan)' },
  staff_max_distance: { value: '10', description: 'Jarak maksimum delivery staff (km)' },
  staff_free_delivery_min: { value: '100', description: 'Minimal order untuk gratis ongkir (dalam ribuan)' },
  gosend_enabled: { value: 'true', description: 'Aktifkan opsi GoSend' },
  
  // Notification settings
  whatsapp_admin: { value: '6281225448358', description: 'Nomor WhatsApp admin untuk notifikasi' },
}

// GET - Get all settings (public for display)
export async function GET(request: NextRequest) {
  try {
    let settings: { key: string; value: string; description: string | null }[] = []
    
    try {
      settings = await db.cafeSetting.findMany()
    } catch (dbError) {
      console.error('Database error in GET settings:', dbError)
      // Return defaults if database fails
      return NextResponse.json({ 
        settings: DEFAULT_SETTINGS,
        warning: 'Database tidak tersedia, menampilkan pengaturan default'
      })
    }
    
    // Merge with defaults
    const allSettings: Record<string, { value: string; description: string }> = { ...DEFAULT_SETTINGS }
    settings.forEach(s => {
      // Skip admin_password_hash for security
      if (s.key !== 'admin_password_hash' && s.key !== 'admin_password') {
        allSettings[s.key] = { value: s.value, description: s.description || '' }
      }
    })

    return NextResponse.json({ settings: allSettings })
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json({ 
      error: 'Gagal mengambil pengaturan',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// PUT - Update settings - Admin only
export const PUT = withAuth(async (request: NextRequest) => {
  try {
    const body = await request.json()
    
    // Convert flat object to array format if needed
    let settingsArray: { key: string; value: string }[] = []
    
    if (Array.isArray(body.settings)) {
      settingsArray = body.settings
    } else {
      // Flat object format: { cafe_name: 'value', cafe_tagline: 'value', ... }
      for (const [key, value] of Object.entries(body)) {
        if (typeof value === 'string' && key in DEFAULT_SETTINGS) {
          settingsArray.push({ key, value })
        }
      }
    }

    if (settingsArray.length === 0) {
      return NextResponse.json({ error: 'Tidak ada pengaturan untuk diupdate' }, { status: 400 })
    }

    const updatedSettings = []

    for (const { key, value } of settingsArray) {
      const defaultDesc = DEFAULT_SETTINGS[key]?.description || ''
      
      try {
        const setting = await db.cafeSetting.upsert({
          where: { key },
          update: { value },
          create: { key, value, description: defaultDesc },
        })
        
        updatedSettings.push(setting)
      } catch (dbError) {
        console.error(`Error upserting setting ${key}:`, dbError)
        // Continue with other settings
      }
    }

    if (updatedSettings.length === 0) {
      return NextResponse.json({ 
        error: 'Gagal menyimpan pengaturan. Pastikan database sudah dikonfigurasi dengan benar.',
        hint: 'Anda perlu mengaktifkan Vercel Postgres di dashboard Vercel.'
      }, { status: 500 })
    }

    return NextResponse.json({ success: true, settings: updatedSettings })
  } catch (error) {
    console.error('Error updating settings:', error)
    
    // Check if it's a database connection error
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    if (errorMessage.includes('Can\'t reach database server') || errorMessage.includes('P1001')) {
      return NextResponse.json({ 
        error: 'Database tidak tersedia. Untuk production di Vercel, silakan aktifkan Vercel Postgres.',
        hint: 'Buka Vercel Dashboard > Storage > Create Database > Postgres'
      }, { status: 500 })
    }
    
    return NextResponse.json({ 
      error: 'Gagal mengupdate pengaturan',
      details: errorMessage
    }, { status: 500 })
  }
})
