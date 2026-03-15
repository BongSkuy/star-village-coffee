'use client'

import { useEffect, useState, Suspense } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Coffee, Sparkles, Flame, Wine, Milk, Leaf,
  GlassWater, Cookie, Utensils, MapPin,
  Clock, Phone, Instagram, ChevronDown,
  MessageCircle, Navigation, Star, ArrowRight,
  Wifi, Power, Gamepad2, Building, Heart, Users,
  Award, Check, Move, Calendar, Loader2, Home, TreePine, User, Copy,
  Menu, X, Gift, Image as ImageIcon, MapPinned, Info
} from 'lucide-react'
import Link from 'next/link'

// Types
interface MenuItem {
  id: string
  name: string
  description: string | null
  image: string | null
  rating: number
  totalRatings: number
  isPopular: boolean
  isNew: boolean
  isPromo: boolean
  stock: number
  variants: { id: string; name: string; price: number }[]
  category: { id: string; name: string; slug: string }
}

interface MenuCategory {
  id: string
  name: string
  slug: string
  icon: string | null
  items: MenuItem[]
}

interface GalleryImage {
  id: string
  title: string | null
  description: string | null
  imageUrl: string
  order: number
  isActive: boolean
}

interface Review {
  id: string
  name: string
  avatar: string | null
  rating: number
  comment: string
  source: string
  sourceUrl: string | null
}

interface CafeSettings {
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
}

const DEFAULT_SETTINGS: CafeSettings = {
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
  closeHour: 23
}

const GOOGLE_MAPS_EMBED = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3955.6481453086187!2d110.59482667477042!3d-7.5129947!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e7a6f1a40a98545%3A0xc05befafa594328!2sStar%20Village!5e0!3m2!1sen!2sid!4v1699999999999!5m2!1sen!2sid'

const FACILITIES = [
  { icon: <Wifi className="w-5 h-5" />, name: 'Free Wi-Fi' },
  { icon: <Power className="w-5 h-5" />, name: 'Stop Kontak' },
  { icon: <Gamepad2 className="w-5 h-5" />, name: 'Games' },
  { icon: <Building className="w-5 h-5" />, name: 'Mushola' },
  { icon: <Users className="w-5 h-5" />, name: 'Area Luas' },
  { icon: <Heart className="w-5 h-5" />, name: 'Cozy Vibes' },
]

// Format price
const formatPrice = (price: number) => `Rp ${(price * 1000).toLocaleString('id-ID')}`

// Status Badge Component
function StatusBadge({ openHour, closeHour }: { openHour: number; closeHour: number }) {
  const [isOpen, setIsOpen] = useState(false)
  
  useEffect(() => {
    const checkStatus = () => {
      const now = new Date()
      const hours = now.getHours()
      setIsOpen(hours >= openHour && hours < closeHour)
    }
    checkStatus()
    const interval = setInterval(checkStatus, 60000)
    return () => clearInterval(interval)
  }, [openHour, closeHour])

  return (
    <Badge variant={isOpen ? "default" : "secondary"} className="gap-1.5 text-xs px-3 py-1">
      <span className={`w-2 h-2 rounded-full ${isOpen ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
      {isOpen ? 'Buka Sekarang' : 'Sedang Tutup'}
    </Badge>
  )
}

// Header Component
function Header({ settings }: { settings: CafeSettings }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // Navigation items with icons
  const navItems = [
    { name: 'Home', href: '/', icon: <Home className="w-4 h-4" /> },
    { name: 'Tentang', href: '/#tentang', icon: <Info className="w-4 h-4" /> },
    { name: 'Menu', href: '/menu', icon: <Utensils className="w-4 h-4" /> },
    { name: 'Loyalty', href: '/loyalty', icon: <Gift className="w-4 h-4" /> },
    { name: 'Gallery', href: '/gallery', icon: <ImageIcon className="w-4 h-4" /> },
    { name: 'Reservasi', href: '/reservasi', icon: <Calendar className="w-4 h-4" /> },
    { name: 'Lokasi', href: '/#lokasi', icon: <MapPin className="w-4 h-4" /> },
  ]

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-white shadow-md'}`}>
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo & Name */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 flex items-center justify-center overflow-hidden rounded-xl bg-white shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all duration-300">
              {settings.cafeLogo ? (
                <img src={settings.cafeLogo} alt="Logo" className="w-10 h-10 object-contain" />
              ) : (
                <Coffee className="w-6 h-6 text-amber-700" />
              )}
            </div>
            <div className="hidden sm:block">
              <h1 className="font-bold text-lg leading-tight text-gray-900 group-hover:text-amber-700 transition-colors">{settings.cafeName}</h1>
              <p className="text-xs text-gray-500">{settings.cafeTagline}</p>
            </div>
          </Link>

          {/* Desktop Nav - Modern Pill Style */}
          <nav className="hidden lg:flex items-center bg-gray-50/80 backdrop-blur-sm rounded-full p-1.5 shadow-inner">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="group relative flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 rounded-full transition-all duration-300 hover:bg-white hover:text-amber-700 hover:shadow-sm"
              >
                <span className="opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            <StatusBadge openHour={settings.openHour} closeHour={settings.closeHour} />
            
            <Link href="/menu" className="hidden sm:block">
              <Button className="bg-gradient-to-r from-amber-500 via-amber-600 to-orange-500 hover:from-amber-600 hover:via-amber-700 hover:to-orange-600 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 rounded-full px-6">
                <Coffee className="w-4 h-4 mr-2" />
                Pesan Sekarang
              </Button>
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl bg-gray-100 hover:bg-amber-100 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-gray-700" /> : <Menu className="w-5 h-5 text-gray-700" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav - Beautiful Dropdown */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${mobileMenuOpen ? 'max-h-[500px] opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
          <nav className="bg-gradient-to-br from-amber-50 via-white to-orange-50 rounded-2xl p-4 shadow-xl border border-amber-100">
            <div className="grid grid-cols-2 gap-2 mb-3">
              {navItems.map((item, index) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white hover:bg-gradient-to-r hover:from-amber-100 hover:to-orange-100 text-gray-700 hover:text-amber-700 transition-all duration-300 shadow-sm hover:shadow-md group"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
                    {item.icon}
                  </div>
                  <span className="font-medium text-sm">{item.name}</span>
                </Link>
              ))}
            </div>
            
            {/* CTA Button */}
            <Link href="/menu" onClick={() => setMobileMenuOpen(false)} className="block">
              <Button className="w-full bg-gradient-to-r from-amber-500 via-amber-600 to-orange-500 hover:from-amber-600 hover:via-amber-700 hover:to-orange-600 py-6 rounded-xl shadow-lg text-base font-semibold">
                <Coffee className="w-5 h-5 mr-2" />
                Pesan Sekarang
              </Button>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}

