'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Coffee, ArrowLeft, Search, Calendar, Clock, Users,
  Phone, User, CheckCircle, XCircle, AlertCircle, Loader2,
  MessageCircle
} from 'lucide-react'
import Link from 'next/link'

interface CafeSettings {
  whatsappNumber: string
  cafeName: string
  cafeLogo: string
}

interface Reservation {
  id: string
  reservationCode: string | null
  name: string
  phone: string
  email: string | null
  date: string
  time: string
  guests: number
  notes: string | null
  status: string
  adminNotes: string | null
  createdAt: string
}

const DEFAULT_SETTINGS: CafeSettings = {
  whatsappNumber: '6282148615641',
  cafeName: 'Star Village Coffee',
  cafeLogo: '/images/logo.png'
}

const statusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle; description: string }> = {
  pending: {
    label: 'Menunggu Konfirmasi',
    color: 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30',
    icon: AlertCircle,
    description: 'Reservasi Anda sedang menunggu konfirmasi dari tim kami.'
  },
  confirmed: {
    label: 'Dikonfirmasi',
    color: 'bg-green-500/20 text-green-700 border-green-500/30',
    icon: CheckCircle,
    description: 'Reservasi Anda telah dikonfirmasi. Kami tunggu kedatangan Anda!'
  },
  completed: {
    label: 'Selesai',
    color: 'bg-blue-500/20 text-blue-700 border-blue-500/30',
    icon: CheckCircle,
    description: 'Terima kasih telah berkunjung! Semoga Anda puas dengan layanan kami.'
  },
  cancelled: {
    label: 'Dibatalkan',
    color: 'bg-red-500/20 text-red-700 border-red-500/30',
    icon: XCircle,
    description: 'Mohon maaf, reservasi Anda tidak dapat dilayani pada waktu tersebut.'
  }
}

