import { NextRequest, NextResponse } from 'next/server'
import { put, del } from '@vercel/blob'
import { writeFile, unlink } from 'fs/promises'
import path from 'path'
import sharp from 'sharp'
import { withAuth } from '@/lib/api-auth'

// Check if running on Vercel
const isVercel = process.env.VERCEL === '1'

// Helper function for mkdir
async function mkdir(dir: string, options?: { recursive: boolean }) {
  if (isVercel) return // Skip on Vercel
  const { mkdir: fsMkdir } = await import('fs/promises')
  return fsMkdir(dir, options)
}

// Make image transparent - remove white/light backgrounds
async function makeTransparent(buffer: Buffer): Promise<Buffer> {
  try {
    const image = sharp(buffer)
    const metadata = await image.metadata()
    
    // Get raw pixel data
    const { data, info } = await image
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true })
    
    const pixels = new Uint8Array(data)
    
    // Process each pixel - make near-white pixels transparent
    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i]
      const g = pixels[i + 1]
      const b = pixels[i + 2]
      const a = pixels[i + 3]
      
      // Check if pixel is near white (threshold can be adjusted)
      const whiteThreshold = 240
      const nearWhiteThreshold = 220
      
      // Check if it's pure white or near white
      const isWhite = r >= whiteThreshold && g >= whiteThreshold && b >= whiteThreshold
      const isNearWhite = r >= nearWhiteThreshold && g >= nearWhiteThreshold && b >= nearWhiteThreshold
      
      // Make white/near-white pixels transparent with gradient
      if (isWhite) {
        pixels[i + 3] = 0 // Fully transparent
      } else if (isNearWhite) {
        // Gradual transparency for near-white pixels
        const avgColor = (r + g + b) / 3
        const opacity = Math.floor(((avgColor - nearWhiteThreshold) / (whiteThreshold - nearWhiteThreshold)) * 255)
        pixels[i + 3] = Math.min(a, 255 - opacity * 2)
      }
    }
    
    // Convert back to PNG with transparency
    return await sharp(pixels, {
      raw: {
        width: info.width,
        height: info.height,
        channels: 4
      }
    })
    .png()
    .toBuffer()
  } catch (error) {
    console.error('Error making transparent:', error)
    // If processing fails, return original as PNG
    return await sharp(buffer).png().toBuffer()
  }
}

// POST - Upload image (Admin only)
export const POST = withAuth(async (request: NextRequest) => {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const type = formData.get('type') as string || 'menu' // menu, logo, hero, gallery

    if (!file) {
      return NextResponse.json({ error: 'File tidak ditemukan' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Tipe file tidak didukung. Gunakan JPG, PNG, WebP, atau GIF' }, { status: 400 })
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'Ukuran file terlalu besar. Maksimal 5MB' }, { status: 400 })
    }

    // Generate unique filename
    const bytes = await file.arrayBuffer()
    let buffer = Buffer.from(bytes)
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(2, 8)
    
    // For logo, always save as PNG to support transparency
    const ext = type === 'logo' ? 'png' : (file.name.split('.').pop() || 'jpg')
    const filename = `${type}/${timestamp}-${randomStr}.${ext}`

    // Process image based on type
    if (type === 'logo') {
      // Make logo transparent - remove white/light backgrounds
      buffer = await makeTransparent(buffer)
    } else if (type === 'hero') {
      // Optimize hero image
      buffer = await sharp(buffer)
        .resize(1920, 1080, { 
          fit: 'cover',
          position: 'center'
        })
        .webp({ quality: 85 })
        .toBuffer()
      filename.replace(/\.[^.]+$/, '.webp')
    } else if (type === 'gallery') {
      // Optimize gallery image
      buffer = await sharp(buffer)
        .resize(1200, 1200, { 
          fit: 'inside',
          withoutEnlargement: true
        })
        .webp({ quality: 85 })
        .toBuffer()
      filename.replace(/\.[^.]+$/, '.webp')
    }

    // Upload to Vercel Blob if on Vercel, otherwise save locally
    if (isVercel) {
      // Check for BLOB_READ_WRITE_TOKEN
      if (!process.env.BLOB_READ_WRITE_TOKEN) {
        console.error('BLOB_READ_WRITE_TOKEN not set')
        return NextResponse.json({ 
          error: 'Konfigurasi upload belum lengkap. Hubungi administrator.' 
        }, { status: 500 })
      }

      try {
        const blob = await put(filename, buffer, {
          access: 'public',
          addRandomSuffix: false,
        })

        return NextResponse.json({ 
          success: true, 
          url: blob.url,
          filename: filename.split('/').pop()
        })
      } catch (blobError) {
        console.error('Blob upload error:', blobError)
        return NextResponse.json({ 
          error: 'Gagal mengupload ke cloud storage' 
        }, { status: 500 })
      }
    } else {
      // Local development - save to file system
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', type)
      await mkdir(uploadDir, { recursive: true })

      const filepath = path.join(uploadDir, filename.split('/').pop() || filename)
      await writeFile(filepath, buffer)

      // Return public URL
      const publicUrl = `/uploads/${filename}`

      return NextResponse.json({ 
        success: true, 
        url: publicUrl,
        filename: filename.split('/').pop()
      })
    }
  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json({ error: 'Gagal mengupload file' }, { status: 500 })
  }
})

// DELETE - Delete image (Admin only)
export const DELETE = withAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url)
    const url = searchParams.get('url')

    if (!url) {
      return NextResponse.json({ error: 'URL diperlukan' }, { status: 400 })
    }

    if (isVercel) {
      // Delete from Vercel Blob
      try {
        await del(url)
        return NextResponse.json({ success: true })
      } catch (blobError) {
        console.error('Blob delete error:', blobError)
        return NextResponse.json({ error: 'Gagal menghapus file' }, { status: 500 })
      }
    } else {
      // Local development - delete from file system
      // Only allow deleting from uploads directory
      if (!url.startsWith('/uploads/')) {
        return NextResponse.json({ error: 'Tidak dapat menghapus file ini' }, { status: 400 })
      }

      const filepath = path.join(process.cwd(), 'public', url)
      
      try {
        await unlink(filepath)
      } catch (e) {
        // File might not exist, that's okay
        console.log('File not found or already deleted')
      }

      return NextResponse.json({ success: true })
    }
  } catch (error) {
    console.error('Error deleting file:', error)
    return NextResponse.json({ error: 'Gagal menghapus file' }, { status: 500 })
  }
})
