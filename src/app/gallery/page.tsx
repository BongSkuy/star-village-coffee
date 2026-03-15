'use client'

import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Coffee, ArrowLeft, MapPin, Clock, Phone, Instagram,
  ImageIcon
} from 'lucide-react'
import Link from 'next/link'

interface GalleryImage {
  id: string
  title: string | null
  description: string | null
  imageUrl: string
  order: number
  isActive: boolean
}

interface CafeSettings {
  whatsappNumber: string
  cafeName: string
  cafeTagline: string
  cafeLogo: string
  cafeAddress: string
  instagramHandle: string
  openHour: number
  closeHour: number
}

const DEFAULT_SETTINGS: CafeSettings = {
  whatsappNumber: '6282148615641',
  cafeName: 'Star Village Coffee',
  cafeTagline: 'Start Your Vibes Here',
  cafeLogo: '/images/logo.png',
  cafeAddress: 'Jl. Tentara Pelajar, Dusun 3, Kiringan, Boyolali, Jawa Tengah',
  instagramHandle: 'starvillage.coffee',
  openHour: 10,
  closeHour: 23
}

export default function GalleryPage() {
  const [settings, setSettings] = useState<CafeSettings>(DEFAULT_SETTINGS)
  const [gallery, setGallery] = useState<GalleryImage[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const [galleryRes, settingsRes] = await Promise.all([
          fetch('/api/gallery'),
          fetch('/api/settings')
        ])

        if (galleryRes.ok) {
          const data = await galleryRes.json()
          setGallery(data.images || [])
        }

        if (settingsRes.ok) {
          const data = await settingsRes.json()
          if (data.settings) {
            setSettings({
              whatsappNumber: data.settings.cafe_phone?.value || DEFAULT_SETTINGS.whatsappNumber,
              cafeName: data.settings.cafe_name?.value || DEFAULT_SETTINGS.cafeName,
              cafeTagline: data.settings.cafe_tagline?.value || DEFAULT_SETTINGS.cafeTagline,
              cafeLogo: data.settings.cafe_logo?.value || DEFAULT_SETTINGS.cafeLogo,
              cafeAddress: data.settings.cafe_address?.value || DEFAULT_SETTINGS.cafeAddress,
              instagramHandle: data.settings.cafe_instagram?.value || DEFAULT_SETTINGS.instagramHandle,
              openHour: parseInt(data.settings.open_hour?.value) || DEFAULT_SETTINGS.openHour,
              closeHour: parseInt(data.settings.close_hour?.value) || DEFAULT_SETTINGS.closeHour,
            })
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-amber-600 animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Memuat gallery...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-md">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline">Kembali</span>
              </Link>
              <div className="w-px h-6 bg-border" />
              <Link href="/" className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl overflow-hidden bg-white shadow flex items-center justify-center">
                  {settings.cafeLogo ? (
                    <img src={settings.cafeLogo} alt="Logo" className="w-9 h-9 object-contain" />
                  ) : (
                    <Coffee className="w-5 h-5 text-amber-700" />
                  )}
                </div>
                <span className="font-bold text-lg hidden sm:block">{settings.cafeName}</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-amber-100 text-amber-800">Gallery</Badge>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">Momen di Star Village</h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Lihat suasana dan momen seru di tempat kami
          </p>
        </div>

        {/* Gallery Grid */}
        {gallery.length === 0 ? (
          <div className="text-center py-20">
            <ImageIcon className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-xl text-muted-foreground">Belum ada foto di gallery</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {gallery.map((image, index) => (
              <div
                key={image.id}
                onClick={() => setSelectedImage(image)}
                className={`
                  relative rounded-2xl overflow-hidden cursor-pointer group
                  ${index === 0 ? 'md:col-span-2 md:row-span-2' : ''}
                  ${index === 5 ? 'md:col-span-2' : ''}
                `}
              >
                <div className={`bg-secondary ${index === 0 ? 'aspect-square md:aspect-auto md:h-full' : 'aspect-square'}`}>
                  <img
                    src={image.imageUrl}
                    alt={image.title || `Gallery ${index + 1}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-4 left-4 text-white">
                    <p className="font-bold">{image.title || `Foto ${index + 1}`}</p>
                    {image.description && (
                      <p className="text-sm opacity-80">{image.description}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="mt-16 text-center">
          <Card className="inline-block border-0 shadow-xl bg-gradient-to-r from-amber-600 to-amber-700 text-white">
            <CardContent className="p-8">
              <h3 className="text-xl font-bold mb-2">Ingin foto di tempat kami?</h3>
              <p className="opacity-90 mb-4">Kunjungi Star Village Coffee dan abadikan momen Anda!</p>
              <div className="flex gap-3 justify-center flex-wrap">
                <Link href="/reservasi">
                  <Button variant="outline" className="bg-white text-amber-700 hover:bg-amber-50 border-0">
                    Reservasi Meja
                  </Button>
                </Link>
                <a href={`https://www.instagram.com/${settings.instagramHandle}/`} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="border-white text-white hover:bg-white/20">
                    <Instagram className="w-4 h-4 mr-2" />
                    Follow IG
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute top-4 right-4 text-white text-4xl hover:opacity-70"
            onClick={() => setSelectedImage(null)}
          >
            ×
          </button>
          <img
            src={selectedImage.imageUrl}
            alt={selectedImage.title || 'Gallery'}
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
          {selectedImage.title && (
            <div className="absolute bottom-4 left-0 right-0 text-center text-white">
              <p className="font-bold text-lg">{selectedImage.title}</p>
              {selectedImage.description && (
                <p className="opacity-80">{selectedImage.description}</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
