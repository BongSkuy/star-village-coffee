'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Coffee, ArrowLeft, MapPin, Clock, Phone, 
  ShoppingCart, Truck, Store, 
  CreditCard, Wallet, Banknote, Loader2, Check,
  QrCode
} from 'lucide-react'
import Link from 'next/link'

// Dynamically import map to avoid SSR issues
const DeliveryMap = dynamic(() => import('@/components/map/DeliveryMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[300px] sm:h-[400px] bg-gray-100 rounded-xl flex items-center justify-center border-2 border-gray-200">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-amber-600" />
        <span className="text-muted-foreground text-sm">Memuat peta...</span>
      </div>
    </div>
  ),
})

// Types
interface CartItem {
  id: string
  itemId: string
  itemName: string
  variantId: string
  variantName: string
  price: number
  quantity: number
}

interface DeliveryZone {
  id: string
  name: string
  minDistance: number
  maxDistance: number
  fee: number
  minOrder: number
}

interface CafeSettings {
  whatsappNumber: string
  cafeName: string
  cafeLogo: string
  cafeAddress: string
  openHour: number
  closeHour: number
  bankBcaNumber?: string
  bankBcaName?: string
  bankMandiriNumber?: string
  bankMandiriName?: string
  qrisImage?: string
}

interface DeliveryInfo {
  distance: number
  inRange: boolean
  zone: DeliveryZone | null
  fee: number
  minOrder: number
  coordinates?: { lat: number; lng: number }
  message: string
}

const DEFAULT_SETTINGS: CafeSettings = {
  whatsappNumber: '6282148615641',
  cafeName: 'Star Village Coffee',
  cafeLogo: '/images/logo.png',
  cafeAddress: 'Jl. Tentara Pelajar, Dusun 3, Kiringan, Boyolali, Jawa Tengah',
  openHour: 10,
  closeHour: 23,
}

const formatPrice = (price: number) => `Rp ${(price * 1000).toLocaleString('id-ID')}`

