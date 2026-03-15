'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Coffee, ArrowLeft, Star, Gift, Phone, User, 
  Loader2, Search, Award, TrendingUp, Calendar,
  Sparkles, CheckCircle, Zap, Crown
} from 'lucide-react'
import Link from 'next/link'

interface LoyaltyMember {
  id: string
  name: string
  phone: string
  email: string | null
  points: number
  level: string
  totalSpent: number
  createdAt: string
}

interface RecentOrder {
  orderNumber: string
  total: number
  status: string
  loyaltyPointsEarned: number | null
  createdAt: string
}

interface CafeSettings {
  whatsappNumber: string
  cafeName: string
  cafeLogo: string
}

const DEFAULT_SETTINGS: CafeSettings = {
  whatsappNumber: '6282148615641',
  cafeName: 'Star Village Coffee',
  cafeLogo: '/images/logo.png',
}

const formatPrice = (price: number) => `Rp ${(price * 1000).toLocaleString('id-ID')}`

// Level badge colors
const levelColors: Record<string, string> = {
  bronze: 'bg-amber-700 text-white',
  silver: 'bg-gray-400 text-white',
  gold: 'bg-yellow-500 text-white',
  platinum: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
}

const levelNames: Record<string, string> = {
  bronze: 'Bronze',
  silver: 'Silver',
  gold: 'Gold',
  platinum: 'Platinum',
}

const levelIcons: Record<string, string> = {
  bronze: '🥉',
  silver: '🥈',
  gold: '🥇',
  platinum: '💎',
}

// Level requirements
const levelRequirements = [
  { level: 'bronze', name: 'Bronze', minSpent: 0, icon: '🥉', color: 'from-amber-700 to-amber-800', benefits: ['Poin 1x untuk setiap Rp 10.000', 'Notifikasi promo spesial'] },
  { level: 'silver', name: 'Silver', minSpent: 500, icon: '🥈', color: 'from-gray-400 to-gray-500', benefits: ['Poin 1.5x untuk setiap Rp 10.000', 'Prioritas reservasi', 'Diskon 5% setiap bulan'] },
  { level: 'gold', name: 'Gold', minSpent: 1500, icon: '🥇', color: 'from-yellow-500 to-yellow-600', benefits: ['Poin 2x untuk setiap Rp 10.000', 'Free upgrade size 1x/bulan', 'Diskon 10% setiap bulan', 'Akses VIP area'] },
  { level: 'platinum', name: 'Platinum', minSpent: 5000, icon: '💎', color: 'from-purple-500 to-pink-500', benefits: ['Poin 3x untuk setiap Rp 10.000', 'Free drink setiap bulan', 'Diskon 15% setiap bulan', 'Priority service', 'Special birthday gift'] },
]

// Redeem options
const redeemOptions = [
  { points: 50, reward: 'Free Kopi Susu (Any Size)', icon: '☕' },
  { points: 100, reward: 'Free Signature Drink', icon: '🍹' },
  { points: 150, reward: 'Free Snack Platter', icon: '🍪' },
  { points: 200, reward: 'Free Main Course', icon: '🍔' },
  { points: 500, reward: 'Rp 50.000 Voucher', icon: '🎁' },
]