export default function CekReservasiPage() {
  const [settings, setSettings] = useState<CafeSettings>(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)
  const [reservation, setReservation] = useState<Reservation | null>(null)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    code: '',
    phone: ''
  })

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/settings')
        if (res.ok) {
          const data = await res.json()
          if (data.settings) {
            setSettings({
              whatsappNumber: data.settings.cafe_phone?.value || DEFAULT_SETTINGS.whatsappNumber,
              cafeName: data.settings.cafe_name?.value || DEFAULT_SETTINGS.cafeName,
              cafeLogo: data.settings.cafe_logo?.value || DEFAULT_SETTINGS.cafeLogo,
            })
          }
        }
      } catch (error) {
        console.error('Error fetching settings:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setSearching(true)
    setError('')
    setReservation(null)

    if (!formData.code || !formData.phone) {
      setError('Kode reservasi dan nomor telepon harus diisi')
      setSearching(false)
      return
    }

    try {
      const response = await fetch(`/api/reservation?code=${encodeURIComponent(formData.code)}&phone=${encodeURIComponent(formData.phone)}`)
      const data = await response.json()

      if (response.ok && data.reservation) {
        setReservation(data.reservation)
      } else {
        setError(data.error || 'Reservasi tidak ditemukan. Pastikan kode dan nomor telepon sesuai.')
      }
    } catch (error) {
      console.error('Error searching reservation:', error)
      setError('Gagal mencari reservasi. Silakan coba lagi.')
    } finally {
      setSearching(false)
    }
  }

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
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-md">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/reservasi" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
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
        <div className="max-w-lg mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-amber-600" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Cek Status Reservasi</h1>
            <p className="text-muted-foreground">
              Masukkan kode reservasi dan nomor telepon untuk melihat status
            </p>
          </div>

          {/* Search Form */}
          <Card className="border-0 shadow-xl mb-6">
            <CardContent className="p-6">
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Kode Reservasi</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="Contoh: RSV-ABC123"
                    className="text-lg py-6 font-mono uppercase"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Nomor Telepon</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Nomor telepon saat reservasi"
                    className="py-6"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-amber-600 hover:bg-amber-700 py-6 text-lg"
                  disabled={searching}
                >
                  {searching ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Mencari...
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5 mr-2" />
                      Cek Status
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Error */}
          {error && (
            <Card className="border-red-200 bg-red-50 mb-6">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 text-red-700">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p>{error}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Reservation Result */}
          {reservation && (
            <Card className="border-0 shadow-xl overflow-hidden">
              <CardContent className="p-0">
                {/* Status Header */}
                <div className={`${
                  reservation.status === 'confirmed' ? 'bg-gradient-to-r from-green-500 to-emerald-600' :
                  reservation.status === 'cancelled' ? 'bg-gradient-to-r from-red-500 to-rose-600' :
                  reservation.status === 'completed' ? 'bg-gradient-to-r from-blue-500 to-indigo-600' :
                  'bg-gradient-to-r from-yellow-500 to-amber-600'
                } p-6 text-center text-white`}>
                  {(() => {
                    const config = statusConfig[reservation.status] || statusConfig.pending
                    const IconComponent = config.icon
                    return (
                      <>
                        <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
                          <IconComponent className="w-10 h-10 text-white" />
                        </div>
                        <Badge className="bg-white/20 text-white border-0 text-base px-4 py-1">
                          {config.label}
                        </Badge>
                        <p className="text-white/90 mt-2 text-sm">{config.description}</p>
                      </>
                    )
                  })()}
                </div>

                {/* Reservation Details */}
                <div className="p-6">
                  {/* Code */}
                  {reservation.reservationCode && (
                    <div className="text-center mb-6">
                      <p className="text-sm text-muted-foreground mb-1">Kode Reservasi</p>
                      <p className="text-2xl font-bold text-amber-700 font-mono">
                        {reservation.reservationCode}
                      </p>
                    </div>
                  )}

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-secondary/30 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">Nama</p>
                      </div>
                      <p className="font-semibold">{reservation.name}</p>
                    </div>
                    <div className="bg-secondary/30 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">Telepon</p>
                      </div>
                      <p className="font-semibold">{reservation.phone}</p>
                    </div>
                    <div className="bg-secondary/30 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">Tanggal</p>
                      </div>
                      <p className="font-semibold">{reservation.date}</p>
                    </div>
                    <div className="bg-secondary/30 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">Waktu</p>
                      </div>
                      <p className="font-semibold">{reservation.time}</p>
                    </div>
                    <div className="bg-secondary/30 rounded-xl p-4 col-span-2">
                      <div className="flex items-center gap-2 mb-1">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">Jumlah Tamu</p>
                      </div>
                      <p className="font-semibold">{reservation.guests} orang</p>
                    </div>
                  </div>

                  {/* Customer Notes */}
                  {reservation.notes && (
                    <div className="bg-muted rounded-xl p-4 mb-6">
                      <p className="text-xs text-muted-foreground mb-1">Catatan Anda</p>
                      <p className="text-sm">{reservation.notes}</p>
                    </div>
                  )}

                  {/* Admin Notes / Feedback */}
                  {reservation.adminNotes && (
                    <div className={`rounded-xl p-4 mb-6 ${
                      reservation.status === 'cancelled' 
                        ? 'bg-red-50 border border-red-200' 
                        : 'bg-green-50 border border-green-200'
                    }`}>
                      <p className={`text-xs font-medium mb-1 ${
                        reservation.status === 'cancelled' ? 'text-red-600' : 'text-green-600'
                      }`}>
                        Pesan dari {settings.cafeName}
                      </p>
                      <p className="text-sm">{reservation.adminNotes}</p>
                    </div>
                  )}

                  {/* Created At */}
                  <p className="text-xs text-muted-foreground text-center mb-4">
                    Reservasi dibuat: {new Date(reservation.createdAt).toLocaleString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>

                  {/* Contact Button */}
                  <a 
                    href={`https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(`Halo, saya ingin bertanya tentang reservasi saya dengan kode ${reservation.reservationCode}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Button variant="outline" className="w-full">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Hubungi via WhatsApp
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Back Links */}
          <div className="mt-6 flex justify-center gap-4">
            <Link href="/reservasi">
              <Button variant="ghost">
                <Calendar className="w-4 h-4 mr-2" />
                Buat Reservasi Baru
              </Button>
            </Link>
            <Link href="/">
              <Button variant="ghost">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Kembali ke Home
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