// Hero Section
function HeroSection({ settings }: { settings: CafeSettings }) {
  // Calculate object position based on settings and screen size
  const getDesktopPosition = () => {
    const x = settings.cafeHeroPositionX || 'center'
    const y = settings.cafeHeroPositionY || 'center'
    return `${x} ${y}`
  }
  
  const getMobilePosition = () => {
    const x = settings.cafeHeroPositionXMobile || settings.cafeHeroPositionX || 'center'
    const y = settings.cafeHeroPositionYMobile || settings.cafeHeroPositionY || 'center'
    return `${x} ${y}`
  }

  return (
    <section className="relative min-h-[100svh] sm:min-h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Hero Background Image or Gradient */}
      {settings.cafeHeroImage ? (
        <div className="absolute inset-0">
          {/* Mobile version */}
          <img 
            src={settings.cafeHeroImage} 
            alt="Hero" 
            className="w-full h-full object-cover sm:hidden"
            style={{ objectPosition: getMobilePosition() }}
          />
          {/* Desktop version */}
          <img 
            src={settings.cafeHeroImage} 
            alt="Hero" 
            className="w-full h-full object-cover hidden sm:block"
            style={{ objectPosition: getDesktopPosition() }}
          />
          {/* Stronger overlay for better text visibility */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/60 to-black/75 sm:from-black/70 sm:via-black/50 sm:to-black/70" />
        </div>
      ) : (
        <>
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50" />
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />
          </div>
          
          {/* Decorative Elements - visible on all devices */}
          <div className="absolute top-16 left-4 sm:top-20 sm:left-10 w-48 h-48 sm:w-72 sm:h-72 bg-amber-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse will-change-transform" />
          <div className="absolute bottom-16 right-4 sm:bottom-20 sm:right-10 w-48 h-48 sm:w-72 sm:h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse will-change-transform" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 sm:w-96 sm:h-96 bg-yellow-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 will-change-transform" />
        </>
      )}

      <div className="container mx-auto px-4 relative z-10 py-12 sm:py-16">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          {/* Badge */}
          <Badge className={`mb-3 sm:mb-4 px-3 sm:px-4 py-1 sm:py-1.5 text-sm sm:text-base ${settings.cafeHeroImage ? 'bg-white/30 text-white border-white/50 backdrop-blur-sm' : 'bg-amber-100 text-amber-800 border-amber-200'}`}>
            <Award className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1.5" />
            Coffee Shop Terbaik di Boyolali
          </Badge>

          {/* Name & Tagline - with stronger shadows for visibility */}
          <h1 className={`text-3xl sm:text-4xl md:text-6xl font-bold mb-3 sm:mb-4 leading-tight sm:leading-[1.3] py-1 ${settings.cafeHeroImage ? 'text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]' : 'text-amber-800'}`}>
            {settings.cafeName}
          </h1>
          <p className={`text-lg sm:text-xl md:text-2xl mb-4 sm:mb-6 font-medium ${settings.cafeHeroImage ? 'text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]' : 'text-gray-600'}`}>{settings.cafeTagline}</p>

          {/* Rating & Info */}
          <div className="flex items-center gap-3 sm:gap-6 flex-wrap justify-center mb-6 sm:mb-8">
            <div className={`flex items-center gap-1.5 sm:gap-2 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-md text-sm sm:text-base ${settings.cafeHeroImage ? 'bg-white/30 text-white border border-white/30' : 'bg-white/80'}`}>
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400 drop-shadow" />
                ))}
              </div>
              <span className="font-bold drop-shadow">4.6</span>
              <span className={`${settings.cafeHeroImage ? 'text-white/90' : 'text-muted-foreground'} text-xs sm:text-sm`}>(127+)</span>
            </div>
            <div className={`flex items-center gap-1.5 sm:gap-2 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-md text-sm sm:text-base ${settings.cafeHeroImage ? 'bg-white/30 text-white border border-white/30' : 'bg-white/80'}`}>
              <Clock className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${settings.cafeHeroImage ? 'text-amber-300' : 'text-amber-600'}`} />
              <span className="font-medium drop-shadow">{String(settings.openHour).padStart(2, '0')}:00 - {String(settings.closeHour).padStart(2, '0')}:00</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-3 sm:gap-4 justify-center mb-6 sm:mb-8">
            <Link href="/menu">
              <Button size="lg" className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 gap-2 px-6 sm:px-8 py-5 sm:py-7 text-base sm:text-lg font-bold shadow-xl shadow-amber-500/25 hover:shadow-2xl hover:shadow-amber-500/30 transition-all duration-300 hover:scale-105 rounded-2xl">
                <Utensils className="w-4 h-4 sm:w-5 sm:h-5" />
                Lihat Menu
              </Button>
            </Link>
            <Link href="/reservasi">
              <Button size="lg" variant="outline" className={`gap-2 px-6 sm:px-8 py-5 sm:py-7 text-base sm:text-lg font-bold border-2 shadow-xl transition-all duration-300 hover:scale-105 rounded-2xl ${settings.cafeHeroImage ? 'bg-white/20 border-white text-white hover:bg-white hover:text-amber-800 backdrop-blur-sm' : 'border-amber-600 text-amber-700 hover:bg-amber-600 hover:text-white'}`}>
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                Reservasi
              </Button>
            </Link>
          </div>

          {/* Trust Badges */}
          <div className="flex items-center gap-2 sm:gap-4 flex-wrap justify-center">
            <Badge className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm ${settings.cafeHeroImage ? 'bg-white/30 text-white border-white/50 backdrop-blur-sm' : 'bg-green-100 text-green-700 border-green-200'}`}>
              <Check className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              100% Halal
            </Badge>
            <Badge className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm ${settings.cafeHeroImage ? 'bg-white/30 text-white border-white/50 backdrop-blur-sm' : 'bg-blue-100 text-blue-700 border-blue-200'}`}>
              <Award className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              Premium
            </Badge>
            <Badge className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm ${settings.cafeHeroImage ? 'bg-white/30 text-white border-white/50 backdrop-blur-sm' : 'bg-purple-100 text-purple-700 border-purple-200'}`}>
              <Heart className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              Cozy
            </Badge>
          </div>
        </div>
      </div>

      {/* Scroll Indicator - with will-change for better animation */}
      <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 animate-bounce will-change-transform">
        <ChevronDown className={`w-5 h-5 sm:w-6 sm:h-6 ${settings.cafeHeroImage ? 'text-white' : 'text-amber-600'}`} />
      </div>
    </section>
  )
}