export default function LoyaltyPage() {
  const [settings, setSettings] = useState<CafeSettings>(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)
  const [phone, setPhone] = useState('')
  const [member, setMember] = useState<LoyaltyMember | null>(null)
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchSettings() {
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
    fetchSettings()
  }, [])

  const searchMember = async () => {
    if (!phone.trim()) {
      setError('Masukkan nomor telepon')
      return
    }

    setSearching(true)
    setError('')
    setMember(null)
    setRecentOrders([])

    try {
      const res = await fetch(`/api/loyalty?phone=${phone}`)
      const data = await res.json()

      if (res.ok) {
        setMember(data.member)
        setRecentOrders(data.recentOrders || [])
      } else {
        setError(data.error || 'Member tidak ditemukan')
      }
    } catch (error) {
      console.error('Error searching member:', error)
      setError('Gagal mencari data member')
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
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-10">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center mx-auto mb-4 shadow-xl">
              <Gift className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Loyalty Points</h1>
            <p className="text-muted-foreground">Kumpulkan poin, dapatkan rewards menarik!</p>
          </div>

          {/* What is Loyalty Section */}
          <Card className="mb-8 border-0 shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-amber-600 to-orange-600 px-6 py-4 text-white">
              <div className="flex items-center gap-3">
                <Sparkles className="w-6 h-6" />
                <h2 className="text-xl font-bold">Apa itu Loyalty Points?</h2>
              </div>
            </div>
            <CardContent className="p-6 bg-gradient-to-br from-amber-50 to-orange-50">
              <p className="text-gray-700 leading-relaxed mb-4">
                <span className="font-semibold text-amber-700">Loyalty Points</span> adalah program hadiah dari Star Village Coffee untuk pelanggan setia kami. 
                Setiap kali Anda bertransaksi, Anda akan mendapatkan poin yang bisa ditukar dengan berbagai hadiah menarik!
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Kumpulkan Poin</p>
                    <p className="text-xs text-muted-foreground">Setiap transaksi</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Naik Level</p>
                    <p className="text-xs text-muted-foreground">Benefit makin banyak</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <Gift className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Tukar Hadiah</p>
                    <p className="text-xs text-muted-foreground">Menu gratis & voucher</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* How to Earn Points */}
          <Card className="mb-8 border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                  <Star className="w-5 h-5 text-amber-600" />
                </div>
                <h2 className="text-xl font-bold">Cara Mendapatkan Poin</h2>
              </div>
              <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl p-5 border border-amber-200">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-amber-500 flex items-center justify-center text-white shadow-lg">
                    <span className="text-2xl font-bold">1</span>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-amber-700">1 Poin</p>
                    <p className="text-gray-600">untuk setiap pembelanjaan</p>
                  </div>
                  <div className="ml-auto text-right">
                    <p className="text-3xl font-bold text-amber-600">Rp 10.000</p>
                    <p className="text-sm text-muted-foreground">Minimal transaksi</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>✅ Poin otomatis masuk setelah pembayaran dikonfirmasi</p>
                  <p>✅ Bonus poin extra untuk member level Silver ke atas</p>
                  <p>✅ Poin tidak bisa dipindahtangankan ke member lain</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Level System */}
          <Card className="mb-8 border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                  <Crown className="w-5 h-5 text-purple-600" />
                </div>
                <h2 className="text-xl font-bold">Sistem Level Member</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {levelRequirements.map((lvl) => (
                  <div key={lvl.level} className={`rounded-xl overflow-hidden border ${member?.level === lvl.level ? 'ring-2 ring-amber-500 ring-offset-2' : ''}`}>
                    <div className={`bg-gradient-to-r ${lvl.color} px-4 py-3 text-white text-center`}>
                      <span className="text-2xl">{lvl.icon}</span>
                      <p className="font-bold mt-1">{lvl.name}</p>
                      <p className="text-xs opacity-80">Min. Rp {(lvl.minSpent * 1000).toLocaleString('id-ID')}</p>
                    </div>
                    <div className="p-3 bg-white">
                      <ul className="text-xs text-gray-600 space-y-1">
                        {lvl.benefits.map((b, i) => (
                          <li key={i} className="flex items-start gap-1">
                            <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 shrink-0" />
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* How to Redeem */}
          <Card className="mb-8 border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                  <Gift className="w-5 h-5 text-green-600" />
                </div>
                <h2 className="text-xl font-bold">Cara Menukar Poin</h2>
              </div>
              
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-5 border border-green-200 mb-4">
                <ol className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-bold shrink-0">1</div>
                    <p className="text-gray-700">Hubungi <span className="font-semibold">staff cafe</span> atau WhatsApp kami</p>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-bold shrink-0">2</div>
                    <p className="text-gray-700">Sebutkan <span className="font-semibold">nomor HP</span> yang terdaftar sebagai member</p>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-bold shrink-0">3</div>
                    <p className="text-gray-700">Pilih <span className="font-semibold">hadiah</span> yang ingin ditukar</p>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-bold shrink-0">4</div>
                    <p className="text-gray-700">Poin akan <span className="font-semibold">dikurangi</span> dan hadiah bisa langsung dinikmati!</p>
                  </li>
                </ol>
              </div>
              
              <h3 className="font-semibold mb-3">Pilihan Hadiah:</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {redeemOptions.map((opt) => (
                  <div key={opt.points} className="bg-white rounded-xl p-3 border border-gray-200 text-center hover:shadow-md transition-shadow">
                    <span className="text-2xl">{opt.icon}</span>
                    <p className="text-xs text-gray-600 mt-2 line-clamp-2">{opt.reward}</p>
                    <Badge className="mt-2 bg-amber-100 text-amber-700">{opt.points} poin</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Check Your Points Section */}
          <Card className="mb-8 border-0 shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4 text-white">
              <div className="flex items-center gap-3">
                <Search className="w-6 h-6" />
                <h2 className="text-xl font-bold">Cek Poin Anda</h2>
              </div>
            </div>
            <CardContent className="p-6 bg-gradient-to-br from-purple-50 to-pink-50">
              <div className="flex gap-2 mb-4">
                <div className="relative flex-1">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Masukkan nomor telepon (08xxx)"
                    className="pl-10 py-6 text-lg border-purple-200 focus:border-purple-500"
                    onKeyDown={(e) => e.key === 'Enter' && searchMember()}
                  />
                </div>
                <Button 
                  onClick={searchMember}
                  disabled={searching}
                  className="bg-purple-600 hover:bg-purple-700 px-8"
                >
                  {searching ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                </Button>
              </div>
              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}

              {/* Member Info */}
              {member && (
                <div className="mt-4 bg-white rounded-xl overflow-hidden shadow-lg">
                  {/* Member Header */}
                  <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-white">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
                        <User className="w-7 h-7" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">{member.name}</h3>
                        <p className="text-white/80">{member.phone}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    {/* Level Badge */}
                    <div className="flex items-center justify-between mb-6 p-4 bg-secondary/30 rounded-xl">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{levelIcons[member.level] || '⭐'}</span>
                        <div>
                          <p className="text-sm text-muted-foreground">Level Member</p>
                          <Badge className={`${levelColors[member.level] || 'bg-gray-500 text-white'} text-sm px-3 py-1`}>
                            {levelNames[member.level] || member.level}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                        <div className="flex items-center gap-2 mb-2">
                          <Star className="w-5 h-5 text-amber-600" />
                          <span className="text-sm text-muted-foreground">Poin Tersedia</span>
                        </div>
                        <p className="text-3xl font-bold text-amber-700">{member.points.toLocaleString()}</p>
                      </div>
                      <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="w-5 h-5 text-green-600" />
                          <span className="text-sm text-muted-foreground">Total Belanja</span>
                        </div>
                        <p className="text-3xl font-bold text-green-700">{formatPrice(member.totalSpent)}</p>
                      </div>
                    </div>

                    {/* Member Since */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                      <Calendar className="w-4 h-4" />
                      <span>Member sejak {new Date(member.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    </div>

                    {/* Recent Orders */}
                    {recentOrders.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <Award className="w-5 h-5 text-amber-600" />
                          Pesanan Terakhir
                        </h4>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {recentOrders.map((order, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                              <div>
                                <p className="font-medium text-sm">{order.orderNumber}</p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(order.createdAt).toLocaleDateString('id-ID')}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-medium text-sm">{formatPrice(order.total)}</p>
                                {order.loyaltyPointsEarned && order.loyaltyPointsEarned > 0 && (
                                  <p className="text-xs text-green-600">+{order.loyaltyPointsEarned} poin</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Register CTA */}
          <Card className="border-0 shadow-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white">
            <CardContent className="p-6 text-center">
              <Gift className="w-12 h-12 mx-auto mb-4 opacity-80" />
              <h3 className="text-xl font-bold mb-2">Belum Jadi Member?</h3>
              <p className="text-white/90 mb-4">Daftar sekarang dan mulai kumpulkan poin!</p>
              <Link href={`https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent('Halo, saya ingin daftar member loyalty Star Village Coffee!')}`}>
                <Button className="bg-white text-amber-700 hover:bg-amber-50 px-8 py-6 text-lg font-bold">
                  <Phone className="w-5 h-5 mr-2" />
                  Daftar via WhatsApp
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