// Checkout Page Component
function CheckoutPage() {
  const router = useRouter()
  
  const [settings, setSettings] = useState<CafeSettings>(DEFAULT_SETTINGS)
  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>([])
  const [maxDistance, setMaxDistance] = useState(6)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [orderComplete, setOrderComplete] = useState(false)
  const [orderNumber, setOrderNumber] = useState('')
  
  // Cart
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  
  // Form state
  const [orderType, setOrderType] = useState<'pickup' | 'delivery'>('pickup')
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [notes, setNotes] = useState('')
  
  // Delivery
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [deliveryLat, setDeliveryLat] = useState<number | null>(null)
  const [deliveryLng, setDeliveryLng] = useState<number | null>(null)
  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryInfo | null>(null)
  const [deliveryMethod, setDeliveryMethod] = useState<'staff' | 'gosend'>('staff')
  const [checkingDelivery, setCheckingDelivery] = useState(false)
  
  // Payment
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'transfer' | 'qris'>('cod')
  
  // Promo
  const [promoCode, setPromoCode] = useState('')
  const [promoDiscount, setPromoDiscount] = useState(0)
  const [promoLoading, setPromoLoading] = useState(false)

  // Calculate subtotal
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const discountAmount = promoDiscount > 0 ? Math.ceil(subtotal * promoDiscount / 100) : 0
  const deliveryFee = deliveryMethod === 'staff' && deliveryInfo?.inRange ? deliveryInfo.fee : 0
  const total = subtotal - discountAmount + deliveryFee

  useEffect(() => {
    async function fetchData() {
      try {
        // Load settings
        const settingsRes = await fetch('/api/settings')
        if (settingsRes.ok) {
          const data = await settingsRes.json()
          if (data.settings) {
            setSettings({
              whatsappNumber: data.settings.cafe_phone?.value || DEFAULT_SETTINGS.whatsappNumber,
              cafeName: data.settings.cafe_name?.value || DEFAULT_SETTINGS.cafeName,
              cafeLogo: data.settings.cafe_logo?.value || DEFAULT_SETTINGS.cafeLogo,
              cafeAddress: data.settings.cafe_address?.value || DEFAULT_SETTINGS.cafeAddress,
              openHour: parseInt(data.settings.open_hour?.value) || DEFAULT_SETTINGS.openHour,
              closeHour: parseInt(data.settings.close_hour?.value) || DEFAULT_SETTINGS.closeHour,
              bankBcaNumber: data.settings.bank_bca_number?.value,
              bankBcaName: data.settings.bank_bca_name?.value,
              bankMandiriNumber: data.settings.bank_mandiri_number?.value,
              bankMandiriName: data.settings.bank_mandiri_name?.value,
              qrisImage: data.settings.qris_image?.value,
            })
          }
        }
        
        // Load delivery zones
        const deliveryRes = await fetch('/api/delivery')
        if (deliveryRes.ok) {
          const data = await deliveryRes.json()
          setDeliveryZones(data.zones || [])
          setMaxDistance(data.maxDistance || 6)
        }
        
        // Load cart
        const savedCart = localStorage.getItem('cart')
        if (savedCart) {
          setCartItems(JSON.parse(savedCart))
        } else {
          router.push('/menu')
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [router])

  // Handle location selection from map
  const handleMapLocationSelect = async (lat: number, lng: number, address: string) => {
    setDeliveryLat(lat)
    setDeliveryLng(lng)
    setDeliveryAddress(address)
    
    // Check delivery zone
    await checkDelivery(lat, lng)
  }

  // Check delivery from coordinates
  const checkDelivery = async (lat: number, lng: number) => {
    setCheckingDelivery(true)
    try {
      const res = await fetch('/api/delivery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat, lng })
      })
      
      const data = await res.json()
      setDeliveryInfo(data)
      
      if (data.inRange) {
        setDeliveryMethod('staff')
      } else {
        setDeliveryMethod('gosend')
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setCheckingDelivery(false)
    }
  }

  // Validate promo
  const validatePromo = async () => {
    if (!promoCode.trim()) return
    
    setPromoLoading(true)
    try {
      const res = await fetch('/api/promos/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoCode, total: subtotal })
      })
      
      const data = await res.json()
      if (data.valid && data.promo) {
        setPromoDiscount(data.promo.discount)
        alert(`Kode promo berhasil! Diskon ${data.promo.discount}%`)
      } else {
        alert(data.error || 'Kode promo tidak valid')
        setPromoDiscount(0)
      }
    } catch {
      alert('Gagal validasi kode promo')
    } finally {
      setPromoLoading(false)
    }
  }

  // Open GoSend app
  const openGoSendApp = () => {
    // Try deep link first, fallback to web
    const deepLink = 'gojek://gosend'
    const webLink = 'https://gojek.com/gosend/'
    
    // Try to open app, if fails open web
    const startTime = Date.now()
    window.location.href = deepLink
    
    setTimeout(() => {
      if (Date.now() - startTime < 2000) {
        window.open(webLink, '_blank')
      }
    }, 1500)
  }

  // Submit order
  const submitOrder = async () => {
    if (!customerName.trim()) {
      alert('Nama harus diisi')
      return
    }
    if (!customerPhone.trim()) {
      alert('Nomor telepon harus diisi')
      return
    }
    
    if (orderType === 'delivery') {
      if (!deliveryAddress.trim()) {
        alert('Pilih lokasi pengiriman di peta')
        return
      }
      
      if (deliveryMethod === 'staff') {
        if (!deliveryInfo?.inRange) {
          alert('Lokasi di luar jangkauan delivery. Silakan pilih Pick Up.')
          return
        }
        if (subtotal < deliveryInfo.minOrder) {
          alert(`Minimum order untuk zona ini adalah ${formatPrice(deliveryInfo.minOrder)}`)
          return
        }
      }
    }
    
    setSubmitting(true)
    
    try {
      const orderData = {
        customerName,
        customerPhone,
        customerEmail: customerEmail || null,
        subtotal,
        discount: discountAmount,
        voucherCode: promoDiscount > 0 ? promoCode : null,
        total,
        status: 'pending',
        paymentStatus: 'pending',
        paymentMethod,
        notes: notes || null,
        source: 'website',
        orderType,
        deliveryAddress: orderType === 'delivery' ? deliveryAddress : null,
        deliveryFee,
        deliveryMethod: orderType === 'delivery' ? deliveryMethod : null,
        deliveryLat: orderType === 'delivery' ? deliveryLat : null,
        deliveryLng: orderType === 'delivery' ? deliveryLng : null,
        deliveryDistance: deliveryInfo?.distance || null,
        deliveryZone: deliveryInfo?.zone?.name || null,
        estimatedTime: orderType === 'pickup' ? '15-30 menit' : '30-60 menit',
        items: cartItems.map(item => ({
          itemId: item.itemId,
          itemName: item.itemName,
          variantName: item.variantName,
          variantId: item.variantId,
          price: item.price,
          quantity: item.quantity,
          subtotal: item.price * item.quantity
        }))
      }
      
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      })
      
      if (res.ok) {
        const data = await res.json()
        const orderNum = data.order?.orderNumber || ''
        
        localStorage.removeItem('cart')
        setOrderNumber(orderNum)
        setOrderComplete(true)
        
        // WhatsApp notification
        const orderTypeText = orderType === 'pickup' ? 'Pick Up' : `Delivery (${deliveryMethod === 'staff' ? 'Staff' : 'GoSend'})`
        const paymentText = paymentMethod === 'cod' ? 'Bayar di Tempat' : paymentMethod === 'transfer' ? 'Transfer Bank' : 'QRIS'
        
        const waMessage = `*PESANAN BARU*

Order: ${orderNum}
Tipe: ${orderTypeText}
${orderType === 'delivery' ? `Alamat: ${deliveryAddress}
Koordinat: ${deliveryLat?.toFixed(6)}, ${deliveryLng?.toFixed(6)}
Jarak: ${deliveryInfo?.distance?.toFixed(1) || '-'} km
Ongkir: ${formatPrice(deliveryFee)}
` : ''}
Nama: ${customerName}
HP: ${customerPhone}

*Items:*
${cartItems.map(i => `• ${i.itemName} (${i.variantName}) x${i.quantity}`).join('\n')}

Subtotal: ${formatPrice(subtotal)}
${discountAmount > 0 ? `Diskon: -${formatPrice(discountAmount)}\n` : ''}Total: ${formatPrice(total)}

Bayar: ${paymentText}
${notes ? `Catatan: ${notes}` : ''}`
        
        window.open(`https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(waMessage)}`, '_blank')
      } else {
        const data = await res.json()
        alert(data.error || 'Gagal membuat pesanan')
      }
    } catch {
      alert('Terjadi kesalahan. Coba lagi.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-amber-600" />
          <p className="text-muted-foreground">Memuat...</p>
        </div>
      </div>
    )
  }

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg border-0 shadow-2xl">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Pesanan Berhasil!</h1>
            <p className="text-muted-foreground mb-4">Nomor pesanan Anda:</p>
            <div className="bg-secondary rounded-xl p-4 mb-6">
              <p className="text-2xl font-bold text-amber-700">{orderNumber}</p>
            </div>
            
            {paymentMethod === 'cod' && (
              <>
                <div className="bg-amber-50 rounded-xl p-4 mb-6 text-left">
                  <p className="font-semibold mb-2 text-amber-700">Langkah Selanjutnya:</p>
                  <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                    <li>Klik tombol <strong>"Konfirmasi Pesanan"</strong></li>
                    <li>Konfirmasi bahwa Anda akan mengambil/menerima pesanan</li>
                    <li>Pesanan akan diproses setelah konfirmasi</li>
                  </ol>
                  <p className="text-sm mt-3 font-medium text-amber-700">Bayar saat ambil/terima pesanan</p>
                </div>
                <div className="flex gap-3">
                  <Link href="/" className="flex-1"><Button variant="outline" className="w-full">Home</Button></Link>
                  <Link href={`/order/${orderNumber}`} className="flex-1"><Button className="w-full bg-amber-600 hover:bg-amber-700">Konfirmasi</Button></Link>
                </div>
              </>
            )}
            
            {paymentMethod === 'transfer' && (
              <>
                {settings.bankBcaNumber && (
                  <div className="bg-blue-50 rounded-xl p-4 mb-4 text-left">
                    <p className="font-semibold mb-2">Transfer ke BCA:</p>
                    <p className="font-mono text-lg">{settings.bankBcaNumber}</p>
                    <p className="text-sm text-muted-foreground">a.n {settings.bankBcaName}</p>
                    <p className="font-bold text-lg mt-2">Total: {formatPrice(total)}</p>
                  </div>
                )}
                {settings.bankMandiriNumber && (
                  <div className="bg-yellow-50 rounded-xl p-4 mb-4 text-left">
                    <p className="font-semibold mb-2">Transfer ke Mandiri:</p>
                    <p className="font-mono text-lg">{settings.bankMandiriNumber}</p>
                    <p className="text-sm text-muted-foreground">a.n {settings.bankMandiriName}</p>
                    <p className="font-bold text-lg mt-2">Total: {formatPrice(total)}</p>
                  </div>
                )}
                <div className="bg-amber-50 rounded-xl p-4 mb-4 text-left">
                  <p className="font-semibold mb-2 text-amber-700">Langkah Selanjutnya:</p>
                  <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                    <li>Transfer sesuai nominal</li>
                    <li>Buka halaman tracking pesanan</li>
                    <li>Upload bukti transfer</li>
                  </ol>
                </div>
                <div className="flex gap-3">
                  <Link href="/" className="flex-1"><Button variant="outline" className="w-full">Home</Button></Link>
                  <Link href={`/order/${orderNumber}`} className="flex-1"><Button className="w-full bg-amber-600 hover:bg-amber-700">Upload Bukti</Button></Link>
                </div>
              </>
            )}
            
            {paymentMethod === 'qris' && settings.qrisImage && (
              <>
                <div className="bg-purple-50 rounded-xl p-4 mb-4">
                  <p className="font-semibold mb-2">Scan QRIS:</p>
                  <img src={settings.qrisImage} alt="QRIS" className="mx-auto rounded-lg max-h-48" />
                  <p className="font-bold text-lg mt-2">Total: {formatPrice(total)}</p>
                </div>
                <div className="flex gap-3">
                  <Link href="/" className="flex-1"><Button variant="outline" className="w-full">Home</Button></Link>
                  <Link href={`/order/${orderNumber}`} className="flex-1"><Button className="w-full bg-amber-600 hover:bg-amber-700">Upload Bukti</Button></Link>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-md">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/menu" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
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
              <span className="font-bold text-lg hidden sm:block">Checkout</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left - Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Type */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Tipe Pesanan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setOrderType('pickup')}
                    className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                      orderType === 'pickup' ? 'border-amber-600 bg-amber-50 text-amber-700' : 'border-gray-200 hover:border-amber-300'
                    }`}
                  >
                    <Store className="w-8 h-8" />
                    <span className="font-semibold">Pick Up</span>
                    <span className="text-xs text-muted-foreground">Ambil di tempat</span>
                  </button>
                  <button
                    onClick={() => setOrderType('delivery')}
                    className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                      orderType === 'delivery' ? 'border-amber-600 bg-amber-50 text-amber-700' : 'border-gray-200 hover:border-amber-300'
                    }`}
                  >
                    <Truck className="w-8 h-8" />
                    <span className="font-semibold">Delivery</span>
                    <span className="text-xs text-muted-foreground">Antar ke alamat</span>
                  </button>
                </div>
                
                {orderType === 'pickup' && (
                  <div className="mt-4 p-4 bg-amber-50 rounded-xl">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-amber-600 mt-0.5" />
                      <div>
                        <p className="font-medium">Alamat Cafe</p>
                        <p className="text-sm text-muted-foreground">{settings.cafeAddress}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          <Clock className="w-4 h-4 inline mr-1" />
                          Estimasi siap: 15-30 menit
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Delivery Details with Map */}
            {orderType === 'delivery' && (
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Lokasi Pengiriman
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Interactive Map */}
                  <div className="space-y-2">
                    <Label className="text-base font-semibold">📍 Pilih lokasi pengiriman</Label>
                    <DeliveryMap 
                      onLocationSelect={handleMapLocationSelect}
                      initialLat={deliveryLat}
                      initialLng={deliveryLng}
                    />
                  </div>
                  
                  {/* Loading indicator */}
                  {checkingDelivery && (
                    <div className="flex items-center gap-2 text-amber-600">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Menghitung jarak...</span>
                    </div>
                  )}
                  
                  {/* Selected Address */}
                  {deliveryAddress && (
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <Label className="text-xs text-muted-foreground">Alamat Terpilih:</Label>
                      <p className="text-sm mt-1">{deliveryAddress}</p>
                      {deliveryLat && deliveryLng && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Koordinat: {deliveryLat.toFixed(6)}, {deliveryLng.toFixed(6)}
                        </p>
                      )}
                    </div>
                  )}
                  
                  {/* Delivery Result - In Range */}
                  {deliveryInfo && deliveryInfo.inRange && (
                    <div className="p-4 bg-green-50 rounded-xl">
                      <div className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-600 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-medium text-green-700">
                            {deliveryInfo.message}
                          </p>
                          {deliveryInfo.zone && (
                            <div className="mt-2 text-sm text-muted-foreground">
                              <p>Jarak: {deliveryInfo.distance.toFixed(1)} km</p>
                              <p>Ongkir: {formatPrice(deliveryInfo.fee)}</p>
                              <p>Min. Order: {formatPrice(deliveryInfo.zone.minOrder)}</p>
                              {subtotal < deliveryInfo.zone.minOrder && (
                                <p className="text-amber-600 font-medium mt-1">
                                  ⚠️ Tambah {formatPrice(deliveryInfo.zone.minOrder - subtotal)} lagi untuk min. order
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Delivery Result - Out of Range */}
                  {deliveryInfo && !deliveryInfo.inRange && (
                    <div className="p-4 bg-red-50 rounded-xl">
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-red-600 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-medium text-red-700">
                            Lokasi di luar jangkauan delivery
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Jarak: {deliveryInfo.distance.toFixed(1)} km (maksimal {maxDistance} km)
                          </p>
                          <p className="text-sm text-muted-foreground mt-2">
                            Silakan pilih Pick Up atau hubungi kami via WhatsApp untuk pengiriman khusus.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Customer Info */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  Informasi Pemesan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Nama Lengkap *</Label>
                    <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Nama Anda" />
                  </div>
                  <div>
                    <Label>Nomor Telepon *</Label>
                    <Input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="08xxxxxxxxxx" />
                  </div>
                </div>
                <div>
                  <Label>Email (opsional)</Label>
                  <Input type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} placeholder="email@example.com" />
                </div>
                <div>
                  <Label>Catatan</Label>
                  <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Catatan untuk pesanan..." rows={2} />
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Metode Pembayaran
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <button
                    onClick={() => setPaymentMethod('cod')}
                    className={`w-full p-4 rounded-xl border-2 flex items-center gap-4 transition-all ${
                      paymentMethod === 'cod' ? 'border-amber-600 bg-amber-50' : 'border-gray-200 hover:border-amber-300'
                    }`}
                  >
                    <Banknote className="w-6 h-6 text-green-600" />
                    <div className="text-left">
                      <p className="font-semibold">Bayar di Tempat</p>
                      <p className="text-xs text-muted-foreground">COD - Bayar saat terima</p>
                    </div>
                  </button>
                  
                  {(settings.bankBcaNumber || settings.bankMandiriNumber) && (
                    <button
                      onClick={() => setPaymentMethod('transfer')}
                      className={`w-full p-4 rounded-xl border-2 flex items-center gap-4 transition-all ${
                        paymentMethod === 'transfer' ? 'border-amber-600 bg-amber-50' : 'border-gray-200 hover:border-amber-300'
                      }`}
                    >
                      <Wallet className="w-6 h-6 text-blue-600" />
                      <div className="text-left">
                        <p className="font-semibold">Transfer Bank</p>
                        <p className="text-xs text-muted-foreground">
                          {settings.bankBcaNumber && `BCA ${settings.bankBcaNumber}`}
                          {settings.bankBcaNumber && settings.bankMandiriNumber && ' / '}
                          {settings.bankMandiriNumber && `Mandiri ${settings.bankMandiriNumber}`}
                        </p>
                      </div>
                    </button>
                  )}
                  
                  {settings.qrisImage && (
                    <button
                      onClick={() => setPaymentMethod('qris')}
                      className={`w-full p-4 rounded-xl border-2 flex items-center gap-4 transition-all ${
                        paymentMethod === 'qris' ? 'border-amber-600 bg-amber-50' : 'border-gray-200 hover:border-amber-300'
                      }`}
                    >
                      <QrCode className="w-6 h-6 text-purple-600" />
                      <div className="text-left">
                        <p className="font-semibold">QRIS</p>
                        <p className="text-xs text-muted-foreground">Scan QR untuk bayar</p>
                      </div>
                    </button>
                  )}
                </div>
                
                {paymentMethod === 'transfer' && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-xl">
                    <p className="font-semibold mb-2">Transfer ke:</p>
                    {settings.bankBcaNumber && (
                      <div className="mb-2">
                        <p className="text-sm font-medium">Bank BCA</p>
                        <p className="font-mono">{settings.bankBcaNumber}</p>
                        <p className="text-sm text-muted-foreground">a.n {settings.bankBcaName}</p>
                      </div>
                    )}
                    {settings.bankMandiriNumber && (
                      <div>
                        <p className="text-sm font-medium">Bank Mandiri</p>
                        <p className="font-mono">{settings.bankMandiriNumber}</p>
                        <p className="text-sm text-muted-foreground">a.n {settings.bankMandiriName}</p>
                      </div>
                    )}
                  </div>
                )}
                
                {paymentMethod === 'qris' && settings.qrisImage && (
                  <div className="mt-4 p-4 bg-purple-50 rounded-xl text-center">
                    <p className="font-semibold mb-2">QRIS:</p>
                    <img src={settings.qrisImage} alt="QRIS" className="mx-auto rounded-lg max-h-32" />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right - Order Summary */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-lg sticky top-24">
              <CardHeader>
                <CardTitle>Ringkasan Pesanan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Items */}
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {cartItems.map(item => (
                    <div key={item.id} className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-sm">{item.itemName}</p>
                        <p className="text-xs text-muted-foreground">{item.variantName} x{item.quantity}</p>
                      </div>
                      <p className="text-sm">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
                
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Diskon ({promoDiscount}%)</span>
                      <span>-{formatPrice(discountAmount)}</span>
                    </div>
                  )}
                  
                  {orderType === 'delivery' && deliveryFee > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Ongkir ({deliveryInfo?.zone?.name})</span>
                      <span>{formatPrice(deliveryFee)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between font-bold text-lg pt-2 border-t">
                    <span>Total</span>
                    <span className="text-amber-700">{formatPrice(total)}</span>
                  </div>
                </div>
                
                {/* Promo Code */}
                <div className="border-t pt-4">
                  <Label className="text-sm">Kode Promo</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      placeholder="KODE"
                      className="uppercase"
                    />
                    <Button variant="outline" onClick={validatePromo} disabled={promoLoading || !promoCode}>
                      {promoLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Pakai'}
                    </Button>
                  </div>
                </div>
                
                {/* Validation Warning */}
                {orderType === 'delivery' && deliveryMethod === 'staff' && deliveryInfo?.inRange && subtotal < deliveryInfo.zone.minOrder && (
                  <div className="p-3 bg-amber-50 rounded-lg text-sm text-amber-700">
                    ⚠️ Min. order {formatPrice(deliveryInfo.zone.minOrder)}. Tambah {formatPrice(deliveryInfo.zone.minOrder - subtotal)} lagi.
                  </div>
                )}
                
                {/* Delivery Location Warning */}
                {orderType === 'delivery' && !deliveryAddress && (
                  <div className="p-3 bg-red-50 rounded-lg text-sm text-red-700">
                    ⚠️ Pilih lokasi pengiriman di peta terlebih dahulu
                  </div>
                )}
                
                {/* Out of Range Warning */}
                {orderType === 'delivery' && deliveryInfo && !deliveryInfo.inRange && (
                  <div className="p-3 bg-red-50 rounded-lg text-sm text-red-700">
                    ⚠️ Lokasi di luar jangkauan delivery. Silakan pilih Pick Up.
                  </div>
                )}
                
                <Button
                  onClick={submitOrder}
                  disabled={submitting || (orderType === 'delivery' && (!deliveryInfo || (!deliveryInfo.inRange && deliveryMethod === 'staff')))}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-lg py-6"
                >
                  {submitting ? (
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  ) : null}
                  {submitting ? 'Memproses...' : 'Pesan Sekarang'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-amber-600" /></div>}>
      <CheckoutPage />
    </Suspense>
  )
}
