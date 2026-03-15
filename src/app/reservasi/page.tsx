'use client'

import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Coffee, ArrowLeft, Calendar, Clock, Users, Phone,
  User, Mail, Check, Loader2, MapPin, Instagram, Copy,
  CheckCircle, XCircle, AlertCircle, ExternalLink, Home, TreePine, Armchair
} from 'lucide-react'
import Link from 'next/link'

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

interface ReservationResult {
  reservationCode: string | null
  name: string
  phone: string
  date: string
  time: string
  guests: number
  seatingType: string
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

export default function ReservasiPage() {
  const [settings, setSettings] = useState<CafeSettings>(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [reservationResult, setReservationResult] = useState<ReservationResult | null>(null)
  const [copied, setCopied] = useState(false)
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
        console.error('Error fetching settings:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Generate time slots
  const timeSlots: string[] = []
  for (let h = settings.openHour; h < settings.closeHour; h++) {
    timeSlots.push(`${String(h).padStart(2, '0')}:00`)
    timeSlots.push(`${String(h).padStart(2, '0')}:30`)
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
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-amber-100 text-amber-800">Reservasi</Badge>
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">Pesan Meja Anda</h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              Nikmati pengalaman ngopi yang nyaman dengan reservasi meja terlebih dahulu
            </p>
          </div>

          {/* Cara Reservasi Section - Enhanced Design */}
          <Card className="mb-10 border-0 shadow-xl overflow-hidden">
            <CardContent className="p-0">
              {/* Header */}
              <div className="bg-gradient-to-r from-amber-600 to-orange-600 px-6 py-4 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Cara Reservasi Meja</h2>
                    <p className="text-white/80 text-sm">Pesan tempat favoritmu dengan mudah!</p>
                  </div>
                </div>
              </div>
              
              {/* Steps */}
              <div className="p-6 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Step 1 */}
                  <div className="relative group">
                    <div className="bg-white rounded-2xl p-5 shadow-md hover:shadow-xl transition-all duration-300 border border-amber-100 h-full">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                          1
                        </div>
                        <div>
                          <p className="font-bold text-gray-800">Pilih Tanggal</p>
                          <p className="text-xs text-muted-foreground">Tentukan hari</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        Pilih <span className="font-medium text-amber-700">tanggal kunjungan</span> Anda. Reservasi bisa dilakukan maksimal H-1 sebelum kunjungan.
                      </p>
                      <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-amber-200 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-300" />
                    </div>
                  </div>
                  
                  {/* Step 2 */}
                  <div className="relative group">
                    <div className="bg-white rounded-2xl p-5 shadow-md hover:shadow-xl transition-all duration-300 border border-amber-100 h-full">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                          2
                        </div>
                        <div>
                          <p className="font-bold text-gray-800">Waktu & Tamu</p>
                          <p className="text-xs text-muted-foreground">Sesuaikan kebutuhan</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        Tentukan <span className="font-medium text-orange-700">waktu kedatangan</span> dan jumlah tamu. Pilih area Indoor (AC) atau Outdoor (taman).
                      </p>
                      <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-orange-200 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-300" />
                    </div>
                  </div>
                  
                  {/* Step 3 */}
                  <div className="relative group">
                    <div className="bg-white rounded-2xl p-5 shadow-md hover:shadow-xl transition-all duration-300 border border-amber-100 h-full">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                          3
                        </div>
                        <div>
                          <p className="font-bold text-gray-800">Isi Data</p>
                          <p className="text-xs text-muted-foreground">Lengkapi informasi</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        Lengkapi <span className="font-medium text-purple-700">nama & nomor HP</span>. Kami akan menghubungi Anda untuk konfirmasi reservasi.
                      </p>
                      <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-purple-200 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-300" />
                    </div>
                  </div>
                  
                  {/* Step 4 */}
                  <div className="relative group">
                    <div className="bg-white rounded-2xl p-5 shadow-md hover:shadow-xl transition-all duration-300 border border-green-100 h-full">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                          4
                        </div>
                        <div>
                          <p className="font-bold text-gray-800">Konfirmasi</p>
                          <p className="text-xs text-muted-foreground">Tunggu kabar</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        Simpan <span className="font-medium text-green-700">kode reservasi</span> Anda. Gunakan untuk melacak status dan datang tepat waktu!
                      </p>
                      <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-200 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-300" />
                    </div>
                  </div>
                </div>
                
                {/* Tips Card */}
                <div className="mt-6 p-4 bg-white rounded-xl border border-amber-200 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-blue-800 mb-1">Tips Reservasi</p>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Reservasi paling lambat H-1 sebelum kunjungan</li>
                        <li>• Datang 10-15 menit lebih awal</li>
                        <li>• Konfirmasi akan dikirim via WhatsApp</li>
                        <li>• Bisa lacak status dengan kode reservasi</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {success && reservationResult ? (
            <Card className="border-0 shadow-2xl overflow-hidden">
              <CardContent className="p-0">
                {/* Success Header */}
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-center text-white">
                  <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-12 h-12 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Reservasi Berhasil!</h2>
                  <p className="text-white/90">Reservasi Anda telah kami terima</p>
                </div>

                {/* Reservation Details */}
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
                            onClick={() => reservationResult.reservationCode && copyToClipboard(reservationResult.reservationCode)}
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

                  {/* Info Box */}
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
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
                        <ExternalLink className="w-5 h-5 mr-2" />
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
                  
                  <div className="mt-4 text-center">
                    <Link href="/">
                      <Button variant="ghost">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Kembali ke Home
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              {/* Form */}
              <Card className="lg:col-span-3 border-0 shadow-xl">
                <CardContent className="p-8">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Name */}
                    <div className="space-y-2">
                      <Label htmlFor="name" className="flex items-center gap-2">
                        <User className="w-4 h-4 text-amber-600" />
                        Nama Lengkap *
                      </Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Masukkan nama Anda"
                        required
                        className="py-6 text-lg"
                      />
                    </div>

                    {/* Phone & Email */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-amber-600" />
                          No. Telepon *
                        </Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="08xxxxxxxxxx"
                          required
                          className="py-6"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-amber-600" />
                          Email (opsional)
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="email@example.com"
                          className="py-6"
                        />
                      </div>
                    </div>

                    {/* Date & Time */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="date" className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-amber-600" />
                          Tanggal *
                        </Label>
                        <Input
                          id="date"
                          type="date"
                          value={formData.date}
                          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                          min={new Date().toISOString().split('T')[0]}
                          required
                          className="py-6"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="time" className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-amber-600" />
                          Waktu *
                        </Label>
                        <select
                          id="time"
                          value={formData.time}
                          onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                          required
                          className="w-full py-4 px-4 rounded-md border border-input bg-background text-base"
                        >
                          <option value="">Pilih waktu</option>
                          {timeSlots.map((slot) => (
                            <option key={slot} value={slot}>{slot}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Guests */}
                    <div className="space-y-2">
                      <Label htmlFor="guests" className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-amber-600" />
                        Jumlah Tamu
                      </Label>
                      <div className="flex items-center gap-4">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => setFormData({ ...formData, guests: Math.max(1, formData.guests - 1) })}
                        >
                          -
                        </Button>
                        <span className="text-2xl font-bold w-12 text-center">{formData.guests}</span>
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

                    {/* Seating Type */}
                    <div className="space-y-3">
                      <Label className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-amber-600" />
                        Pilih Area Tempat Duduk
                      </Label>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, seatingType: 'indoor' })}
                          className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                            formData.seatingType === 'indoor'
                              ? 'border-amber-500 bg-amber-50 shadow-md'
                              : 'border-border hover:border-amber-300 hover:bg-amber-50/50'
                          }`}
                        >
                          <div className="flex flex-col items-center gap-2">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                              formData.seatingType === 'indoor' ? 'bg-amber-500 text-white' : 'bg-muted'
                            }`}>
                              <Home className="w-6 h-6" />
                            </div>
                            <span className={`font-semibold ${formData.seatingType === 'indoor' ? 'text-amber-700' : ''}`}>
                              Indoor
                            </span>
                            <span className="text-xs text-muted-foreground text-center">
                              Ruang ber-AC nyaman
                            </span>
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, seatingType: 'outdoor' })}
                          className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                            formData.seatingType === 'outdoor'
                              ? 'border-green-500 bg-green-50 shadow-md'
                              : 'border-border hover:border-green-300 hover:bg-green-50/50'
                          }`}
                        >
                          <div className="flex flex-col items-center gap-2">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                              formData.seatingType === 'outdoor' ? 'bg-green-500 text-white' : 'bg-muted'
                            }`}>
                              <TreePine className="w-6 h-6" />
                            </div>
                            <span className={`font-semibold ${formData.seatingType === 'outdoor' ? 'text-green-700' : ''}`}>
                              Outdoor
                            </span>
                            <span className="text-xs text-muted-foreground text-center">
                              Taman terbuka asri
                            </span>
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                      <Label htmlFor="notes">Catatan (opsional)</Label>
                      <Textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Ada permintaan khusus? Tulis di sini..."
                        rows={3}
                      />
                    </div>

                    {/* Submit */}
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 py-7 text-lg shadow-xl"
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
                  </form>
                </CardContent>
              </Card>

              {/* Info Sidebar */}
              <div className="lg:col-span-2 space-y-4">
                <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-orange-50">
                  <CardContent className="p-6 space-y-4">
                    <h3 className="font-bold text-lg">Informasi Kontak</h3>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                        <Phone className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Telepon</p>
                        <a href={`https://wa.me/${settings.whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="font-medium text-green-600 hover:underline">
                          +62 {settings.whatsappNumber.slice(2, 5)}-{settings.whatsappNumber.slice(5, 9)}-{settings.whatsappNumber.slice(9)}
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center flex-shrink-0">
                        <Instagram className="w-5 h-5 text-pink-600" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Instagram</p>
                        <a href={`https://www.instagram.com/${settings.instagramHandle}/`} target="_blank" rel="noopener noreferrer" className="font-medium text-pink-600 hover:underline">
                          @{settings.instagramHandle}
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg">
                  <CardContent className="p-6 space-y-4">
                    <h3 className="font-bold text-lg">Jam Operasional</h3>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                        <Clock className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="font-medium">{String(settings.openHour).padStart(2, '0')}:00 - {String(settings.closeHour).padStart(2, '0')}:00 WIB</p>
                        <p className="text-sm text-muted-foreground">Setiap Hari</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg">
                  <CardContent className="p-6 space-y-4">
                    <h3 className="font-bold text-lg">Lokasi</h3>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <p className="font-medium">{settings.cafeAddress}</p>
                      </div>
                    </div>

                    <Link href="/#lokasi" className="block">
                      <Button variant="outline" className="w-full">
                        Lihat di Maps
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                {/* Quick Check Status */}
                <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
                  <CardContent className="p-6">
                    <h3 className="font-bold text-lg mb-3">Sudah Punya Reservasi?</h3>
                    <Link href="/reservasi/cek">
                      <Button variant="outline" className="w-full border-blue-300 text-blue-700 hover:bg-blue-100">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Cek Status Reservasi
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
