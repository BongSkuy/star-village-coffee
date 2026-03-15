'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Coffee, MapPin, Clock, Phone, Check, 
  Truck, Store, Package, Loader2, MessageCircle,
  ChefHat, ShoppingBag, XCircle, Bell, Upload, 
  Image as ImageIcon, AlertCircle, CheckCircle
} from 'lucide-react'
import Link from 'next/link'

interface OrderItem {
  id: string
  itemName: string
  variantName: string | null
  price: number
  quantity: number
  subtotal: number
}

interface Order {
  id: string
  orderNumber: string
  customerName: string | null
  customerPhone: string | null
  subtotal: number
  discount: number
  total: number
  status: string
  paymentStatus: string
  paymentMethod: string
  paymentProofImage?: string | null
  paymentProofUploadedAt?: string | null
  customerConfirmed?: boolean
  notes: string | null
  orderType: string
  deliveryAddress: string | null
  deliveryFee: number
  deliveryMethod: string | null
  deliveryDistance: number | null
  estimatedTime: string | null
  createdAt: string
  items: OrderItem[]
}

const formatPrice = (price: number) => `Rp ${(price * 1000).toLocaleString('id-ID')}`

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode; step: number }> = {
  pending: { label: 'Menunggu Konfirmasi', color: 'bg-yellow-500', icon: <Clock className="w-5 h-5" />, step: 1 },
  confirmed: { label: 'Dikonfirmasi', color: 'bg-blue-500', icon: <Check className="w-5 h-5" />, step: 2 },
  processing: { label: 'Sedang Diproses', color: 'bg-purple-500', icon: <ChefHat className="w-5 h-5" />, step: 3 },
  delivering: { label: 'Sedang Diantar', color: 'bg-cyan-500', icon: <Truck className="w-5 h-5" />, step: 4 },
  completed: { label: 'Selesai', color: 'bg-green-600', icon: <Check className="w-5 h-5" />, step: 5 },
  cancelled: { label: 'Dibatalkan', color: 'bg-red-500', icon: <XCircle className="w-5 h-5" />, step: 0 },
}