// About Section
function AboutSection({ settings }: { settings: CafeSettings }) {
  return (
    <section id="tentang" className="py-20 bg-white scroll-mt-20 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-amber-100 text-amber-800">Tentang Kami</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Selamat Datang di {settings.cafeName}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Tempat ngopi favorit di Boyolali dengan suasana cozy dan berbagai pilihan menu berkualitas
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div className="space-y-6">
              <p className="text-lg text-muted-foreground leading-relaxed">
                <span className="font-semibold text-foreground">{settings.cafeName}</span> adalah coffee shop yang berlokasi di Boyolali, Jawa Tengah. 
                Kami menyajikan berbagai pilihan kopi berkualitas dengan biji kopi pilihan dan racikan barista berpengalaman.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Tempat yang sempurna untuk bekerja, belajar, atau sekadar bersantai bersama teman dan keluarga.
                Dengan fasilitas lengkap dan suasana yang nyaman, kami siap memberikan pengalaman ngopi terbaik untuk Anda.
              </p>

              {/* Facilities */}
              <div className="grid grid-cols-2 gap-4 pt-4">
                {FACILITIES.map((facility, index) => (
                  <div 
                    key={index} 
                    className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl hover:bg-amber-100 transition-colors duration-300 hover:scale-105 transform"
                  >
                    <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700">
                      {facility.icon}
                    </div>
                    <span className="font-medium text-sm">{facility.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Image/Stats with Animations */}
            <div className="grid grid-cols-2 gap-4">
              {/* Rating Card */}
              <Card className="group bg-gradient-to-br from-amber-500 to-amber-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:scale-105 cursor-default">
                <CardContent className="p-6 text-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                  <div className="relative z-10">
                    <div className="text-4xl font-bold mb-2 group-hover:scale-110 transition-transform duration-300">4.6</div>
                    <div className="flex justify-center mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-4 h-4 fill-yellow-300 text-yellow-300 animate-pulse`} 
                          style={{ animationDelay: `${i * 0.1}s` }}
                        />
                      ))}
                    </div>
                    <div className="text-sm opacity-90">Rating Google</div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Reviews Card */}
              <Card className="group bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:scale-105 cursor-default">
                <CardContent className="p-6 text-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                  <div className="relative z-10">
                    <div className="text-4xl font-bold mb-2 group-hover:scale-110 transition-transform duration-300">127+</div>
                    <div className="text-sm opacity-90 mb-2">Ulasan Pelanggan</div>
                    <MessageCircle className="w-5 h-5 mx-auto opacity-75 group-hover:rotate-12 transition-transform duration-300" />
                  </div>
                </CardContent>
              </Card>
              
              {/* Menu Card */}
              <Card className="group bg-gradient-to-br from-yellow-500 to-yellow-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:scale-105 cursor-default">
                <CardContent className="p-6 text-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                  <div className="relative z-10">
                    <div className="text-4xl font-bold mb-2 group-hover:scale-110 transition-transform duration-300">50+</div>
                    <div className="text-sm opacity-90 mb-2">Menu Pilihan</div>
                    <Utensils className="w-5 h-5 mx-auto opacity-75 group-hover:scale-125 transition-transform duration-300" />
                  </div>
                </CardContent>
              </Card>
              
              {/* Vibes Card */}
              <Card className="group bg-gradient-to-br from-red-500 to-red-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:scale-105 cursor-default">
                <CardContent className="p-6 text-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                  <div className="relative z-10">
                    <div className="text-4xl font-bold mb-2 group-hover:scale-110 transition-transform duration-300">∞</div>
                    <div className="text-sm opacity-90 mb-2">Vibes</div>
                    <Heart className="w-5 h-5 mx-auto opacity-75 group-hover:scale-125 group-hover:text-red-200 transition-all duration-300" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// Featured Menu Section
function FeaturedMenuSection({ categories }: { categories: MenuCategory[] }) {
  const allItems = categories.flatMap(cat => cat.items.map(item => ({ ...item, category: cat })))
  const featuredItems = allItems.filter(item => item.isPopular || item.isNew).slice(0, 6)

  const mainCategories = [
    { name: 'Coffee', slug: 'coffee', icon: <Coffee className="w-8 h-8" />, color: 'from-amber-500 to-amber-600', dbSlugs: ['classic-coffee', 'signature-coffee', 'manual-brew', 'coffee-mocktail', 'kopi-susu'] },
    { name: 'Non-Coffee', slug: 'non-coffee', icon: <GlassWater className="w-8 h-8" />, color: 'from-pink-500 to-pink-600', dbSlugs: ['milky-base', 'mocktail', 'tea-selection', 'juice', 'my-bottle'] },
    { name: 'Food', slug: 'food', icon: <Utensils className="w-8 h-8" />, color: 'from-orange-500 to-orange-600', dbSlugs: ['food', 'mie', 'burger'] },
    { name: 'Snacks', slug: 'snacks', icon: <Cookie className="w-8 h-8" />, color: 'from-green-500 to-green-600', dbSlugs: ['snack', 'roti-bakar', 'toast'] }
  ]

  const getItemCount = (dbSlugs: string[]) => {
    return categories.filter(c => dbSlugs.includes(c.slug)).reduce((sum, c) => sum + c.items.length, 0)
  }

  return (
    <section className="py-20 bg-gradient-to-b from-white to-amber-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-amber-100 text-amber-800">Menu Kami</Badge>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Menu Pilihan</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Nikmati berbagai pilihan menu berkualitas dari kopi hingga makanan lezat
          </p>
        </div>

        {/* Category Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {mainCategories.map((cat) => (
            <Link key={cat.slug} href={`/menu?category=${cat.slug}`}>
              <Card className="group cursor-pointer border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden">
                <CardContent className={`p-6 bg-gradient-to-br ${cat.color} text-white text-center`}>
                  <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-white/20 flex items-center justify-center transform group-hover:scale-110 transition-transform">
                    {cat.icon}
                  </div>
                  <h3 className="font-bold text-lg">{cat.name}</h3>
                  <p className="text-sm opacity-90 mt-1">{getItemCount(cat.dbSlugs)} menu</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Featured Items */}
        {featuredItems.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-bold mb-6 text-center">Menu Populer</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredItems.map((item) => (
                <Card key={item.id} className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300">
                  {item.image && (
                    <div className="relative h-48 overflow-hidden">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute top-3 right-3 flex gap-1">
                        {item.isNew && <Badge className="bg-green-500 text-white">Baru</Badge>}
                        {item.isPopular && <Badge className="bg-amber-500 text-white">Popular</Badge>}
                      </div>
                    </div>
                  )}
                  <CardContent className="p-5">
                    <h4 className="font-bold text-lg mb-2">{item.name}</h4>
                    <p className="text-sm text-muted-foreground mb-3">{item.category.name}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                        <span className="text-sm font-medium">{item.rating.toFixed(1)}</span>
                      </div>
                      <span className="font-bold text-amber-700">{formatPrice(item.variants[0]?.price || 0)}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="text-center">
          <Link href="/menu">
            <Button size="lg" className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 shadow-lg gap-2 px-8">
              Lihat Semua Menu
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

// Reservation Section
function ReservationSection({ settings }: { settings: CafeSettings }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    date: '',
    time: '',
    guests: 2,
    seatingType: 'indoor',
    notes: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [copied, setCopied] = useState(false)
  const [reservationResult, setReservationResult] = useState<{
    reservationCode: string | null
    name: string
    phone: string
    date: string
    time: string
    guests: number
    seatingType: string
  } | null>(null)

  // Generate time slots
  const timeSlots: string[] = []
  for (let h = settings.openHour; h < settings.closeHour; h++) {
    timeSlots.push(`${String(h).padStart(2, '0')}:00`)
    timeSlots.push(`${String(h).padStart(2, '0')}:30`)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    
    try {
      const response = await fetch('/api/reservation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const data = await response.json()
        setReservationResult({
          reservationCode: data.reservation.reservationCode,
          name: data.reservation.name,
          phone: data.reservation.phone,
          date: data.reservation.date,
          time: data.reservation.time,
          guests: data.reservation.guests,
          seatingType: data.reservation.seatingType
        })
        setSuccess(true)
        setFormData({ name: '', phone: '', email: '', date: '', time: '', guests: 2, seatingType: 'indoor', notes: '' })
      } else {
        alert('Gagal mengirim reservasi. Silakan coba lagi.')
      }
    } catch (error) {
      console.error('Error submitting reservation:', error)
      alert('Gagal mengirim reservasi. Silakan coba lagi.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section id="reservasi" className="py-20 bg-gradient-to-b from-amber-50 to-white scroll-mt-20">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-amber-100 text-amber-800">Reservasi</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Pesan Meja Anda</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Nikmati pengalaman ngopi yang nyaman dengan reservasi meja terlebih dahulu
            </p>
          </div>

          {success && reservationResult ? (
            <Card className="border-0 shadow-2xl overflow-hidden max-w-2xl mx-auto">
              <CardContent className="p-0">
                {/* Success Header */}
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-center text-white">
                  <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
                    <Check className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Reservasi Berhasil!</h3>
                  <p className="text-white/90">Reservasi Anda telah kami terima</p>
                </div>

                <div className="p-8">
                  {/* Reservation Code */}
                  {reservationResult.reservationCode && (
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 mb-6 border border-amber-200">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground mb-2">Kode Reservasi Anda</p>
                        <div className="flex items-center justify-center gap-3">
                          <span className="text-3xl font-bold text-amber-700 font-mono tracking-wider">
                            {reservationResult.reservationCode}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              navigator.clipboard.writeText(reservationResult.reservationCode || '')
                              setCopied(true)
                              setTimeout(() => setCopied(false), 2000)
                            }}
                            className="shrink-0"
                          >
                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-3">
                          Simpan kode ini untuk melacak status reservasi Anda
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                    <div className="bg-secondary/30 rounded-xl p-4 text-center">
                      <User className="w-5 h-5 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">Nama</p>
                      <p className="font-semibold truncate">{reservationResult.name}</p>
                    </div>
                    <div className="bg-secondary/30 rounded-xl p-4 text-center">
                      <Calendar className="w-5 h-5 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">Tanggal</p>
                      <p className="font-semibold">{reservationResult.date}</p>
                    </div>
                    <div className="bg-secondary/30 rounded-xl p-4 text-center">
                      <Clock className="w-5 h-5 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">Waktu</p>
                      <p className="font-semibold">{reservationResult.time}</p>
                    </div>
                    <div className="bg-secondary/30 rounded-xl p-4 text-center">
                      <Users className="w-5 h-5 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">Tamu</p>
                      <p className="font-semibold">{reservationResult.guests} orang</p>
                    </div>
                  </div>

                  {/* Seating Info */}
                  <div className="flex justify-center mb-6">
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
                      reservationResult.seatingType === 'indoor' 
                        ? 'bg-amber-100 text-amber-700' 
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {reservationResult.seatingType === 'indoor' 
                        ? <Home className="w-4 h-4" /> 
                        : <TreePine className="w-4 h-4" />
                      }
                      <span className="font-medium capitalize">{reservationResult.seatingType}</span>
                    </div>
                  </div>

                  {/* Info Box */}
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                    <div className="flex items-start gap-3">
                      <Sparkles className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-blue-800 mb-1">Langkah Selanjutnya</p>
                        <ul className="text-blue-700 space-y-1">
                          <li>• Tim kami akan menghubungi Anda untuk konfirmasi</li>
                          <li>• Gunakan kode reservasi untuk melacak status</li>
                          <li>• Datang tepat waktu sesuai jadwal reservasi</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link href="/reservasi/cek" className="flex-1">
                      <Button className="w-full bg-amber-600 hover:bg-amber-700 py-6 text-lg">
                        <ArrowRight className="w-5 h-5 mr-2" />
                        Lacak Status Reservasi
                      </Button>
                    </Link>
                    <Button 
                      onClick={() => {
                        setSuccess(false)
                        setReservationResult(null)
                      }} 
                      variant="outline"
                      className="flex-1 py-6 text-lg"
                    >
                      Reservasi Lagi
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-0 shadow-xl">
              <CardContent className="p-6 sm:p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Row 1: Name, Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="res-name" className="flex items-center gap-2">
                        <User className="w-4 h-4 text-amber-600" />
                        Nama Lengkap *
                      </Label>
                      <Input
                        id="res-name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Nama Anda"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="res-phone" className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-amber-600" />
                        No. Telepon *
                      </Label>
                      <Input
                        id="res-phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="08xxxxxxxxxx"
                        required
                      />
                    </div>
                  </div>

                  {/* Row 2: Email, Date, Time */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="res-email">Email (opsional)</Label>
                      <Input
                        id="res-email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="email@example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="res-date" className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-amber-600" />
                        Tanggal *
                      </Label>
                      <Input
                        id="res-date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="res-time" className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-600" />
                        Waktu *
                      </Label>
                      <select
                        id="res-time"
                        value={formData.time}
                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                        required
                        className="w-full py-2.5 px-3 rounded-md border border-input bg-background"
                      >
                        <option value="">Pilih waktu</option>
                        {timeSlots.map((slot) => (
                          <option key={slot} value={slot}>{slot}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Row 3: Guests, Seating Type */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-amber-600" />
                        Jumlah Tamu
                      </Label>
                      <div className="flex items-center gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => setFormData({ ...formData, guests: Math.max(1, formData.guests - 1) })}
                        >
                          -
                        </Button>
                        <span className="text-xl font-bold w-10 text-center">{formData.guests}</span>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => setFormData({ ...formData, guests: Math.min(50, formData.guests + 1) })}
                        >
                          +
                        </Button>
                        <span className="text-muted-foreground text-sm">orang</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-amber-600" />
                        Pilih Area
                      </Label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, seatingType: 'indoor' })}
                          className={`p-3 rounded-xl border-2 transition-all ${
                            formData.seatingType === 'indoor'
                              ? 'border-amber-500 bg-amber-50'
                              : 'border-border hover:border-amber-300'
                          }`}
                        >
                          <div className="flex items-center justify-center gap-2">
                            <Home className={`w-5 h-5 ${formData.seatingType === 'indoor' ? 'text-amber-600' : 'text-muted-foreground'}`} />
                            <span className={`font-medium ${formData.seatingType === 'indoor' ? 'text-amber-700' : ''}`}>
                              Indoor
                            </span>
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, seatingType: 'outdoor' })}
                          className={`p-3 rounded-xl border-2 transition-all ${
                            formData.seatingType === 'outdoor'
                              ? 'border-green-500 bg-green-50'
                              : 'border-border hover:border-green-300'
                          }`}
                        >
                          <div className="flex items-center justify-center gap-2">
                            <TreePine className={`w-5 h-5 ${formData.seatingType === 'outdoor' ? 'text-green-600' : 'text-muted-foreground'}`} />
                            <span className={`font-medium ${formData.seatingType === 'outdoor' ? 'text-green-700' : ''}`}>
                              Outdoor
                            </span>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="space-y-2">
                    <Label htmlFor="res-notes">Catatan (opsional)</Label>
                    <Textarea
                      id="res-notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Ada permintaan khusus?"
                      rows={2}
                    />
                  </div>

                  {/* Submit */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 py-6 text-lg shadow-xl"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Mengirim...
                        </>
                      ) : (
                        <>
                          <Calendar className="w-5 h-5 mr-2" />
                          Kirim Reservasi
                        </>
                      )}
                    </Button>
                    <Link href="/reservasi">
                      <Button variant="outline" type="button" className="w-full sm:w-auto py-6 px-8">
                        <ArrowRight className="w-5 h-5 mr-2" />
                        Reservasi Lengkap
                      </Button>
                    </Link>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </section>
  )
}

// Gallery Preview Section
function GalleryPreviewSection({ images }: { images: GalleryImage[] }) {
  const displayImages = images.slice(0, 6)

  if (displayImages.length === 0) return null

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-amber-100 text-amber-800">Gallery</Badge>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Momen di Star Village</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Lihat suasana dan momen seru di tempat kami
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {displayImages.map((image, index) => (
            <div 
              key={image.id} 
              className={`relative rounded-2xl overflow-hidden group cursor-pointer ${
                index === 0 ? 'md:col-span-2 md:row-span-2' : ''
              }`}
            >
              <div className={`bg-secondary ${index === 0 ? 'aspect-square md:aspect-auto md:h-full' : 'aspect-square'}`}>
                <img
                  src={image.imageUrl}
                  alt={image.title || `Gallery ${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link href="/gallery">
            <Button size="lg" variant="outline" className="border-2 border-amber-600 text-amber-700 hover:bg-amber-600 hover:text-white gap-2 px-8">
              Lihat Semua Foto
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

// Reviews Section
function ReviewsSection({ reviews }: { reviews: Review[] }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  
  const displayReviews = reviews.length > 0 ? reviews : [
    { id: '1', name: 'Rina Safitri', avatar: null, rating: 5, comment: 'Tempatnya cozy banget! Kopinya enak, baristanya ramah. Recommended buat yang suka tempat aesthetic dan nyaman.', source: 'google', sourceUrl: null },
    { id: '2', name: 'Budi Santoso', avatar: null, rating: 5, comment: 'Kopi susu arennya juara! Harganya terjangkau, pelayanannya cepat. Pasti balik lagi!', source: 'google', sourceUrl: null },
    { id: '3', name: 'Dewi Lestari', avatar: null, rating: 5, comment: 'Tempat favorit buat ngerjain tugas. WiFi kencang, tempat nyaman, kopi mantap. Worth it!', source: 'google', sourceUrl: null },
    { id: '4', name: 'Ahmad Rizki', avatar: null, rating: 5, comment: 'Nasi gorengnya enak, porsinya banyak. Kopinya juga mantap. Bisa makan dan ngopi bareng.', source: 'google', sourceUrl: null },
    { id: '5', name: 'Siti Nurhaliza', avatar: null, rating: 5, comment: 'Pesen lewat TikTok, beneran sesuai ekspektasi! Kopingya autentik dan tempatnya instagramable. Wajib mampir!', source: 'tiktok', sourceUrl: null },
    { id: '6', name: 'Dimas Prasetyo', avatar: null, rating: 5, comment: 'Baristanya profesional banget, bisa rekomendain menu sesuai mood. Suasananya nyaman buat meeting.', source: 'google', sourceUrl: null },
    { id: '7', name: 'Ayu Permata', avatar: null, rating: 5, comment: 'Red velvet latte-nya WRITTEN IN THE STARS! Beneran enak, gaik manis berlebihan. Pasti repeat order!', source: 'instagram', sourceUrl: null },
    { id: '8', name: 'Fajar Nugroho', avatar: null, rating: 4, comment: 'Tempatnya asyik, parkir luas. Harganya oke lah buat kualitas kopi yang ditawarkan. Recommended!', source: 'google', sourceUrl: null },
    { id: '9', name: 'Maya Sari', avatar: null, rating: 5, comment: 'Matcha latte-nya smooth banget, ga pahit. Snack-nya juga enak-enak. Cocok buat nongkrong bareng teman.', source: 'tiktok', sourceUrl: null },
    { id: '10', name: 'Reza Firmansyah', avatar: null, rating: 5, comment: 'Kopi robusta single origin-nya juara! Bisa taste notes coklat dan karamel. Wajib coba buat pecinta kopi!', source: 'instagram', sourceUrl: null }
  ]

  const nextReview = () => setCurrentIndex((prev) => (prev + 1) % displayReviews.length)
  const prevReview = () => setCurrentIndex((prev) => (prev - 1 + displayReviews.length) % displayReviews.length)

  return (
    <section className="py-20 bg-gradient-to-b from-amber-50 to-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-amber-100 text-amber-800">Ulasan</Badge>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Apa Kata Mereka?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Pengalaman nyata dari pelanggan kami
          </p>
        </div>

        {/* Reviews Carousel */}
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <Card className="border-0 shadow-2xl overflow-hidden">
              <CardContent className="p-8 md:p-12">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  {/* Avatar */}
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center flex-shrink-0 overflow-hidden shadow-lg">
                    {displayReviews[currentIndex].avatar ? (
                      <img src={displayReviews[currentIndex].avatar!} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl font-bold text-white">{displayReviews[currentIndex].name.charAt(0)}</span>
                    )}
                  </div>
                  
                  <div className="flex-1 text-center md:text-left">
                    {/* Stars */}
                    <div className="flex justify-center md:justify-start gap-1 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-5 h-5 ${i < displayReviews[currentIndex].rating ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300'}`} />
                      ))}
                    </div>
                    
                    {/* Comment */}
                    <p className="text-lg md:text-xl text-muted-foreground mb-4 italic">
                      "{displayReviews[currentIndex].comment}"
                    </p>
                    
                    {/* Name & Source */}
                    <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                      <p className="font-bold text-lg">{displayReviews[currentIndex].name}</p>
                      <Badge variant="outline" className={`text-xs ${
                        displayReviews[currentIndex].source === 'google' ? 'border-blue-500 text-blue-600' :
                        displayReviews[currentIndex].source === 'tiktok' ? 'border-black text-black' :
                        'border-pink-500 text-pink-600'
                      }`}>
                        {displayReviews[currentIndex].source === 'google' ? 'Google' :
                         displayReviews[currentIndex].source === 'tiktok' ? 'TikTok' :
                         'Instagram'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex justify-center gap-4 mt-8">
              <Button variant="outline" size="icon" className="w-12 h-12 rounded-full" onClick={prevReview}>
                <ChevronDown className="w-5 h-5 rotate-90" />
              </Button>
              <div className="flex items-center gap-2">
                {displayReviews.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all ${index === currentIndex ? 'w-8 bg-amber-600' : 'bg-gray-300'}`}
                  />
                ))}
              </div>
              <Button variant="outline" size="icon" className="w-12 h-12 rounded-full" onClick={nextReview}>
                <ChevronDown className="w-5 h-5 -rotate-90" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// Location Section
function LocationSection({ settings }: { settings: CafeSettings }) {
  return (
    <section id="lokasi" className="py-20 bg-white scroll-mt-20">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-amber-100 text-amber-800">Lokasi</Badge>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Temukan Kami</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Kunjungi tempat kami dan rasakan pengalaman ngopi terbaik
          </p>
        </div>

        {/* Map & Info */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-0 rounded-3xl overflow-hidden shadow-2xl border border-border">
          {/* Map */}
          <div className="lg:col-span-3 min-h-[400px]">
            <iframe
              src={GOOGLE_MAPS_EMBED}
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: '400px' }}
              allowFullScreen
              loading="lazy"
            />
          </div>
          
          {/* Info Card */}
          <div className="lg:col-span-2 bg-gradient-to-br from-amber-50 to-orange-50 p-8 flex flex-col justify-center">
            <div className="space-y-6">
              {/* Logo & Name */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white shadow-lg flex items-center justify-center overflow-hidden">
                  {settings.cafeLogo ? (
                    <img src={settings.cafeLogo} alt="Logo" className="w-14 h-14 object-contain" />
                  ) : (
                    <Coffee className="w-8 h-8 text-amber-700" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-xl">{settings.cafeName}</h3>
                  <p className="text-sm text-muted-foreground">{settings.cafeTagline}</p>
                </div>
              </div>

              {/* Info Items */}
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Alamat</p>
                    <p className="font-medium">{settings.cafeAddress}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Jam Buka</p>
                    <p className="font-medium">{String(settings.openHour).padStart(2, '0')}:00 - {String(settings.closeHour).padStart(2, '0')}:00 WIB</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Telepon</p>
                    <a href={`https://wa.me/${settings.whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="font-medium text-green-600 hover:underline">
                      +62 {settings.whatsappNumber.slice(2, 5)}-{settings.whatsappNumber.slice(5, 9)}-{settings.whatsappNumber.slice(9)}
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-pink-100 flex items-center justify-center flex-shrink-0">
                    <Instagram className="w-5 h-5 text-pink-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Instagram</p>
                    <a href={`https://www.instagram.com/${settings.instagramHandle}/`} target="_blank" rel="noopener noreferrer" className="font-medium text-pink-600 hover:underline">
                      @{settings.instagramHandle}
                    </a>
                  </div>
                </div>
              </div>

              {/* Button */}
              <a href="https://maps.app.goo.gl/gVqVUkFqbdXiwGVz9" target="_blank" rel="noopener noreferrer" className="block">
                <Button className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg gap-2 py-6 text-lg rounded-xl">
                  <Navigation className="w-5 h-5" />
                  Petunjuk Arah
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// Footer
function Footer({ settings }: { settings: CafeSettings }) {
  const [email, setEmail] = useState('')
  const [subscribing, setSubscribing] = useState(false)
  const [subscribed, setSubscribed] = useState(false)
  
  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    
    setSubscribing(true)
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      
      if (res.ok) {
        setSubscribed(true)
        setEmail('')
      }
    } catch (error) {
      console.error('Subscribe error:', error)
    } finally {
      setSubscribing(false)
    }
  }
  
  return (
    <footer className="bg-gradient-to-br from-amber-900 via-amber-800 to-amber-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-white shadow-lg flex items-center justify-center overflow-hidden">
                {settings.cafeLogo ? (
                  <img src={settings.cafeLogo} alt="Logo" className="w-11 h-11 object-contain" />
                ) : (
                  <Coffee className="w-6 h-6 text-amber-700" />
                )}
              </div>
              <div>
                <h3 className="font-bold text-lg">{settings.cafeName}</h3>
                <p className="text-sm opacity-75">{settings.cafeTagline}</p>
              </div>
            </div>
            <p className="text-sm opacity-75 max-w-sm mb-4">
              Coffee shop favorit di Boyolali dengan suasana cozy, menu berkualitas, dan pelayanan terbaik.
            </p>
            
            {/* Newsletter */}
            <div className="mt-4">
              <h4 className="font-semibold mb-2 text-sm">Berlangganan Newsletter</h4>
              {subscribed ? (
                <div className="flex items-center gap-2 text-green-300 text-sm">
                  <Check className="w-4 h-4" />
                  Terima kasih telah berlangganan!
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email Anda"
                    className="flex-1 px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                    required
                  />
                  <button
                    type="submit"
                    disabled={subscribing}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 rounded-lg text-sm font-medium transition-colors"
                  >
                    {subscribing ? '...' : 'Langganan'}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm opacity-75">
              <li><Link href="/" className="hover:opacity-100 transition-opacity">Home</Link></li>
              <li><Link href="/menu" className="hover:opacity-100 transition-opacity">Menu</Link></li>
              <li><Link href="/loyalty" className="hover:opacity-100 transition-opacity">Loyalty</Link></li>
              <li><Link href="/gallery" className="hover:opacity-100 transition-opacity">Gallery</Link></li>
              <li><Link href="/reservasi" className="hover:opacity-100 transition-opacity">Reservasi</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold mb-4">Kontak</h4>
            <ul className="space-y-2 text-sm opacity-75">
              <li className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {String(settings.openHour).padStart(2, '0')}:00 - {String(settings.closeHour).padStart(2, '0')}:00
              </li>
              <li>
                <a href={`https://wa.me/${settings.whatsappNumber}`} className="flex items-center gap-2 hover:opacity-100 transition-opacity">
                  <Phone className="w-4 h-4" />
                  WhatsApp
                </a>
              </li>
              <li>
                <a href={`https://www.instagram.com/${settings.instagramHandle}/`} className="flex items-center gap-2 hover:opacity-100 transition-opacity">
                  <Instagram className="w-4 h-4" />
                  @{settings.instagramHandle}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 text-center text-sm opacity-75">
          <p>© {new Date().getFullYear()} {settings.cafeName}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

// Main Page Component
function HomePage() {
  const [categories, setCategories] = useState<MenuCategory[]>([])
  const [gallery, setGallery] = useState<GalleryImage[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [settings, setSettings] = useState<CafeSettings>(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [menuRes, galleryRes, reviewsRes, settingsRes] = await Promise.all([
          fetch('/api/menu'),
          fetch('/api/gallery'),
          fetch('/api/reviews?activeOnly=true'),
          fetch('/api/settings'),
        ])

        if (menuRes.ok) {
          const data = await menuRes.json()
          setCategories(data.categories || [])
        }

        if (galleryRes.ok) {
          const data = await galleryRes.json()
          setGallery(data.images || [])
        }

        if (reviewsRes.ok) {
          const data = await reviewsRes.json()
          setReviews(data.reviews || [])
        }

        if (settingsRes.ok) {
          const data = await settingsRes.json()
          if (data.settings) {
            setSettings({
              whatsappNumber: data.settings.cafe_phone?.value || DEFAULT_SETTINGS.whatsappNumber,
              cafeName: data.settings.cafe_name?.value || DEFAULT_SETTINGS.cafeName,
              cafeTagline: data.settings.cafe_tagline?.value || DEFAULT_SETTINGS.cafeTagline,
              cafeLogo: data.settings.cafe_logo?.value || DEFAULT_SETTINGS.cafeLogo,
              cafeHeroImage: data.settings.cafe_hero_image?.value || DEFAULT_SETTINGS.cafeHeroImage,
              cafeHeroPositionX: data.settings.cafe_hero_position_x?.value || DEFAULT_SETTINGS.cafeHeroPositionX,
              cafeHeroPositionY: data.settings.cafe_hero_position_y?.value || DEFAULT_SETTINGS.cafeHeroPositionY,
              cafeHeroPositionXMobile: data.settings.cafe_hero_position_x_mobile?.value || DEFAULT_SETTINGS.cafeHeroPositionXMobile,
              cafeHeroPositionYMobile: data.settings.cafe_hero_position_y_mobile?.value || DEFAULT_SETTINGS.cafeHeroPositionYMobile,
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
          <p className="text-muted-foreground">Memuat...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-white">
      <Header settings={settings} />
      <HeroSection settings={settings} />
      <AboutSection settings={settings} />
      <FeaturedMenuSection categories={categories} />
      <ReservationSection settings={settings} />
      <GalleryPreviewSection images={gallery} />
      <ReviewsSection reviews={reviews} />
      <LocationSection settings={settings} />
      <Footer settings={settings} />
    </main>
  )
}

export default function Page() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-amber-600 animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Memuat...</p>
        </div>
      </div>
    }>
      <HomePage />
    </Suspense>
  )
}