export default function OrderTrackingPage() {
  const params = useParams()
  const orderNumber = params.orderNumber as string
  
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusChanged, setStatusChanged] = useState(false)
  const [newStatus, setNewStatus] = useState('')
  const previousStatusRef = useRef<string | null>(null)
  const [settings, setSettings] = useState<{
    whatsappNumber: string
    cafeName: string
    cafeLogo: string
    cafeAddress: string
    bankBcaNumber?: string
    bankBcaName?: string
    bankMandiriNumber?: string
    bankMandiriName?: string
    qrisImage?: string
  }>({
    whatsappNumber: '6282148615641',
    cafeName: 'Star Village Coffee',
    cafeLogo: '/images/logo.png',
    cafeAddress: 'Jl. Tentara Pelajar, Dusun 3, Kiringan, Boyolali, Jawa Tengah',
  })
  
  // Payment proof upload state
  const [uploading, setUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Customer confirmation state (for COD)
  const [confirming, setConfirming] = useState(false)
  const [confirmSuccess, setConfirmSuccess] = useState(false)

  // Fetch order function
  const fetchOrder = async () => {
    try {
      const orderRes = await fetch(`/api/orders?orderNumber=${orderNumber}`)
      
      if (orderRes.ok) {
        const data = await orderRes.json()
        const newOrder = data.order
        
        // Check if status changed
        if (previousStatusRef.current && previousStatusRef.current !== newOrder.status) {
          setStatusChanged(true)
          setNewStatus(newOrder.status)
          setTimeout(() => setStatusChanged(false), 5000)
        }
        
        previousStatusRef.current = newOrder.status
        setOrder(newOrder)
      }
    } catch (err) {
      console.error('Error fetching order:', err)
    }
  }

  useEffect(() => {
    async function initialFetch() {
      try {
        const [orderRes, settingsRes] = await Promise.all([
          fetch(`/api/orders?orderNumber=${orderNumber}`),
          fetch('/api/settings')
        ])
        
        if (orderRes.ok) {
          const data = await orderRes.json()
          setOrder(data.order)
          previousStatusRef.current = data.order?.status
        } else {
          setError('Pesanan tidak ditemukan')
        }
        
        if (settingsRes.ok) {
          const data = await settingsRes.json()
          setSettings({
            whatsappNumber: data.settings?.cafe_phone?.value || '6282148615641',
            cafeName: data.settings?.cafe_name?.value || 'Star Village Coffee',
            cafeLogo: data.settings?.cafe_logo?.value || '/images/logo.png',
            cafeAddress: data.settings?.cafe_address?.value || 'Jl. Tentara Pelajar, Dusun 3, Kiringan, Boyolali, Jawa Tengah',
            bankBcaNumber: data.settings?.bank_bca_number?.value,
            bankBcaName: data.settings?.bank_bca_name?.value,
            bankMandiriNumber: data.settings?.bank_mandiri_number?.value,
            bankMandiriName: data.settings?.bank_mandiri_name?.value,
            qrisImage: data.settings?.qris_image?.value,
          })
        }
      } catch (err) {
        console.error('Error fetching order:', err)
        setError('Gagal memuat pesanan')
      } finally {
        setLoading(false)
      }
    }
    
    if (orderNumber) {
      initialFetch()
    }
  }, [orderNumber])
  
  // Polling for real-time updates every 10 seconds
  useEffect(() => {
    if (!order || order.status === 'completed' || order.status === 'cancelled') {
      return
    }
    
    const pollInterval = setInterval(fetchOrder, 10000)
    return () => clearInterval(pollInterval)
  }, [order?.status])
  
  // Handle payment proof upload
  const handleUploadProof = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !order) return
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran file terlalu besar. Maksimal 5MB.')
      return
    }
    
    setUploading(true)
    try {
      // First upload the image
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'payment-proof')
      
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      
      if (!uploadRes.ok) {
        throw new Error('Gagal mengupload bukti pembayaran')
      }
      
      const uploadData = await uploadRes.json()
      
      // Then update the order with the proof image
      const updateRes = await fetch(`/api/orders/${order.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentProofImage: uploadData.url,
          paymentStatus: 'waiting_confirmation'
        })
      })
      
      if (!updateRes.ok) {
        throw new Error('Gagal menyimpan bukti pembayaran')
      }
      
      setUploadSuccess(true)
      fetchOrder() // Refresh order data
      
      // Send WhatsApp notification to admin
      const waMessage = `*BUKTI PEMBAYARAN DIUPLOAD*

Nomor Order: ${order.orderNumber}
Customer: ${order.customerName}
Telepon: ${order.customerPhone}
Total: ${formatPrice(order.total)}

Mohon verifikasi pembayaran di dashboard admin.`
      
      window.open(`https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(waMessage)}`, '_blank')
      
    } catch (error) {
      console.error('Error uploading proof:', error)
      alert('Gagal mengupload bukti pembayaran. Silakan coba lagi.')
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }
  
  // Handle COD/Pickup confirmation
  const handleConfirmCOD = async () => {
    if (!order) return

    if (!confirm('Konfirmasi bahwa Anda akan mengambil/menerima pesanan ini?')) return

    setConfirming(true)
    try {
      // Use public confirm endpoint with orderNumber (not id)
      const res = await fetch('/api/orders/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderNumber: order.orderNumber
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Gagal mengkonfirmasi pesanan')
      }

      setConfirmSuccess(true)
      fetchOrder()

    } catch (error) {
      console.error('Error confirming order:', error)
      alert('Gagal mengkonfirmasi pesanan. Silakan coba lagi.')
    } finally {
      setConfirming(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-amber-600" />
          <p className="text-muted-foreground">Memuat pesanan...</p>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50 p-4">
        <Card className="w-full max-w-md border-0 shadow-2xl">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-xl font-bold mb-2">{error || 'Pesanan Tidak Ditemukan'}</h1>
            <p className="text-muted-foreground mb-6">
              Nomor pesanan <strong>{orderNumber}</strong> tidak ditemukan dalam sistem kami.
            </p>
            <Link href="/">
              <Button className="bg-amber-600 hover:bg-amber-700">Kembali ke Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentStatus = statusConfig[order.status] || statusConfig.pending
  const isCancelled = order.status === 'cancelled'
  const isCOD = order.paymentMethod === 'cod'
  const needsPaymentProof = (order.paymentMethod === 'transfer' || order.paymentMethod === 'qris') && 
                            order.paymentStatus !== 'paid' && 
                            !order.paymentProofImage
  const paymentProofUploaded = order.paymentProofImage && order.paymentStatus === 'waiting_confirmation'
  
  // Status timeline steps
  const timelineSteps = isCancelled 
    ? [{ ...statusConfig.cancelled, completed: true }]
    : Object.entries(statusConfig)
        .filter(([key]) => key !== 'cancelled')
        .sort((a, b) => a[1].step - b[1].step)
        .map(([key, config]) => ({
          ...config,
          completed: config.step <= currentStatus.step,
          current: config.step === currentStatus.step
        }))

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      {/* Status Change Notification */}
      {statusChanged && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 animate-bounce">
          <Card className="bg-green-600 text-white border-0 shadow-2xl">
            <CardContent className="p-4 flex items-center gap-3">
              <Bell className="w-6 h-6 animate-pulse" />
              <div>
                <p className="font-bold">Status Pesanan Diperbarui!</p>
                <p className="text-sm">{statusConfig[newStatus]?.label || newStatus}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-md">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-white shadow flex items-center justify-center">
                {settings.cafeLogo ? (
                  <img src={settings.cafeLogo} alt="Logo" className="w-9 h-9 object-contain" />
                ) : (
                  <Coffee className="w-5 h-5 text-amber-700" />
                )}
              </div>
              <span className="font-bold text-lg">{settings.cafeName}</span>
            </Link>
            <Badge className={`${currentStatus.color} text-white`}>
              {currentStatus.label}
            </Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Order Number */}
        <div className="text-center mb-8">
          <p className="text-sm text-muted-foreground mb-1">Nomor Pesanan</p>
          <h1 className="text-3xl font-bold text-amber-700">{order.orderNumber}</h1>
        </div>

        {/* COD Confirmation Card */}
        {isCOD && !order.customerConfirmed && !confirmSuccess && (
          <Card className="border-2 border-amber-300 bg-amber-50 mb-6">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-2">Konfirmasi Pesanan Anda</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Mohon konfirmasi bahwa Anda akan mengambil/menerima pesanan ini. 
                    Pesanan akan diproses setelah konfirmasi.
                  </p>
                  <Button 
                    className="bg-amber-600 hover:bg-amber-700"
                    onClick={handleConfirmCOD}
                    disabled={confirming}
                  >
                    {confirming ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Mengkonfirmasi...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Ya, Saya Konfirmasi
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* COD Confirmed Success */}
        {(order.customerConfirmed || confirmSuccess) && isCOD && (
          <Card className="border-2 border-green-300 bg-green-50 mb-6">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-green-700">Pesanan Dikonfirmasi!</h3>
                  <p className="text-sm text-muted-foreground">
                    Terima kasih! Pesanan Anda sedang diproses.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payment Proof Upload Card */}
        {needsPaymentProof && (
          <Card className="border-2 border-blue-300 bg-blue-50 mb-6">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                  <Upload className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-2">Upload Bukti Pembayaran</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Silakan upload screenshot/foto bukti transfer atau pembayaran QRIS Anda.
                  </p>
                  
                  {/* Payment Details */}
                  {order.paymentMethod === 'transfer' && (
                    <div className="bg-white rounded-lg p-4 mb-4 text-sm">
                      <p className="font-semibold mb-2">Transfer ke:</p>
                      {settings.bankBcaNumber && (
                        <div className="mb-2">
                          <p className="font-medium text-blue-700">Bank BCA</p>
                          <p className="font-mono">{settings.bankBcaNumber}</p>
                          <p className="text-muted-foreground">a.n {settings.bankBcaName}</p>
                        </div>
                      )}
                      {settings.bankMandiriNumber && (
                        <div>
                          <p className="font-medium text-yellow-700">Bank Mandiri</p>
                          <p className="font-mono">{settings.bankMandiriNumber}</p>
                          <p className="text-muted-foreground">a.n {settings.bankMandiriName}</p>
                        </div>
                      )}
                      <p className="font-bold mt-2">Total: {formatPrice(order.total)}</p>
                    </div>
                  )}
                  
                  {order.paymentMethod === 'qris' && settings.qrisImage && (
                    <div className="bg-white rounded-lg p-4 mb-4 text-center">
                      <p className="font-semibold mb-2">Scan QRIS:</p>
                      <img src={settings.qrisImage} alt="QRIS" className="mx-auto rounded-lg max-h-40" />
                      <p className="font-bold mt-2">Total: {formatPrice(order.total)}</p>
                    </div>
                  )}
                  
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleUploadProof}
                    accept="image/*"
                    className="hidden"
                  />
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Mengupload...
                      </>
                    ) : (
                      <>
                        <ImageIcon className="w-4 h-4 mr-2" />
                        Pilih Gambar Bukti Bayar
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Payment Proof Uploaded */}
        {(paymentProofUploaded || uploadSuccess) && !order.paymentStatus.includes('paid') && (
          <Card className="border-2 border-yellow-300 bg-yellow-50 mb-6">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-yellow-500 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-yellow-700">Menunggu Verifikasi</h3>
                  <p className="text-sm text-muted-foreground">
                    Bukti pembayaran sudah diupload. Menunggu verifikasi admin.
                  </p>
                  {order.paymentProofImage && (
                    <img 
                      src={order.paymentProofImage} 
                      alt="Bukti Pembayaran" 
                      className="mt-3 rounded-lg max-h-40"
                    />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Payment Verified */}
        {order.paymentStatus === 'paid' && (
          <Card className="border-2 border-green-300 bg-green-50 mb-6">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-green-700">Pembayaran Terverifikasi</h3>
                  <p className="text-sm text-muted-foreground">
                    Pembayaran Anda sudah dikonfirmasi. Pesanan sedang diproses.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Status Timeline */}
        <Card className="border-0 shadow-lg mb-6">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              {timelineSteps.map((step, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    step.completed 
                      ? step.color + ' text-white' 
                      : 'bg-gray-200 text-gray-400'
                  } ${step.current ? 'ring-4 ring-amber-200' : ''}`}>
                    {step.icon}
                  </div>
                  <p className={`text-xs mt-2 text-center ${step.completed ? 'font-medium' : 'text-muted-foreground'}`}>
                    {step.label}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Order Type Info */}
        <Card className="border-0 shadow-lg mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {order.orderType === 'delivery' ? <Truck className="w-5 h-5" /> : <Store className="w-5 h-5" />}
              {order.orderType === 'delivery' ? 'Pengiriman' : 'Pick Up'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {order.orderType === 'delivery' ? (
              <div className="space-y-2">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-red-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Alamat Pengiriman</p>
                    <p className="text-sm text-muted-foreground">{order.deliveryAddress}</p>
                  </div>
                </div>
                {order.deliveryDistance && (
                  <p className="text-sm text-muted-foreground">
                    Jarak: {order.deliveryDistance.toFixed(1)} km
                  </p>
                )}
                {order.deliveryMethod && (
                  <p className="text-sm">
                    Metode: <strong>{order.deliveryMethod === 'staff' ? 'Staff Cafe' : 'GoSend'}</strong>
                  </p>
                )}
              </div>
            ) : (
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-amber-500 mt-0.5" />
                <div>
                  <p className="font-medium">Ambil di Tempat</p>
                  <p className="text-sm text-muted-foreground">{settings.cafeAddress}</p>
                </div>
              </div>
            )}
            {order.estimatedTime && (
              <div className="flex items-center gap-2 mt-3 p-3 bg-amber-50 rounded-xl">
                <Clock className="w-5 h-5 text-amber-600" />
                <span className="text-sm">
                  Estimasi: <strong>{order.estimatedTime}</strong>
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order Items */}
        <Card className="border-0 shadow-lg mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" />
              Detail Pesanan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b last:border-0">
                  <div>
                    <p className="font-medium">{item.itemName}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.variantName} x{item.quantity}
                    </p>
                  </div>
                  <p className="font-semibold">{formatPrice(item.subtotal)}</p>
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Diskon</span>
                  <span>-{formatPrice(order.discount)}</span>
                </div>
              )}
              {order.deliveryFee > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Ongkir</span>
                  <span>{formatPrice(order.deliveryFee)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Total</span>
                <span className="text-amber-700">{formatPrice(order.total)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Info */}
        <Card className="border-0 shadow-lg mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Pembayaran
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">
                  {order.paymentMethod === 'cod' && 'Bayar di Tempat'}
                  {order.paymentMethod === 'transfer' && 'Transfer Bank'}
                  {order.paymentMethod === 'qris' && 'QRIS'}
                </p>
                <Badge className={`mt-2 ${
                  order.paymentStatus === 'paid' 
                    ? 'bg-green-500' 
                    : order.paymentStatus === 'waiting_confirmation'
                    ? 'bg-yellow-500'
                    : 'bg-orange-500'
                } text-white`}>
                  {order.paymentStatus === 'paid' 
                    ? 'Sudah Dibayar' 
                    : order.paymentStatus === 'waiting_confirmation'
                    ? 'Menunggu Verifikasi'
                    : 'Menunggu Pembayaran'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Button */}
        <a 
          href={`https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(`Halo, saya ingin menanyakan pesanan dengan nomor ${order.orderNumber}`)}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button className="w-full bg-green-600 hover:bg-green-700 py-6 text-lg">
            <MessageCircle className="w-5 h-5 mr-2" />
            Hubungi via WhatsApp
          </Button>
        </a>
        
        <p className="text-center text-sm text-muted-foreground mt-4">
          Pesanan dibuat pada {new Date(order.createdAt).toLocaleString('id-ID')}
        </p>
      </main>
    </div>
  )
}
