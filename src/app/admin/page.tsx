'use client'

import { useEffect, useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import {
  ShoppingCart, Package, Users, DollarSign, TrendingUp,
  Clock, CheckCircle, XCircle, Eye, Trash2,
  RefreshCw, Search, Menu, Gift, Settings,
  Calendar, Loader2, Copy, Lock, LogOut, Image as ImageIcon,
  Upload, Plus, X, Save, Edit, Coffee, GripVertical, Move,
  CreditCard, Truck, MessageCircle, QrCode, Mail, User, Check, Phone, Home, TreePine, MapPin, AlertCircle, Bell, Star
} from 'lucide-react'

// Types
interface OrderItem {
  id: string
  itemId: string
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
  customerEmail?: string | null
  subtotal: number
  discount: number
  total: number
  deliveryFee?: number
  status: string
  paymentMethod?: string
  paymentStatus?: string
  paymentProofImage?: string | null
  paymentProofUploadedAt?: string | null
  customerConfirmed?: boolean
  orderType?: string
  deliveryAddress?: string | null
  source: string
  notes: string | null
  createdAt: string
  items: OrderItem[]
}

interface MenuItemType {
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
  isAvailable: boolean
  category: { id: string; name: string; slug: string }
  variants: { id: string; name: string; price: number }[]
}

interface Category {
  id: string
  name: string
  slug: string
  icon: string | null
  _count?: { items: number }
}

interface Promo {
  id: string
  code: string
  discount: number
  minPurchase: number
  maxUses: number | null
  usedCount: number
  expiresAt: string | null
  isActive: boolean
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
  seatingType: string | null
  notes: string | null
  status: string
  adminNotes: string | null
  createdAt: string
}

interface GalleryImage {
  id: string
  title: string | null
  description: string | null
  imageUrl: string
  order: number
  isActive: boolean
}

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

interface CafeSettings {
  cafe_name?: { value: string; description: string }
  cafe_tagline?: { value: string; description: string }
  cafe_description?: { value: string; description: string }
  cafe_address?: { value: string; description: string }
  cafe_phone?: { value: string; description: string }
  cafe_instagram?: { value: string; description: string }
  cafe_logo?: { value: string; description: string }
  open_hour?: { value: string; description: string }
  close_hour?: { value: string; description: string }
}

// Format price
const formatPrice = (price: number) => {
  return `Rp ${(price * 1000).toLocaleString('id-ID')}`
}

// Format date
const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Status badge colors
const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30',
  confirmed: 'bg-blue-500/20 text-blue-600 border-blue-500/30',
  processing: 'bg-purple-500/20 text-purple-600 border-purple-500/30',
  delivering: 'bg-cyan-500/20 text-cyan-600 border-cyan-500/30',
  completed: 'bg-green-500/20 text-green-600 border-green-500/30',
  cancelled: 'bg-red-500/20 text-red-600 border-red-500/30',
}

// Status labels
const statusLabels: Record<string, string> = {
  pending: 'Menunggu',
  confirmed: 'Dikonfirmasi',
  processing: 'Diproses',
  delivering: 'Sedang Diantar',
  completed: 'Selesai',
  cancelled: 'Dibatalkan',
}

export default function AdminDashboard() {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  
  // Notification state
  const [newOrderNotification, setNewOrderNotification] = useState<Order | null>(null)
  const [previousOrderCount, setPreviousOrderCount] = useState(0)
  
  // Data states
  const [orders, setOrders] = useState<Order[]>([])
  const [menuItems, setMenuItems] = useState<MenuItemType[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [promos, setPromos] = useState<Promo[]>([])
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [settings, setSettings] = useState<CafeSettings>({})
  const [gallery, setGallery] = useState<GalleryImage[]>([])
  const [loyaltyMembers, setLoyaltyMembers] = useState<LoyaltyMember[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  
  // Filters
  const [orderStatus, setOrderStatus] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [reservationFilter, setReservationFilter] = useState('all')
  const [loyaltyPhoneFilter, setLoyaltyPhoneFilter] = useState('')
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  
  // Analytics state
  const [analyticsPeriod, setAnalyticsPeriod] = useState('daily')
  const [analyticsData, setAnalyticsData] = useState<any>(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(false)
  const [analyticsStartDate, setAnalyticsStartDate] = useState('')
  const [analyticsEndDate, setAnalyticsEndDate] = useState('')
  
  // Settings edit state
  const [editSettings, setEditSettings] = useState({
    cafe_name: '',
    cafe_tagline: '',
    cafe_description: '',
    cafe_address: '',
    cafe_phone: '',
    cafe_instagram: '',
    cafe_logo: '',
    cafe_hero_image: '',
    cafe_hero_position_x: 'center',
    cafe_hero_position_y: 'center',
    cafe_hero_position_x_mobile: 'center',
    cafe_hero_position_y_mobile: 'center',
    open_hour: '10',
    close_hour: '23',
    // Payment settings
    bank_bca_number: '',
    bank_bca_name: '',
    bank_mandiri_number: '',
    bank_mandiri_name: '',
    qris_image: '',
    // Delivery settings
    staff_delivery_fee: '5',
    staff_max_distance: '10',
    staff_free_delivery_min: '100',
    gosend_enabled: 'true',
    // Notification settings
    whatsapp_admin: '',
  })
  const [savingSettings, setSavingSettings] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingQris, setUploadingQris] = useState(false)
  const [uploadingHero, setUploadingHero] = useState(false)
  
  
  // Gallery upload state
  const [galleryUploadOpen, setGalleryUploadOpen] = useState(false)
  const [newGalleryImage, setNewGalleryImage] = useState({
    title: '',
    description: '',
    imageUrl: ''
  })
  const [uploadingGallery, setUploadingGallery] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const qrisInputRef = useRef<HTMLInputElement>(null)
  const heroInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)
  
  // Gallery drag-and-drop state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const [isReordering, setIsReordering] = useState(false)
  
  // Category CRUD state
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [categoryForm, setCategoryForm] = useState({ name: '', icon: '' })
  const [savingCategory, setSavingCategory] = useState(false)
  
  // Menu Item CRUD state
  const [menuItemDialogOpen, setMenuItemDialogOpen] = useState(false)
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItemType | null>(null)
  const [menuItemForm, setMenuItemForm] = useState({
    name: '',
    description: '',
    image: '',
    categoryId: '',
    variants: [{ name: '', price: '' }],
    stock: '100',
    isPopular: false,
    isNew: false,
    isPromo: false,
    isAvailable: true
  })
  const [savingMenuItem, setSavingMenuItem] = useState(false)
  const [uploadingMenuImage, setUploadingMenuImage] = useState(false)
  const menuImageInputRef = useRef<HTMLInputElement>(null)
  const [menuCategoryFilter, setMenuCategoryFilter] = useState('all')
  
  // Promo CRUD state
  const [promoDialogOpen, setPromoDialogOpen] = useState(false)
  const [editingPromo, setEditingPromo] = useState<Promo | null>(null)
  const [promoForm, setPromoForm] = useState({
    code: '',
    discount: '',
    minPurchase: '0',
    maxUses: '',
    expiresAt: '',
    isActive: true
  })
  const [savingPromo, setSavingPromo] = useState(false)
  
  // Reservation admin notes state
  const [reservationNotesOpen, setReservationNotesOpen] = useState(false)
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null)
  const [adminNotesForm, setAdminNotesForm] = useState('')
  const [savingAdminNotes, setSavingAdminNotes] = useState(false)
  
  // Delivery Zones state
  const [deliveryZones, setDeliveryZones] = useState<{
    id: string
    name: string
    minDistance: number
    maxDistance: number
    fee: number
    minOrder: number
  }[]>([])
  const [savingZones, setSavingZones] = useState(false)
  
  // Check auth on mount - verify admin session via API
  useEffect(() => {
    async function checkSession() {
      try {
        // Use verify-session API to check httpOnly cookie
        const response = await fetch('/api/admin/verify-session')
        const data = await response.json()
        
        if (data.authenticated) {
          setIsAuthenticated(true)
        } else {
          // Also check NextAuth session as fallback
          const authResponse = await fetch('/api/auth/session')
          const authData = await authResponse.json()
          if (authData?.user) {
            setIsAuthenticated(true)
          }
        }
      } catch (error) {
        console.error('Session check error:', error)
      }
    }
    checkSession()
  }, [])
  
  // Fetch all data
  useEffect(() => {
    if (!isAuthenticated) return
    
    async function fetchData() {
      try {
        const [ordersRes, menuRes, catRes, promosRes, reservationsRes, settingsRes, galleryRes, deliveryRes, loyaltyRes] = await Promise.all([
          fetch('/api/orders'),
          fetch('/api/menu'),
          fetch('/api/categories'),
          fetch('/api/promos'),
          fetch('/api/reservation'),
          fetch('/api/settings'),
          fetch('/api/gallery'),
          fetch('/api/delivery'),
          fetch('/api/loyalty?admin=true'),
        ])
        
        if (ordersRes.ok) {
          const data = await ordersRes.json()
          setOrders(data.orders || [])
          setPreviousOrderCount(data.orders?.length || 0)
        }
        
        if (menuRes.ok) {
          const data = await menuRes.json()
          const allItems = data.categories?.flatMap((cat: any) => 
            cat.items.map((item: any) => ({ ...item, category: cat }))
          ) || []
          setMenuItems(allItems)
        }
        
        if (catRes.ok) {
          const data = await catRes.json()
          setCategories(data.categories || [])
        }
        
        if (promosRes.ok) {
          const data = await promosRes.json()
          setPromos(data.promos || [])
        }
        
        if (reservationsRes.ok) {
          const data = await reservationsRes.json()
          setReservations(data.reservations || [])
        }
        
        if (settingsRes.ok) {
          const data = await settingsRes.json()
          setSettings(data.settings || {})
          // Populate edit settings
          setEditSettings({
            cafe_name: data.settings?.cafe_name?.value || '',
            cafe_tagline: data.settings?.cafe_tagline?.value || '',
            cafe_description: data.settings?.cafe_description?.value || '',
            cafe_address: data.settings?.cafe_address?.value || '',
            cafe_phone: data.settings?.cafe_phone?.value || '',
            cafe_instagram: data.settings?.cafe_instagram?.value || '',
            cafe_logo: data.settings?.cafe_logo?.value || '',
            cafe_hero_image: data.settings?.cafe_hero_image?.value || '',
            cafe_hero_position_x: data.settings?.cafe_hero_position_x?.value || 'center',
            cafe_hero_position_y: data.settings?.cafe_hero_position_y?.value || 'center',
            cafe_hero_position_x_mobile: data.settings?.cafe_hero_position_x_mobile?.value || 'center',
            cafe_hero_position_y_mobile: data.settings?.cafe_hero_position_y_mobile?.value || 'center',
            open_hour: data.settings?.open_hour?.value || '10',
            close_hour: data.settings?.close_hour?.value || '23',
            // Payment settings
            bank_bca_number: data.settings?.bank_bca_number?.value || '',
            bank_bca_name: data.settings?.bank_bca_name?.value || '',
            bank_mandiri_number: data.settings?.bank_mandiri_number?.value || '',
            bank_mandiri_name: data.settings?.bank_mandiri_name?.value || '',
            qris_image: data.settings?.qris_image?.value || '',
            // Delivery settings
            staff_delivery_fee: data.settings?.staff_delivery_fee?.value || '5',
            staff_max_distance: data.settings?.staff_max_distance?.value || '10',
            staff_free_delivery_min: data.settings?.staff_free_delivery_min?.value || '100',
            gosend_enabled: data.settings?.gosend_enabled?.value || 'true',
            // Notification settings
            whatsapp_admin: data.settings?.whatsapp_admin?.value || '',
          })
        }
        
        if (galleryRes.ok) {
          const data = await galleryRes.json()
          setGallery(data.images || [])
        }
        
        if (deliveryRes.ok) {
          const data = await deliveryRes.json()
          setDeliveryZones(data.zones || [])
        }
        
        if (loyaltyRes.ok) {
          const data = await loyaltyRes.json()
          setLoyaltyMembers(data.members || [])
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
    
    // Set up polling for real-time updates every 15 seconds
    const pollInterval = setInterval(async () => {
      try {
        const [ordersRes, reservationsRes] = await Promise.all([
          fetch('/api/orders'),
          fetch('/api/reservation'),
        ])
        
        if (ordersRes.ok) {
          const data = await ordersRes.json()
          const newOrders = data.orders || []
          
          // Check for new orders
          if (previousOrderCount > 0 && newOrders.length > previousOrderCount) {
            // Find the newest order
            const newestOrder = newOrders[0]
            if (newestOrder && newestOrder.status === 'pending') {
              setNewOrderNotification(newestOrder)
              // Play notification sound
              try {
                const audio = new Audio('/notification.mp3')
                audio.volume = 0.5
                audio.play().catch(() => {})
              } catch {}
              // Auto hide after 10 seconds
              setTimeout(() => setNewOrderNotification(null), 10000)
            }
          }
          
          setPreviousOrderCount(newOrders.length)
          setOrders(newOrders)
        }
        
        if (reservationsRes.ok) {
          const data = await reservationsRes.json()
          setReservations(data.reservations || [])
        }
      } catch (error) {
        console.error('Polling error:', error)
      }
    }, 15000) // Poll every 15 seconds
    
    return () => clearInterval(pollInterval)
  }, [isAuthenticated, previousOrderCount])
  
  // Handle login with custom admin login API
  const handleLogin = async () => {
    if (!password.trim()) {
      setAuthError('Password harus diisi!')
      return
    }
    
    setIsLoggingIn(true)
    setAuthError('')
    
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setIsAuthenticated(true)
        setPassword('')
      } else {
        setAuthError(data.error || 'Password salah!')
      }
    } catch (error) {
      console.error('Login error:', error)
      setAuthError('Terjadi kesalahan saat login')
    } finally {
      setIsLoggingIn(false)
    }
  }
  
  // Handle logout with custom admin logout API
  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' })
      setIsAuthenticated(false)
    } catch (error) {
      console.error('Logout error:', error)
      // Force logout on error
      setIsAuthenticated(false)
    }
  }
  
  // Update order status
  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      })

      const data = await response.json()

      if (response.ok) {
        setOrders(prev => prev.map(o =>
          o.id === orderId ? { ...o, status: newStatus } : o
        ))
      } else if (response.status === 401) {
        // Session expired - logout user
        alert('Sesi Anda telah berakhir. Silakan login kembali.')
        setIsAuthenticated(false)
      } else {
        alert(data.error || data.message || 'Gagal mengupdate status pesanan')
      }
    } catch (error) {
      console.error('Error updating order:', error)
      alert('Gagal mengupdate status pesanan. Silakan coba lagi.')
    }
  }

  // Verify payment proof
  const verifyPayment = async (orderId: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ paymentVerified: true }),
      })

      const data = await response.json()

      if (response.ok) {
        setOrders(prev => prev.map(o =>
          o.id === orderId ? { ...o, paymentStatus: 'paid' } : o
        ))
        alert('Pembayaran berhasil diverifikasi!')
      } else if (response.status === 401) {
        alert('Sesi Anda telah berakhir. Silakan login kembali.')
        setIsAuthenticated(false)
      } else {
        alert(data.error || data.message || 'Gagal verifikasi pembayaran')
      }
    } catch (error) {
      console.error('Error verifying payment:', error)
      alert('Gagal verifikasi pembayaran')
    }
  }

  // Reject payment proof
  const rejectPayment = async (orderId: string) => {
    if (!confirm('Tolak bukti pembayaran ini? Customer harus upload ulang.')) return

    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ paymentRejected: true }),
      })

      const data = await response.json()

      if (response.ok) {
        setOrders(prev => prev.map(o =>
          o.id === orderId ? { ...o, paymentStatus: 'pending', paymentProofImage: null } : o
        ))
        alert('Bukti pembayaran ditolak. Customer dapat upload ulang.')
      } else if (response.status === 401) {
        alert('Sesi Anda telah berakhir. Silakan login kembali.')
        setIsAuthenticated(false)
      } else {
        alert(data.error || data.message || 'Gagal menolak pembayaran')
      }
    } catch (error) {
      console.error('Error rejecting payment:', error)
      alert('Gagal menolak pembayaran')
    }
  }

  // Mark COD payment as paid
  const markCODPaid = async (orderId: string) => {
    if (!confirm('Konfirmasi pembayaran COD sudah diterima?')) return

    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ paymentStatus: 'paid' }),
      })

      const data = await response.json()

      if (response.ok) {
        setOrders(prev => prev.map(o =>
          o.id === orderId ? { ...o, paymentStatus: 'paid' } : o
        ))
        alert('Pembayaran COD dikonfirmasi!')
      } else if (response.status === 401) {
        alert('Sesi Anda telah berakhir. Silakan login kembali.')
        setIsAuthenticated(false)
      } else {
        alert(data.error || data.message || 'Gagal mengkonfirmasi pembayaran')
      }
    } catch (error) {
      console.error('Error marking COD as paid:', error)
      alert('Gagal mengkonfirmasi pembayaran')
    }
  }
  
  // Send WhatsApp notification to customer
  const sendWhatsAppNotification = (order: any) => {
    const statusLabels: Record<string, string> = {
      pending: 'Menunggu Konfirmasi',
      confirmed: 'Dikonfirmasi',
      processing: 'Sedang Diproses',
      delivering: 'Sedang Diantar',
      completed: 'Selesai',
      cancelled: 'Dibatalkan',
    }
    
    const orderTypeText = order.orderType === 'delivery' ? 'Delivery' : 'Pick Up'
    const statusText = statusLabels[order.status] || order.status
    
    const itemsText = order.items?.map((i: any) => `• ${i.itemName}${i.variantName ? ` (${i.variantName})` : ''} x${i.quantity}`).join('\n') || '-'
    
    const message = `🎉 *Update Pesanan ${order.orderNumber}*

Halo ${order.customerName || 'Kakak'}! 👋

Status pesanan Anda telah diperbarui:
📍 Status: *${statusText}*
📦 Tipe: ${orderTypeText}

*Detail Pesanan:*
${itemsText}

Total: *Rp ${(order.total * 1000).toLocaleString('id-ID')}*

${order.status === 'delivering' ? '🚚 Pesanan Anda sedang dalam perjalanan! Mohon tunggu dan pastikan nomor HP Anda aktif.' : ''}
${order.status === 'completed' ? '🎉 Terima kasih telah memesan di Star Village Coffee! Semoga Anda puas dengan pesanan Anda. Ditunggu orderan selanjutnya ya! ☕' : ''}

Ada pertanyaan? Hubungi kami di:
https://wa.me/${settings.cafe_phone?.value || '6282148615641'}`

    const phone = order.customerPhone?.replace(/^0/, '62') || ''
    if (phone) {
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank')
    } else {
      alert('Nomor telepon customer tidak tersedia')
    }
  }

  // Update reservation status
  const updateReservationStatus = async (reservationId: string, newStatus: string) => {
    try {
      const response = await fetch('/api/reservation', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id: reservationId, status: newStatus }),
      })

      const data = await response.json()

      if (response.ok) {
        setReservations(prev => prev.map(r =>
          r.id === reservationId ? { ...r, status: newStatus } : r
        ))
      } else if (response.status === 401) {
        alert('Sesi Anda telah berakhir. Silakan login kembali.')
        setIsAuthenticated(false)
      } else {
        alert(data.error || data.message || 'Gagal mengupdate status reservasi')
      }
    } catch (error) {
      console.error('Error updating reservation:', error)
      alert('Gagal mengupdate status reservasi. Silakan coba lagi.')
    }
  }

  // Open admin notes dialog
  const openAdminNotesDialog = (reservation: Reservation) => {
    setEditingReservation(reservation)
    setAdminNotesForm(reservation.adminNotes || '')
    setReservationNotesOpen(true)
  }
  
  // Save admin notes
  const saveAdminNotes = async () => {
    if (!editingReservation) return
    
    setSavingAdminNotes(true)
    try {
      const response = await fetch('/api/reservation', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          id: editingReservation.id, 
          adminNotes: adminNotesForm 
        }),
      })
      
      if (response.ok) {
        const data = await response.json()
        setReservations(prev => prev.map(r => 
          r.id === editingReservation.id ? { ...r, adminNotes: adminNotesForm } : r
        ))
        setReservationNotesOpen(false)
        setEditingReservation(null)
      } else {
        alert('Gagal menyimpan catatan')
      }
    } catch (error) {
      console.error('Error saving admin notes:', error)
      alert('Gagal menyimpan catatan')
    } finally {
      setSavingAdminNotes(false)
    }
  }
  
  // Send WhatsApp notification for reservation
  const sendReservationWhatsApp = (reservation: any) => {
    const statusLabels: Record<string, string> = {
      pending: 'Menunggu Konfirmasi',
      confirmed: 'Dikonfirmasi',
      completed: 'Selesai',
      cancelled: 'Dibatalkan',
    }
    
    const statusText = statusLabels[reservation.status] || reservation.status
    const cafeName = settings.cafe_name?.value || 'Star Village Coffee'
    const trackingLink = `starvillage.coffee/reservasi/cek`
    
    const message = `🎉 *Update Reservasi ${cafeName}*

Halo ${reservation.name}! 👋

Status reservasi Anda telah diperbarui:
🎫 Kode: *${reservation.reservationCode}*
📍 Status: *${statusText}*
📅 Tanggal: ${reservation.date}
🕐 Waktu: ${reservation.time}
👥 Jumlah Tamu: ${reservation.guests} orang

${reservation.status === 'confirmed' ? '✅ Reservasi Anda telah dikonfirmasi! Kami tunggu kedatangan Anda.' : ''}
${reservation.status === 'cancelled' ? '❌ Mohon maaf, reservasi Anda tidak dapat dilayani pada waktu tersebut. Silakan pilih waktu lain.' : ''}

${reservation.adminNotes ? `\n📝 *Pesan dari kami:*\n${reservation.adminNotes}\n` : ''}

🔗 *Lacak Status Reservasi:*
${trackingLink}

Ada pertanyaan? Hubungi kami di:
https://wa.me/${settings.cafe_phone?.value || '6282148615641'}`

    const phone = reservation.phone?.replace(/^0/, '62') || ''
    if (phone) {
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank')
    } else {
      alert('Nomor telepon tidak tersedia')
    }
  }
  
  // Copy to clipboard helper
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      alert('Berhasil disalin ke clipboard!')
    } catch (error) {
      console.error('Failed to copy:', error)
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      alert('Berhasil disalin ke clipboard!')
    }
  }
  
  // Delete order
  const deleteOrder = async (orderId: string) => {
    if (!confirm('Yakin ingin menghapus pesanan ini?')) return
    
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      
      if (response.ok) {
        setOrders(prev => prev.filter(o => o.id !== orderId))
      }
    } catch (error) {
      console.error('Error deleting order:', error)
    }
  }
  
  // Save settings
  const saveSettings = async () => {
    setSavingSettings(true)
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(editSettings),
      })
      
      if (response.ok) {
        alert('Pengaturan berhasil disimpan!')
        // Refresh settings
        const settingsRes = await fetch('/api/settings')
        if (settingsRes.ok) {
          const data = await settingsRes.json()
          setSettings(data.settings || {})
        }
      } else {
        alert('Gagal menyimpan pengaturan')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Gagal menyimpan pengaturan')
    } finally {
      setSavingSettings(false)
    }
  }
  
  // Save delivery zones
  const saveDeliveryZones = async () => {
    setSavingZones(true)
    try {
      const response = await fetch('/api/delivery', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ zones: deliveryZones }),
      })
      
      if (response.ok) {
        alert('Zona delivery berhasil disimpan!')
      } else {
        alert('Gagal menyimpan zona delivery')
      }
    } catch (error) {
      console.error('Error saving zones:', error)
      alert('Gagal menyimpan zona delivery')
    } finally {
      setSavingZones(false)
    }
  }
  
  // Upload gallery image
  const uploadGalleryImage = async () => {
    if (!newGalleryImage.imageUrl) {
      alert('URL gambar diperlukan')
      return
    }
    
    setUploadingGallery(true)
    try {
      const response = await fetch('/api/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newGalleryImage),
      })
      
      if (response.ok) {
        alert('Gambar berhasil ditambahkan!')
        setGalleryUploadOpen(false)
        setNewGalleryImage({ title: '', description: '', imageUrl: '' })
        // Refresh gallery
        const galleryRes = await fetch('/api/gallery')
        if (galleryRes.ok) {
          const data = await galleryRes.json()
          setGallery(data.images || [])
        }
      }
    } catch (error) {
      console.error('Error uploading gallery image:', error)
      alert('Gagal menambahkan gambar')
    } finally {
      setUploadingGallery(false)
    }
  }
  
  // Handle gallery file upload
  const handleGalleryFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran file terlalu besar. Maksimal 5MB.')
      return
    }
    
    setUploadingGallery(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'gallery')
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData
      })
      
      if (response.ok) {
        const data = await response.json()
        setNewGalleryImage(prev => ({ ...prev, imageUrl: data.url }))
      } else {
        alert('Gagal mengupload gambar')
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Gagal mengupload gambar')
    } finally {
      setUploadingGallery(false)
    }
    // Reset input
    if (galleryInputRef.current) {
      galleryInputRef.current.value = ''
    }
  }
  
  // Delete gallery image
  const deleteGalleryImage = async (id: string, imageUrl?: string) => {
    if (!confirm('Hapus gambar ini?')) return
    
    try {
      // Delete from database
      const response = await fetch(`/api/gallery?id=${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      
      if (response.ok) {
        // Also delete file from server if it's a local upload
        if (imageUrl && imageUrl.startsWith('/uploads/')) {
          try {
            await fetch(`/api/upload?url=${imageUrl}`, {
              method: 'DELETE',
              credentials: 'include',
            })
          } catch (e) {
            console.log('File delete error (may not exist)')
          }
        }
        setGallery(prev => prev.filter(img => img.id !== id))
      }
    } catch (error) {
      console.error('Error deleting gallery image:', error)
    }
  }
  
  // Gallery drag-and-drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', index.toString())
  }
  
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverIndex(index)
  }
  
  const handleDragLeave = () => {
    setDragOverIndex(null)
  }
  
  const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null)
      setDragOverIndex(null)
      return
    }
    
    // Reorder locally first for immediate feedback
    const newGallery = [...gallery]
    const [draggedItem] = newGallery.splice(draggedIndex, 1)
    newGallery.splice(dropIndex, 0, draggedItem)
    
    // Update local state
    setGallery(newGallery)
    setDraggedIndex(null)
    setDragOverIndex(null)
    
    // Save new order to database
    setIsReordering(true)
    try {
      const orders = newGallery.map((img, idx) => ({
        id: img.id,
        order: idx
      }))
      
      const response = await fetch('/api/gallery/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ orders })
      })
      
      if (!response.ok) {
        // Revert on error
        const galleryRes = await fetch('/api/gallery')
        if (galleryRes.ok) {
          const data = await galleryRes.json()
          setGallery(data.images || [])
        }
        alert('Gagal mengubah urutan foto')
      }
    } catch (error) {
      console.error('Error reordering gallery:', error)
      alert('Gagal mengubah urutan foto')
    } finally {
      setIsReordering(false)
    }
  }
  
  const handleDragEnd = () => {
    setDraggedIndex(null)
    setDragOverIndex(null)
  }
  
  // Category CRUD handlers
  const openCategoryDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category)
      setCategoryForm({ name: category.name, icon: category.icon || '' })
    } else {
      setEditingCategory(null)
      setCategoryForm({ name: '', icon: '' })
    }
    setCategoryDialogOpen(true)
  }
  
  const handleSaveCategory = async () => {
    if (!categoryForm.name.trim()) {
      alert('Nama kategori harus diisi')
      return
    }
    
    setSavingCategory(true)
    try {
      const url = '/api/categories'
      const method = editingCategory ? 'PUT' : 'POST'
      const body = editingCategory 
        ? { id: editingCategory.id, ...categoryForm }
        : categoryForm
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      })
      
      if (response.ok) {
        setCategoryDialogOpen(false)
        // Refresh categories
        const catRes = await fetch('/api/categories')
        if (catRes.ok) {
          const data = await catRes.json()
          setCategories(data.categories || [])
        }
      } else {
        const data = await response.json()
        alert(data.error || 'Gagal menyimpan kategori')
      }
    } catch (error) {
      console.error('Error saving category:', error)
      alert('Gagal menyimpan kategori')
    } finally {
      setSavingCategory(false)
    }
  }
  
  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Hapus kategori ini?')) return
    
    try {
      const response = await fetch(`/api/categories?id=${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      
      if (response.ok) {
        setCategories(prev => prev.filter(c => c.id !== id))
      } else {
        const data = await response.json()
        alert(data.error || 'Gagal menghapus kategori')
      }
    } catch (error) {
      console.error('Error deleting category:', error)
      alert('Gagal menghapus kategori')
    }
  }
  
  // Menu Item CRUD handlers
  const openMenuItemDialog = (item?: MenuItemType) => {
    if (item) {
      setEditingMenuItem(item)
      setMenuItemForm({
        name: item.name,
        description: item.description || '',
        image: item.image || '',
        categoryId: item.category?.id || '',
        variants: item.variants.length > 0 
          ? item.variants.map(v => ({ name: v.name, price: String(v.price) }))
          : [{ name: '', price: '' }],
        stock: String(item.stock),
        isPopular: item.isPopular,
        isNew: item.isNew,
        isPromo: item.isPromo,
        isAvailable: item.isAvailable
      })
    } else {
      setEditingMenuItem(null)
      setMenuItemForm({
        name: '',
        description: '',
        image: '',
        categoryId: categories[0]?.id || '',
        variants: [{ name: '', price: '' }],
        stock: '100',
        isPopular: false,
        isNew: false,
        isPromo: false,
        isAvailable: true
      })
    }
    setMenuItemDialogOpen(true)
  }
  
  const handleMenuImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran file terlalu besar. Maksimal 5MB.')
      return
    }
    
    setUploadingMenuImage(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'menu')
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData
      })
      
      if (response.ok) {
        const data = await response.json()
        setMenuItemForm(prev => ({ ...prev, image: data.url }))
      } else {
        alert('Gagal mengupload gambar')
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Gagal mengupload gambar')
    } finally {
      setUploadingMenuImage(false)
    }
    if (menuImageInputRef.current) {
      menuImageInputRef.current.value = ''
    }
  }
  
  const addVariant = () => {
    setMenuItemForm(prev => ({
      ...prev,
      variants: [...prev.variants, { name: '', price: '' }]
    }))
  }
  
  const removeVariant = (index: number) => {
    if (menuItemForm.variants.length <= 1) return
    setMenuItemForm(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index)
    }))
  }
  
  const updateVariant = (index: number, field: 'name' | 'price', value: string) => {
    setMenuItemForm(prev => ({
      ...prev,
      variants: prev.variants.map((v, i) => 
        i === index ? { ...v, [field]: value } : v
      )
    }))
  }
  
  const handleSaveMenuItem = async () => {
    if (!menuItemForm.name.trim()) {
      alert('Nama menu harus diisi')
      return
    }
    if (!menuItemForm.categoryId) {
      alert('Pilih kategori')
      return
    }
    if (menuItemForm.variants.length === 0 || !menuItemForm.variants[0].name || !menuItemForm.variants[0].price) {
      alert('Minimal harus ada 1 varian dengan nama dan harga')
      return
    }
    
    setSavingMenuItem(true)
    try {
      const url = '/api/menu'
      const method = editingMenuItem ? 'PUT' : 'POST'
      const body = {
        ...(editingMenuItem ? { id: editingMenuItem.id } : {}),
        name: menuItemForm.name,
        description: menuItemForm.description,
        image: menuItemForm.image,
        categoryId: menuItemForm.categoryId,
        variants: menuItemForm.variants.map(v => ({
          name: v.name,
          price: parseFloat(v.price) || 0
        })),
        stock: parseInt(menuItemForm.stock) || 100,
        isPopular: menuItemForm.isPopular,
        isNew: menuItemForm.isNew,
        isPromo: menuItemForm.isPromo,
        isAvailable: menuItemForm.isAvailable
      }
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      })
      
      if (response.ok) {
        setMenuItemDialogOpen(false)
        // Refresh menu items
        const menuRes = await fetch('/api/menu')
        if (menuRes.ok) {
          const data = await menuRes.json()
          const allItems = data.categories?.flatMap((cat: any) => 
            cat.items.map((item: any) => ({ ...item, category: cat }))
          ) || []
          setMenuItems(allItems)
        }
      } else {
        const data = await response.json()
        alert(data.error || 'Gagal menyimpan menu')
      }
    } catch (error) {
      console.error('Error saving menu item:', error)
      alert('Gagal menyimpan menu')
    } finally {
      setSavingMenuItem(false)
    }
  }
  
  const handleDeleteMenuItem = async (id: string) => {
    if (!confirm('Hapus menu ini?')) return
    
    try {
      const response = await fetch(`/api/menu?id=${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      
      if (response.ok) {
        setMenuItems(prev => prev.filter(item => item.id !== id))
      } else {
        const data = await response.json()
        alert(data.error || 'Gagal menghapus menu')
      }
    } catch (error) {
      console.error('Error deleting menu item:', error)
      alert('Gagal menghapus menu')
    }
  }
  
  // Promo CRUD handlers
  const openPromoDialog = (promo?: Promo) => {
    if (promo) {
      setEditingPromo(promo)
      setPromoForm({
        code: promo.code,
        discount: String(promo.discount),
        minPurchase: String(promo.minPurchase),
        maxUses: promo.maxUses ? String(promo.maxUses) : '',
        expiresAt: promo.expiresAt ? promo.expiresAt.split('T')[0] : '',
        isActive: promo.isActive
      })
    } else {
      setEditingPromo(null)
      setPromoForm({
        code: '',
        discount: '',
        minPurchase: '0',
        maxUses: '',
        expiresAt: '',
        isActive: true
      })
    }
    setPromoDialogOpen(true)
  }
  
  const handleSavePromo = async () => {
    if (!promoForm.code.trim()) {
      alert('Kode promo harus diisi')
      return
    }
    if (!promoForm.discount || parseFloat(promoForm.discount) <= 0) {
      alert('Diskon harus lebih dari 0')
      return
    }
    
    setSavingPromo(true)
    try {
      const url = '/api/promos'
      const method = editingPromo ? 'PUT' : 'POST'
      const body = {
        ...(editingPromo ? { id: editingPromo.id } : {}),
        code: promoForm.code.toUpperCase(),
        discount: parseFloat(promoForm.discount),
        minPurchase: parseFloat(promoForm.minPurchase) || 0,
        maxUses: promoForm.maxUses ? parseInt(promoForm.maxUses) : null,
        expiresAt: promoForm.expiresAt ? new Date(promoForm.expiresAt).toISOString() : null,
        isActive: promoForm.isActive
      }
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      })
      
      if (response.ok) {
        setPromoDialogOpen(false)
        // Refresh promos
        const promosRes = await fetch('/api/promos')
        if (promosRes.ok) {
          const data = await promosRes.json()
          setPromos(data.promos || [])
        }
      } else {
        const data = await response.json()
        alert(data.message || data.error || 'Gagal menyimpan promo')
      }
    } catch (error) {
      console.error('Error saving promo:', error)
      alert('Gagal menyimpan promo')
    } finally {
      setSavingPromo(false)
    }
  }
  
  const handleDeletePromo = async (id: string) => {
    if (!confirm('Hapus promo ini?')) return
    
    try {
      const response = await fetch(`/api/promos?id=${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      
      if (response.ok) {
        setPromos(prev => prev.filter(p => p.id !== id))
      } else {
        const data = await response.json()
        alert(data.error || 'Gagal menghapus promo')
      }
    } catch (error) {
      console.error('Error deleting promo:', error)
      alert('Gagal menghapus promo')
    }
  }
  
  const togglePromoStatus = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch('/api/promos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id, isActive }),
      })
      
      if (response.ok) {
        setPromos(prev => prev.map(p => 
          p.id === id ? { ...p, isActive } : p
        ))
      }
    } catch (error) {
      console.error('Error toggling promo status:', error)
    }
  }
  
  // Fetch analytics data
  const fetchAnalytics = async () => {
    setAnalyticsLoading(true)
    try {
      let url = `/api/analytics?period=${analyticsPeriod}`
      if (analyticsPeriod === 'custom' && analyticsStartDate && analyticsEndDate) {
        url += `&startDate=${analyticsStartDate}&endDate=${analyticsEndDate}`
      }
      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        setAnalyticsData(data)
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setAnalyticsLoading(false)
    }
  }
  
  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesStatus = orderStatus === 'all' || order.status === orderStatus
    const matchesSearch = !searchQuery || 
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerPhone?.includes(searchQuery)
    return matchesStatus && matchesSearch
  })
  
  // Fetch analytics on mount or period change
  useEffect(() => {
    if (activeTab === 'analytics') {
      fetchAnalytics()
    }
  }, [activeTab, analyticsPeriod])
  
  // Stats
  const todayOrders = orders.filter(o => {
    const orderDate = new Date(o.createdAt).toDateString()
    return orderDate === new Date().toDateString()
  })
  
  const pendingOrders = orders.filter(o => o.status === 'pending')
  const todayRevenue = todayOrders.reduce((sum, o) => sum + o.total, 0)
  
  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl">Admin Login</CardTitle>
            <CardDescription>Masukkan password untuk mengakses dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  placeholder="Masukkan password admin"
                />
              </div>
              {authError && (
                <p className="text-sm text-destructive">{authError}</p>
              )}
              <Button className="w-full" onClick={handleLogin} disabled={isLoggingIn}>
                {isLoggingIn ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 mr-2" />
                    Login
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  // Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Memuat data...</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <Coffee className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-bold text-lg">{settings.cafe_name?.value || 'Star Village'} Admin</h1>
                <p className="text-xs text-muted-foreground">Dashboard Management</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1">
                <Clock className="w-3 h-3" />
                {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
              </Badge>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      {/* New Order Notification */}
      {newOrderNotification && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-bounce">
          <Card className="bg-green-600 text-white border-0 shadow-2xl min-w-[300px]">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  <Bell className="w-6 h-6 animate-pulse" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-lg">Pesanan Baru!</p>
                  <p className="text-sm opacity-90">
                    {newOrderNotification.orderNumber} - {newOrderNotification.customerName || 'Guest'}
                  </p>
                  <p className="text-sm font-medium">
                    {formatPrice(newOrderNotification.total)}
                  </p>
                </div>
                <Button 
                  size="sm" 
                  variant="secondary"
                  onClick={() => {
                    setActiveTab('orders')
                    setNewOrderNotification(null)
                  }}
                >
                  Lihat
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          {/* Sticky TabsList wrapper */}
          <div className="sticky top-[73px] z-40 bg-background/95 backdrop-blur-sm -mx-4 px-4 py-2 border-b">
            <TabsList className="grid w-full grid-cols-9">
              <TabsTrigger value="overview" className="gap-2">
                <TrendingUp className="w-4 h-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="orders" className="gap-2">
                <ShoppingCart className="w-4 h-4" />
                <span className="hidden sm:inline">Orders</span>
                {pendingOrders.length > 0 && (
                  <Badge className="ml-1 bg-yellow-500 text-white text-xs px-1.5 py-0.5 min-w-[20px] h-5 flex items-center justify-center">
                    {pendingOrders.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="analytics" className="gap-2">
                <DollarSign className="w-4 h-4" />
                <span className="hidden sm:inline">Analisis</span>
              </TabsTrigger>
              <TabsTrigger value="menu" className="gap-2">
                <Menu className="w-4 h-4" />
                <span className="hidden sm:inline">Menu</span>
              </TabsTrigger>
              <TabsTrigger value="promos" className="gap-2">
                <Gift className="w-4 h-4" />
                <span className="hidden sm:inline">Promo</span>
              </TabsTrigger>
              <TabsTrigger value="reservations" className="gap-2">
                <Calendar className="w-4 h-4" />
                <span className="hidden sm:inline">Reservasi</span>
                {reservations.filter(r => r.status === 'pending').length > 0 && (
                  <Badge className="ml-1 bg-yellow-500 text-white text-xs px-1.5 py-0.5 min-w-[20px] h-5 flex items-center justify-center">
                    {reservations.filter(r => r.status === 'pending').length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="gallery" className="gap-2">
                <ImageIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Gallery</span>
              </TabsTrigger>
              <TabsTrigger value="loyalty" className="gap-2">
                <Star className="w-4 h-4" />
                <span className="hidden sm:inline">Loyalty</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="gap-2">
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Settings</span>
              </TabsTrigger>
            </TabsList>
          </div>
          
          {/* Overview Tab */}
          <TabsContent value="overview">
            {/* Welcome Banner */}
            <Card className="mb-6 bg-gradient-to-r from-amber-500 to-orange-600 text-white border-0">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold mb-1">Selamat Datang! 👋</h2>
                    <p className="text-white/90">
                      {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-3xl font-bold">{todayOrders.length}</p>
                      <p className="text-sm text-white/80">Order Hari Ini</p>
                    </div>
                    <div className="w-px h-12 bg-white/30" />
                    <div className="text-center">
                      <p className="text-3xl font-bold">{formatPrice(todayRevenue)}</p>
                      <p className="text-sm text-white/80">Pendapatan</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <Card className="border-l-4 border-l-yellow-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Order Pending</p>
                      <p className="text-2xl font-bold">{pendingOrders.length}</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                      <Clock className="w-6 h-6 text-yellow-600" />
                    </div>
                  </div>
                  {pendingOrders.length > 0 && (
                    <Button size="sm" variant="ghost" className="mt-2 p-0 h-auto text-yellow-600" onClick={() => setActiveTab('orders')}>
                      Lihat semua →
                    </Button>
                  )}
                </CardContent>
              </Card>
              
              <Card className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Reservasi Pending</p>
                      <p className="text-2xl font-bold">{reservations.filter(r => r.status === 'pending').length}</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                  {reservations.filter(r => r.status === 'pending').length > 0 && (
                    <Button size="sm" variant="ghost" className="mt-2 p-0 h-auto text-blue-600" onClick={() => setActiveTab('reservations')}>
                      Lihat semua →
                    </Button>
                  )}
                </CardContent>
              </Card>
              
              <Card className="border-l-4 border-l-green-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Selesai Hari Ini</p>
                      <p className="text-2xl font-bold">{todayOrders.filter(o => o.status === 'completed').length}</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-l-4 border-l-purple-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Menu</p>
                      <p className="text-2xl font-bold">{menuItems.length}</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                      <Menu className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Action Required Section */}
            {(pendingOrders.length > 0 || reservations.filter(r => r.status === 'pending').length > 0) && (
              <Card className="mb-6 border-orange-200 bg-orange-50">
                <CardHeader>
                  <CardTitle className="text-orange-700 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Perlu Perhatian
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pendingOrders.length > 0 && (
                      <div className="p-4 bg-white rounded-lg border border-orange-200">
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-medium">{pendingOrders.length} Order Menunggu</span>
                          <Button size="sm" onClick={() => setActiveTab('orders')}>Proses</Button>
                        </div>
                        <div className="space-y-2">
                          {pendingOrders.slice(0, 3).map(order => (
                            <div key={order.id} className="flex items-center justify-between text-sm">
                              <span className="font-medium">{order.orderNumber}</span>
                              <span className="text-muted-foreground">{order.customerName || 'Guest'}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {reservations.filter(r => r.status === 'pending').length > 0 && (
                      <div className="p-4 bg-white rounded-lg border border-orange-200">
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-medium">{reservations.filter(r => r.status === 'pending').length} Reservasi Menunggu</span>
                          <Button size="sm" onClick={() => setActiveTab('reservations')}>Konfirmasi</Button>
                        </div>
                        <div className="space-y-2">
                          {reservations.filter(r => r.status === 'pending').slice(0, 3).map(res => (
                            <div key={res.id} className="flex items-center justify-between text-sm">
                              <span className="font-medium">{res.name}</span>
                              <span className="text-muted-foreground">{res.date} {res.time}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Quick Actions & Recent Activity */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Aksi Cepat</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button className="w-full justify-start" variant="outline" onClick={() => setActiveTab('menu')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah Menu Baru
                  </Button>
                  <Button className="w-full justify-start" variant="outline" onClick={() => setActiveTab('promos')}>
                    <Gift className="w-4 h-4 mr-2" />
                    Buat Promo
                  </Button>
                  <Button className="w-full justify-start" variant="outline" onClick={() => setActiveTab('gallery')}>
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Upload Gallery
                  </Button>
                  <Button className="w-full justify-start" variant="outline" onClick={() => setActiveTab('settings')}>
                    <Settings className="w-4 h-4 mr-2" />
                    Pengaturan
                  </Button>
                </CardContent>
              </Card>
              
              {/* Recent Orders */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base">Order Terbaru</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab('orders')}>Lihat Semua</Button>
                </CardHeader>
                <CardContent>
                  {orders.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">Belum ada order</p>
                  ) : (
                    <div className="space-y-3">
                      {orders.slice(0, 5).map(order => (
                        <div key={order.id} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">{order.orderNumber}</p>
                            <p className="text-xs text-muted-foreground">{order.customerName || 'Guest'}</p>
                          </div>
                          <div className="text-right">
                            <Badge className={statusColors[order.status]} variant="outline">
                              {statusLabels[order.status]}
                            </Badge>
                            <p className="text-xs font-medium mt-1">{formatPrice(order.total)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Recent Reservations */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base">Reservasi Terbaru</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab('reservations')}>Lihat Semua</Button>
                </CardHeader>
                <CardContent>
                  {reservations.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">Belum ada reservasi</p>
                  ) : (
                    <div className="space-y-3">
                      {reservations.slice(0, 5).map(res => (
                        <div key={res.id} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">{res.name}</p>
                            <p className="text-xs text-muted-foreground">{res.date} • {res.guests} tamu</p>
                          </div>
                          <Badge className={res.status === 'confirmed' ? 'bg-green-500/20 text-green-600' : res.status === 'pending' ? 'bg-yellow-500/20 text-yellow-600' : 'bg-red-500/20 text-red-600'} variant="outline">
                            {res.status === 'confirmed' ? 'Dikonfirmasi' : res.status === 'pending' ? 'Menunggu' : res.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            {/* Business Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Revenue</p>
                      <p className="text-xl font-bold">{formatPrice(orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + o.total, 0))}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                      <ShoppingCart className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Order</p>
                      <p className="text-xl font-bold">{orders.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                      <Users className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Reservasi</p>
                      <p className="text-xl font-bold">{reservations.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Avg Order Value</p>
                      <p className="text-xl font-bold">
                        {orders.filter(o => o.status === 'completed').length > 0 
                          ? formatPrice(orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + o.total, 0) / orders.filter(o => o.status === 'completed').length)
                          : 'Rp 0'
                        }
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            

          </TabsContent>
          
          {/* Orders Tab */}
          <TabsContent value="orders">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Cari no. order, nama, telepon..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={orderStatus} onValueChange={setOrderStatus}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="pending">Menunggu</SelectItem>
                  <SelectItem value="confirmed">Dikonfirmasi</SelectItem>
                  <SelectItem value="processing">Diproses</SelectItem>
                  <SelectItem value="delivering">Sedang Diantar</SelectItem>
                  <SelectItem value="completed">Selesai</SelectItem>
                  <SelectItem value="cancelled">Dibatalkan</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Orders List */}
            <Card>
              <CardHeader>
                <CardTitle>Daftar Pesanan ({filteredOrders.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {filteredOrders.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">Belum ada pesanan</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredOrders.map((order) => (
                      <div
                        key={order.id}
                        className="border border-border rounded-xl overflow-hidden"
                      >
                        {/* Order Header - Always visible */}
                        <div 
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-secondary/30 cursor-pointer hover:bg-secondary/50 transition-colors"
                          onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="font-bold text-lg">{order.orderNumber}</span>
                              <Badge className={statusColors[order.status]}>
                                {statusLabels[order.status] || order.status}
                              </Badge>
                              {order.orderType === 'delivery' && (
                                <Badge variant="outline" className="text-xs border-blue-500 text-blue-600">
                                  <Truck className="w-3 h-3 mr-1" />
                                  Delivery
                                </Badge>
                              )}
                              {order.orderType === 'pickup' && (
                                <Badge variant="outline" className="text-xs border-green-500 text-green-600">
                                  <Package className="w-3 h-3 mr-1" />
                                  Pickup
                                </Badge>
                              )}
                              <Badge variant="outline" className="text-xs">
                                {order.source}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                              <div>
                                <span className="text-muted-foreground">Nama:</span>{' '}
                                <span className="font-medium">{order.customerName || 'Guest'}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Telp:</span>{' '}
                                <a href={`tel:${order.customerPhone}`} className="font-medium text-blue-600 hover:underline">
                                  {order.customerPhone || '-'}
                                </a>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Items:</span>{' '}
                                <span className="font-medium">{order.items.length} item</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Waktu:</span>{' '}
                                <span className="font-medium">{formatDate(order.createdAt)}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <div className="text-right mr-4">
                              <p className="font-bold text-primary text-xl">{formatPrice(order.total)}</p>
                              {order.discount > 0 && (
                                <p className="text-xs text-green-600">Diskon: {formatPrice(order.discount)}</p>
                              )}
                              {order.deliveryFee && order.deliveryFee > 0 && (
                                <p className="text-xs text-blue-600">Ongkir: {formatPrice(order.deliveryFee)}</p>
                              )}
                            </div>
                            
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation()
                                setExpandedOrder(expandedOrder === order.id ? null : order.id)
                              }}
                            >
                              <Eye className={`w-4 h-4 transition-transform ${expandedOrder === order.id ? 'rotate-180' : ''}`} />
                            </Button>
                          </div>
                        </div>
                        
                        {/* Expanded Order Details */}
                        {expandedOrder === order.id && (
                          <div className="border-t border-border p-4 bg-white space-y-4">
                            {/* Customer Info */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                              <div className="p-3 bg-amber-50 rounded-lg">
                                <div className="flex items-center gap-2 text-amber-700 mb-1">
                                  <User className="w-4 h-4" />
                                  <span className="font-medium">Customer</span>
                                </div>
                                <p className="font-bold">{order.customerName || 'Guest'}</p>
                                <a href={`tel:${order.customerPhone}`} className="text-sm text-blue-600 hover:underline">
                                  {order.customerPhone || '-'}
                                </a>
                                {order.customerEmail && (
                                  <p className="text-sm text-muted-foreground">{order.customerEmail}</p>
                                )}
                              </div>
                              
                              <div className="p-3 bg-blue-50 rounded-lg">
                                <div className="flex items-center gap-2 text-blue-700 mb-1">
                                  <CreditCard className="w-4 h-4" />
                                  <span className="font-medium">Pembayaran</span>
                                </div>
                                <p className="font-bold capitalize">{order.paymentMethod || 'COD'}</p>
                                <p className="text-sm text-muted-foreground">
                                  Status: <span className={`font-medium ${order.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                                    {order.paymentStatus === 'paid' ? 'Lunas' : 'Pending'}
                                  </span>
                                </p>
                              </div>
                              
                              <div className="p-3 bg-green-50 rounded-lg">
                                <div className="flex items-center gap-2 text-green-700 mb-1">
                                  <Calendar className="w-4 h-4" />
                                  <span className="font-medium">Waktu Order</span>
                                </div>
                                <p className="font-bold">{formatDate(order.createdAt)}</p>
                                <p className="text-sm text-muted-foreground">via {order.source}</p>
                              </div>
                            </div>
                            
                            {/* Delivery Address */}
                            {order.orderType === 'delivery' && order.deliveryAddress && (
                              <div className="p-3 bg-purple-50 rounded-lg">
                                <div className="flex items-center gap-2 text-purple-700 mb-1">
                                  <MapPin className="w-4 h-4" />
                                  <span className="font-medium">Alamat Delivery</span>
                                </div>
                                <p className="text-sm">{order.deliveryAddress}</p>
                              </div>
                            )}
                            
                            {/* Payment Proof Section */}
                            {(order.paymentMethod === 'transfer' || order.paymentMethod === 'qris') && (
                              <div className={`p-4 rounded-lg ${
                                order.paymentStatus === 'paid' ? 'bg-green-50' :
                                order.paymentStatus === 'waiting_confirmation' ? 'bg-yellow-50' :
                                'bg-gray-50'
                              }`}>
                                <div className="flex items-center gap-2 mb-2">
                                  <CreditCard className="w-4 h-4" />
                                  <span className="font-medium">Bukti Pembayaran</span>
                                  <Badge className={`ml-auto ${
                                    order.paymentStatus === 'paid' ? 'bg-green-500' :
                                    order.paymentStatus === 'waiting_confirmation' ? 'bg-yellow-500' :
                                    'bg-gray-400'
                                  } text-white text-xs`}>
                                    {order.paymentStatus === 'paid' ? 'Terverifikasi' :
                                     order.paymentStatus === 'waiting_confirmation' ? 'Menunggu Verifikasi' :
                                     'Belum Upload'}
                                  </Badge>
                                </div>
                                
                                {order.paymentProofImage ? (
                                  <div className="space-y-3">
                                    <img 
                                      src={order.paymentProofImage} 
                                      alt="Bukti Pembayaran" 
                                      className="max-h-48 rounded-lg border mx-auto"
                                    />
                                    {order.paymentStatus === 'waiting_confirmation' && (
                                      <div className="flex gap-2 justify-center">
                                        <Button
                                          size="sm"
                                          className="bg-green-600 hover:bg-green-700"
                                          onClick={() => verifyPayment(order.id)}
                                        >
                                          <Check className="w-4 h-4 mr-1" />
                                          Verifikasi
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="destructive"
                                          onClick={() => rejectPayment(order.id)}
                                        >
                                          <XCircle className="w-4 h-4 mr-1" />
                                          Tolak
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <p className="text-sm text-muted-foreground text-center py-4">
                                    Customer belum upload bukti pembayaran
                                  </p>
                                )}
                              </div>
                            )}
                            
                            {/* COD Confirmation Status */}
                            {order.paymentMethod === 'cod' && (
                              <div className={`p-4 rounded-lg ${order.paymentStatus === 'paid' ? 'bg-green-50' : order.customerConfirmed ? 'bg-blue-50' : 'bg-yellow-50'}`}>
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-medium">Status Pembayaran COD</span>
                                  <Badge className={`${
                                    order.paymentStatus === 'paid' ? 'bg-green-500' :
                                    order.customerConfirmed ? 'bg-blue-500' : 'bg-yellow-500'
                                  } text-white text-xs`}>
                                    {order.paymentStatus === 'paid' ? 'Sudah Dibayar' :
                                     order.customerConfirmed ? 'Dikonfirmasi Customer' : 'Menunggu Konfirmasi'}
                                  </Badge>
                                </div>
                                
                                <div className="space-y-2 text-sm">
                                  <div className="flex items-center gap-2">
                                    {order.customerConfirmed ? (
                                      <CheckCircle className="w-4 h-4 text-green-600" />
                                    ) : (
                                      <Clock className="w-4 h-4 text-yellow-600" />
                                    )}
                                    <span>
                                      {order.customerConfirmed 
                                        ? 'Customer sudah konfirmasi pesanan' 
                                        : 'Menunggu konfirmasi customer'}
                                    </span>
                                  </div>
                                  
                                  {order.paymentStatus !== 'paid' && order.customerConfirmed && (
                                    <Button
                                      size="sm"
                                      className="w-full mt-2 bg-green-600 hover:bg-green-700"
                                      onClick={() => markCODPaid(order.id)}
                                    >
                                      <CheckCircle className="w-4 h-4 mr-2" />
                                      Konfirmasi Pembayaran Diterima
                                    </Button>
                                  )}
                                  
                                  {order.paymentStatus === 'paid' && (
                                    <div className="flex items-center gap-2 text-green-600 mt-2">
                                      <CheckCircle className="w-4 h-4" />
                                      <span className="font-medium">Pembayaran sudah diterima</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                            
                            {/* Order Items */}
                            <div>
                              <h4 className="font-medium mb-2 flex items-center gap-2">
                                <Package className="w-4 h-4" />
                                Detail Item Pesanan
                              </h4>
                              <div className="border rounded-lg overflow-hidden">
                                <table className="w-full text-sm">
                                  <thead className="bg-secondary">
                                    <tr>
                                      <th className="text-left p-3">Item</th>
                                      <th className="text-center p-3 w-20">Qty</th>
                                      <th className="text-right p-3 w-28">Harga</th>
                                      <th className="text-right p-3 w-28">Subtotal</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {order.items.map((item, idx) => (
                                      <tr key={idx} className="border-t">
                                        <td className="p-3">
                                          <p className="font-medium">{item.itemName}</p>
                                          {item.variantName && (
                                            <p className="text-xs text-muted-foreground">{item.variantName}</p>
                                          )}
                                        </td>
                                        <td className="p-3 text-center">{item.quantity}</td>
                                        <td className="p-3 text-right">{formatPrice(item.price)}</td>
                                        <td className="p-3 text-right font-medium">{formatPrice(item.subtotal)}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                            
                            {/* Order Summary */}
                            <div className="flex flex-col sm:flex-row gap-4">
                              <div className="flex-1 p-4 bg-gray-50 rounded-lg">
                                <div className="space-y-2">
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span className="font-medium">{formatPrice(order.subtotal)}</span>
                                  </div>
                                  {order.discount > 0 && (
                                    <div className="flex justify-between text-green-600">
                                      <span>Diskon</span>
                                      <span className="font-medium">-{formatPrice(order.discount)}</span>
                                    </div>
                                  )}
                                  {order.deliveryFee && order.deliveryFee > 0 && (
                                    <div className="flex justify-between text-blue-600">
                                      <span>Ongkos Kirim</span>
                                      <span className="font-medium">{formatPrice(order.deliveryFee)}</span>
                                    </div>
                                  )}
                                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                                    <span>Total</span>
                                    <span className="text-primary">{formatPrice(order.total)}</span>
                                  </div>
                                </div>
                              </div>
                              
                              {order.notes && (
                                <div className="flex-1 p-4 bg-yellow-50 rounded-lg">
                                  <div className="flex items-center gap-2 text-yellow-700 mb-2">
                                    <MessageCircle className="w-4 h-4" />
                                    <span className="font-medium">Catatan</span>
                                  </div>
                                  <p className="text-sm">{order.notes}</p>
                                </div>
                              )}
                            </div>
                            
                            {/* Actions */}
                            <div className="flex flex-wrap gap-2 pt-2 border-t">
                              <Select
                                value={order.status}
                                onValueChange={(val) => updateOrderStatus(order.id, val)}
                              >
                                <SelectTrigger className="w-40">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">Menunggu</SelectItem>
                                  <SelectItem value="confirmed">Dikonfirmasi</SelectItem>
                                  <SelectItem value="processing">Diproses</SelectItem>
                                  <SelectItem value="delivering">Sedang Diantar</SelectItem>
                                  <SelectItem value="completed">Selesai</SelectItem>
                                  <SelectItem value="cancelled">Batal</SelectItem>
                                </SelectContent>
                              </Select>
                              
                              <Button
                                variant="outline"
                                className="text-green-600 border-green-300 hover:bg-green-50"
                                onClick={() => sendWhatsAppNotification(order)}
                              >
                                <MessageCircle className="w-4 h-4 mr-2" />
                                WhatsApp
                              </Button>
                              
                              <Button
                                variant="outline"
                                onClick={() => copyToClipboard(JSON.stringify(order, null, 2))}
                              >
                                <Copy className="w-4 h-4 mr-2" />
                                Copy
                              </Button>
                              
                              <Button
                                variant="destructive"
                                onClick={() => deleteOrder(order.id)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Hapus
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Analytics Tab */}
          <TabsContent value="analytics">
            {/* Period Filter */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex gap-2 flex-wrap">
                <Button 
                  variant={analyticsPeriod === 'daily' ? 'default' : 'outline'}
                  onClick={() => setAnalyticsPeriod('daily')}
                >
                  Hari Ini
                </Button>
                <Button 
                  variant={analyticsPeriod === 'weekly' ? 'default' : 'outline'}
                  onClick={() => setAnalyticsPeriod('weekly')}
                >
                  Minggu Ini
                </Button>
                <Button 
                  variant={analyticsPeriod === 'monthly' ? 'default' : 'outline'}
                  onClick={() => setAnalyticsPeriod('monthly')}
                >
                  Bulan Ini
                </Button>
                <Button 
                  variant={analyticsPeriod === 'custom' ? 'default' : 'outline'}
                  onClick={() => setAnalyticsPeriod('custom')}
                >
                  Custom
                </Button>
              </div>
              
              {analyticsPeriod === 'custom' && (
                <div className="flex items-center gap-2">
                  <Input
                    type="date"
                    value={analyticsStartDate}
                    onChange={(e) => setAnalyticsStartDate(e.target.value)}
                    className="w-40"
                  />
                  <span className="text-muted-foreground">-</span>
                  <Input
                    type="date"
                    value={analyticsEndDate}
                    onChange={(e) => setAnalyticsEndDate(e.target.value)}
                    className="w-40"
                  />
                  <Button onClick={fetchAnalytics} disabled={!analyticsStartDate || !analyticsEndDate}>
                    Filter
                  </Button>
                </div>
              )}
            </div>
            
            {analyticsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : analyticsData ? (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                          <ShoppingCart className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">{analyticsData.orders.summary.totalOrders}</p>
                          <p className="text-xs text-muted-foreground">Total Order</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">{analyticsData.orders.summary.completedOrders}</p>
                          <p className="text-xs text-muted-foreground">Order Selesai</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                          <DollarSign className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">{formatPrice(analyticsData.orders.summary.totalRevenue)}</p>
                          <p className="text-xs text-muted-foreground">Pendapatan</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">{analyticsData.reservations.summary.totalReservations}</p>
                          <p className="text-xs text-muted-foreground">Reservasi</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                          <Users className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">{analyticsData.reservations.summary.totalGuests}</p>
                          <p className="text-xs text-muted-foreground">Total Tamu</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Orders Section */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-blue-600" />
                    Analisis Order
                  </h3>
                  
                  {/* Status & Order Types */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <Card>
                      <CardHeader className="py-3">
                        <CardTitle className="text-sm">Status Order</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-yellow-500" />
                              <span className="text-sm">Pending</span>
                            </div>
                            <span className="font-bold">{analyticsData.orders.summary.pendingOrders}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-purple-500" />
                              <span className="text-sm">Diproses</span>
                            </div>
                            <span className="font-bold">{analyticsData.orders.summary.processingOrders}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-green-500" />
                              <span className="text-sm">Selesai</span>
                            </div>
                            <span className="font-bold">{analyticsData.orders.summary.completedOrders}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-red-500" />
                              <span className="text-sm">Batal</span>
                            </div>
                            <span className="font-bold">{analyticsData.orders.summary.cancelledOrders}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="py-3">
                        <CardTitle className="text-sm">Tipe Order</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <Package className="w-4 h-4 text-green-600" />
                              <span className="text-sm">Pick Up</span>
                            </div>
                            <span className="font-bold">{analyticsData.orders.orderTypes.pickup}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <Truck className="w-4 h-4 text-blue-600" />
                              <span className="text-sm">Delivery</span>
                            </div>
                            <span className="font-bold">{analyticsData.orders.orderTypes.delivery}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="py-3">
                        <CardTitle className="text-sm">Metode Pembayaran</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-2">
                          {Object.entries(analyticsData.orders.paymentMethods).map(([method, count]) => (
                            <div key={method} className="flex justify-between items-center">
                              <span className="text-sm capitalize">{method}</span>
                              <span className="font-bold">{count as number}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  {/* Revenue & Top Items */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="py-3">
                        <CardTitle className="text-sm">Ringkasan Pendapatan</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center p-2 bg-green-50 rounded-lg">
                            <span className="text-sm text-green-700">Total Pendapatan</span>
                            <span className="font-bold text-green-700">{formatPrice(analyticsData.orders.summary.totalRevenue)}</span>
                          </div>
                          <div className="flex justify-between items-center p-2 bg-blue-50 rounded-lg">
                            <span className="text-sm text-blue-700">Total Ongkir</span>
                            <span className="font-bold text-blue-700">{formatPrice(analyticsData.orders.summary.totalDeliveryFee)}</span>
                          </div>
                          <div className="flex justify-between items-center p-2 bg-red-50 rounded-lg">
                            <span className="text-sm text-red-700">Total Diskon</span>
                            <span className="font-bold text-red-700">{formatPrice(analyticsData.orders.summary.totalDiscount)}</span>
                          </div>
                          <div className="flex justify-between items-center p-2 bg-amber-50 rounded-lg">
                            <span className="text-sm text-amber-700">Rata-rata Order</span>
                            <span className="font-bold text-amber-700">{formatPrice(analyticsData.orders.summary.avgOrderValue)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="py-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Package className="w-4 h-4" />
                          Menu Terlaris
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        {analyticsData.orders.topSellingItems.length === 0 ? (
                          <p className="text-muted-foreground text-center py-2 text-sm">Belum ada data</p>
                        ) : (
                          <div className="space-y-1">
                            {analyticsData.orders.topSellingItems.slice(0, 5).map((item: any, idx: number) => (
                              <div key={idx} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                  <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                                    {idx + 1}
                                  </span>
                                  <span className="truncate max-w-[120px]">{item.name}</span>
                                </div>
                                <span className="font-medium">{item.quantity}x</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
                
                {/* Reservations Section */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-purple-600" />
                    Analisis Reservasi
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">Total Reservasi</p>
                            <p className="text-xl font-bold">{analyticsData.reservations.summary.totalReservations}</p>
                          </div>
                          <Calendar className="w-8 h-8 text-purple-500/50" />
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">Dikonfirmasi</p>
                            <p className="text-xl font-bold text-green-600">{analyticsData.reservations.summary.confirmedReservations}</p>
                          </div>
                          <CheckCircle className="w-8 h-8 text-green-500/50" />
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">Menunggu</p>
                            <p className="text-xl font-bold text-yellow-600">{analyticsData.reservations.summary.pendingReservations}</p>
                          </div>
                          <Clock className="w-8 h-8 text-yellow-500/50" />
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">Total Tamu</p>
                            <p className="text-xl font-bold">{analyticsData.reservations.summary.totalGuests}</p>
                          </div>
                          <Users className="w-8 h-8 text-blue-500/50" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="py-3">
                        <CardTitle className="text-sm">Tipe Area</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <Home className="w-4 h-4 text-amber-600" />
                              <span className="text-sm">Indoor</span>
                            </div>
                            <span className="font-bold">{analyticsData.reservations.seatingTypes.indoor}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <TreePine className="w-4 h-4 text-green-600" />
                              <span className="text-sm">Outdoor</span>
                            </div>
                            <span className="font-bold">{analyticsData.reservations.seatingTypes.outdoor}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="py-3">
                        <CardTitle className="text-sm">Jam Populer</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        {analyticsData.reservations.popularTimeSlots.length === 0 ? (
                          <p className="text-muted-foreground text-sm">Belum ada data</p>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {analyticsData.reservations.popularTimeSlots.slice(0, 4).map((slot: any) => (
                              <Badge key={slot.slot} variant="secondary">
                                {slot.slot} ({slot.count})
                              </Badge>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="py-3">
                        <CardTitle className="text-sm">Hari Populer</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        {analyticsData.reservations.popularDays.length === 0 ? (
                          <p className="text-muted-foreground text-sm">Belum ada data</p>
                        ) : (
                          <div className="space-y-1">
                            {analyticsData.reservations.popularDays.slice(0, 4).map((day: any) => (
                              <div key={day.day} className="flex justify-between text-sm">
                                <span>{day.day}</span>
                                <span className="font-medium">{day.count}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
                
                {/* Peak Hours */}
                <Card className="mb-6">
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Jam Sibuk Order
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {analyticsData.orders.peakHours.length === 0 ? (
                      <p className="text-muted-foreground text-center py-2 text-sm">Belum ada data order</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {analyticsData.orders.peakHours.map((hour: any) => (
                          <div key={hour.hour} className="flex items-center gap-2 px-3 py-1.5 bg-amber-100 text-amber-700 rounded-full text-sm">
                            <Clock className="w-3 h-3" />
                            <span className="font-medium">{String(hour.hour).padStart(2, '0')}:00</span>
                            <Badge variant="secondary" className="text-xs">{hour.orders} order</Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                {/* Daily Chart */}
                {analyticsData.chartData.length > 0 && (
                  <Card>
                    <CardHeader className="py-3">
                      <CardTitle className="text-sm">Grafik Harian</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-1">
                        {analyticsData.chartData.map((day: any) => (
                          <div key={day.date} className="flex items-center gap-3 text-sm">
                            <span className="w-20 text-muted-foreground">{day.date}</span>
                            <div className="flex-1 bg-secondary rounded-full h-5 overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full flex items-center justify-end pr-2"
                                style={{ 
                                  width: `${Math.min((day.orders / Math.max(...analyticsData.chartData.map((d: any) => d.orders))) * 100, 100)}%`,
                                  minWidth: day.orders > 0 ? '30px' : '0'
                                }}
                              >
                                {day.orders > 0 && (
                                  <span className="text-xs text-white font-medium">{day.orders}</span>
                                )}
                              </div>
                            </div>
                            <span className="w-20 text-right font-medium">{formatPrice(day.revenue)}</span>
                            {day.reservations > 0 && (
                              <Badge variant="outline" className="text-xs">
                                {day.reservations} res
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <TrendingUp className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">Pilih periode untuk melihat analisis</p>
              </div>
            )}
          </TabsContent>
          
          {/* Menu Tab */}
          <TabsContent value="menu">
            {/* Categories Section */}
            <Card className="mb-6">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Kategori Menu ({categories.length})</CardTitle>
                  <CardDescription>Kelola kategori menu</CardDescription>
                </div>
                <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => openCategoryDialog()}>
                      <Plus className="w-4 h-4 mr-2" />
                      Tambah Kategori
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{editingCategory ? 'Edit Kategori' : 'Tambah Kategori'}</DialogTitle>
                      <DialogDescription>
                        {editingCategory ? 'Ubah detail kategori' : 'Buat kategori menu baru'}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <Label>Nama Kategori *</Label>
                        <Input
                          value={categoryForm.name}
                          onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                          placeholder="Contoh: Coffee, Non-Coffee, Snacks"
                        />
                      </div>
                      <div>
                        <Label>Icon (emoji, opsional)</Label>
                        <Input
                          value={categoryForm.icon}
                          onChange={(e) => setCategoryForm({ ...categoryForm, icon: e.target.value })}
                          placeholder="☕, 🍰, 🍔"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setCategoryDialogOpen(false)}>Batal</Button>
                      <Button onClick={handleSaveCategory} disabled={savingCategory}>
                        {savingCategory ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Menyimpan...
                          </>
                        ) : (
                          'Simpan'
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {categories.length === 0 ? (
                  <div className="text-center py-8">
                    <Menu className="w-10 h-10 mx-auto text-muted-foreground/50 mb-3" />
                    <p className="text-muted-foreground">Belum ada kategori</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {categories.map((category) => (
                      <div 
                        key={category.id} 
                        className="flex items-center justify-between p-4 rounded-xl border border-border bg-secondary/30"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-xl">
                            {category.icon || '📦'}
                          </div>
                          <div>
                            <p className="font-medium">{category.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {category._count?.items || 0} item
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => openCategoryDialog(category)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-500 hover:text-red-600"
                            onClick={() => handleDeleteCategory(category.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Menu Items Section */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Menu Items ({menuItems.length})</CardTitle>
                  <CardDescription>Kelola item menu</CardDescription>
                </div>
                <div className="flex items-center gap-3">
                  <Select value={menuCategoryFilter} onValueChange={setMenuCategoryFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Filter kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Kategori</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Dialog open={menuItemDialogOpen} onOpenChange={setMenuItemDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={() => openMenuItemDialog()}>
                        <Plus className="w-4 h-4 mr-2" />
                        Tambah Menu
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>{editingMenuItem ? 'Edit Menu' : 'Tambah Menu Baru'}</DialogTitle>
                        <DialogDescription>
                          {editingMenuItem ? 'Ubah detail menu' : 'Buat item menu baru'}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        {/* Image Upload */}
                        <div>
                          <Label>Gambar</Label>
                          {menuItemForm.image && (
                            <div className="relative aspect-video rounded-lg overflow-hidden bg-secondary mb-2">
                              <img src={menuItemForm.image} alt="Preview" className="w-full h-full object-cover" />
                              <Button 
                                variant="destructive" 
                                size="sm"
                                className="absolute top-2 right-2"
                                onClick={() => setMenuItemForm({ ...menuItemForm, image: '' })}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            ref={menuImageInputRef}
                            onChange={handleMenuImageUpload}
                            className="hidden"
                          />
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => menuImageInputRef.current?.click()}
                              disabled={uploadingMenuImage}
                            >
                              {uploadingMenuImage ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Uploading...
                                </>
                              ) : (
                                <>
                                  <Upload className="w-4 h-4 mr-2" />
                                  Upload
                                </>
                              )}
                            </Button>
                            <Input
                              placeholder="Atau masukkan URL gambar"
                              value={menuItemForm.image}
                              onChange={(e) => setMenuItemForm({ ...menuItemForm, image: e.target.value })}
                              className="flex-1"
                            />
                          </div>
                        </div>
                        
                        {/* Name & Category */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Nama Menu *</Label>
                            <Input
                              value={menuItemForm.name}
                              onChange={(e) => setMenuItemForm({ ...menuItemForm, name: e.target.value })}
                              placeholder="Nama menu"
                            />
                          </div>
                          <div>
                            <Label>Kategori *</Label>
                            <Select 
                              value={menuItemForm.categoryId} 
                              onValueChange={(val) => setMenuItemForm({ ...menuItemForm, categoryId: val })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih kategori" />
                              </SelectTrigger>
                              <SelectContent>
                                {categories.map((cat) => (
                                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                        {/* Description */}
                        <div>
                          <Label>Deskripsi</Label>
                          <Textarea
                            value={menuItemForm.description}
                            onChange={(e) => setMenuItemForm({ ...menuItemForm, description: e.target.value })}
                            placeholder="Deskripsi menu"
                            rows={2}
                          />
                        </div>
                        
                        {/* Variants */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <Label>Varian (Nama & Harga) *</Label>
                            <Button type="button" variant="outline" size="sm" onClick={addVariant}>
                              <Plus className="w-4 h-4 mr-1" />
                              Tambah Varian
                            </Button>
                          </div>
                          <div className="space-y-2">
                            {menuItemForm.variants.map((variant, index) => (
                              <div key={index} className="flex items-center gap-2">
                                <Input
                                  placeholder="Nama (contoh: Regular)"
                                  value={variant.name}
                                  onChange={(e) => updateVariant(index, 'name', e.target.value)}
                                  className="flex-1"
                                />
                                <Input
                                  placeholder="Harga (Rp ribuan)"
                                  type="number"
                                  value={variant.price}
                                  onChange={(e) => updateVariant(index, 'price', e.target.value)}
                                  className="w-28"
                                />
                                {menuItemForm.variants.length > 1 && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="text-red-500"
                                    onClick={() => removeVariant(index)}
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        {/* Stock */}
                        <div>
                          <Label>Stok</Label>
                          <Input
                            type="number"
                            value={menuItemForm.stock}
                            onChange={(e) => setMenuItemForm({ ...menuItemForm, stock: e.target.value })}
                            placeholder="100"
                          />
                        </div>
                        
                        {/* Checkboxes */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="isPopular"
                              checked={menuItemForm.isPopular}
                              onChange={(e) => setMenuItemForm({ ...menuItemForm, isPopular: e.target.checked })}
                              className="w-4 h-4 rounded border-gray-300"
                            />
                            <Label htmlFor="isPopular" className="font-normal">Menu Populer</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="isNew"
                              checked={menuItemForm.isNew}
                              onChange={(e) => setMenuItemForm({ ...menuItemForm, isNew: e.target.checked })}
                              className="w-4 h-4 rounded border-gray-300"
                            />
                            <Label htmlFor="isNew" className="font-normal">Menu Baru</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="isPromo"
                              checked={menuItemForm.isPromo}
                              onChange={(e) => setMenuItemForm({ ...menuItemForm, isPromo: e.target.checked })}
                              className="w-4 h-4 rounded border-gray-300"
                            />
                            <Label htmlFor="isPromo" className="font-normal">Menu Promo</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="isAvailable"
                              checked={menuItemForm.isAvailable}
                              onChange={(e) => setMenuItemForm({ ...menuItemForm, isAvailable: e.target.checked })}
                              className="w-4 h-4 rounded border-gray-300"
                            />
                            <Label htmlFor="isAvailable" className="font-normal">Tersedia</Label>
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setMenuItemDialogOpen(false)}>Batal</Button>
                        <Button onClick={handleSaveMenuItem} disabled={savingMenuItem}>
                          {savingMenuItem ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Menyimpan...
                            </>
                          ) : (
                            'Simpan'
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {menuItems.length === 0 ? (
                  <div className="text-center py-12">
                    <Menu className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">Belum ada menu</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {menuItems
                      .filter(item => menuCategoryFilter === 'all' || item.category?.id === menuCategoryFilter)
                      .map((item) => (
                        <div 
                          key={item.id} 
                          className="p-4 rounded-xl border border-border bg-secondary/30"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-secondary">
                              {item.image ? (
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Menu className="w-8 h-8 text-muted-foreground/50" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <div>
                                  <p className="font-semibold truncate">{item.name}</p>
                                  <p className="text-xs text-muted-foreground">{item.category?.name}</p>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => openMenuItemDialog(item)}
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-red-500 hover:text-red-600"
                                    onClick={() => handleDeleteMenuItem(item.id)}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                </div>
                              </div>
                              <p className="text-sm font-bold text-primary mt-1">
                                {formatPrice(item.variants[0]?.price || 0)}
                                {item.variants.length > 1 && (
                                  <span className="text-xs text-muted-foreground font-normal ml-1">
                                    ({item.variants.length} varian)
                                  </span>
                                )}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <span className="text-xs text-muted-foreground">Stok: {item.stock}</span>
                                {item.isPopular && <Badge className="text-xs bg-orange-500">Best</Badge>}
                                {item.isNew && <Badge className="text-xs bg-purple-500">New</Badge>}
                                {item.isPromo && <Badge className="text-xs bg-green-500">Promo</Badge>}
                                {!item.isAvailable && <Badge className="text-xs bg-gray-500">Nonaktif</Badge>}
                                {item.stock <= 0 && <Badge className="text-xs bg-red-500">Habis</Badge>}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Promos Tab */}
          <TabsContent value="promos">
            {/* Voucher Codes Section */}
            <Card className="mb-6">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Gift className="w-5 h-5" />
                    Kode Promo ({promos.length})
                  </CardTitle>
                  <CardDescription>Kode voucher untuk diskon pembelian</CardDescription>
                </div>
                <Dialog open={promoDialogOpen} onOpenChange={setPromoDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => openPromoDialog()}>
                      <Plus className="w-4 h-4 mr-2" />
                      Tambah Promo
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>{editingPromo ? 'Edit Promo' : 'Tambah Promo Baru'}</DialogTitle>
                      <DialogDescription>
                        {editingPromo ? 'Ubah detail promo' : 'Buat kode promo baru untuk pelanggan'}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <Label>Kode Promo *</Label>
                        <Input
                          placeholder="CONTOH: DISKON10"
                          value={promoForm.code}
                          onChange={(e) => setPromoForm({...promoForm, code: e.target.value.toUpperCase()})}
                          className="uppercase"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Diskon (%) *</Label>
                          <Input
                            type="number"
                            placeholder="10"
                            value={promoForm.discount}
                            onChange={(e) => setPromoForm({...promoForm, discount: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label>Min. Pembelian (Rp)</Label>
                          <Input
                            type="number"
                            placeholder="0"
                            value={promoForm.minPurchase}
                            onChange={(e) => setPromoForm({...promoForm, minPurchase: e.target.value})}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Maks. Penggunaan</Label>
                          <Input
                            type="number"
                            placeholder="Kosongkan = tanpa batas"
                            value={promoForm.maxUses}
                            onChange={(e) => setPromoForm({...promoForm, maxUses: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label>Kadaluarsa</Label>
                          <Input
                            type="date"
                            value={promoForm.expiresAt}
                            onChange={(e) => setPromoForm({...promoForm, expiresAt: e.target.value})}
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="promoActive"
                          checked={promoForm.isActive}
                          onChange={(e) => setPromoForm({...promoForm, isActive: e.target.checked})}
                          className="w-4 h-4"
                        />
                        <Label htmlFor="promoActive" className="cursor-pointer">Aktifkan promo</Label>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setPromoDialogOpen(false)}>Batal</Button>
                      <Button onClick={handleSavePromo} disabled={savingPromo}>
                        {savingPromo && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        {editingPromo ? 'Simpan' : 'Tambah'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {promos.length === 0 ? (
                  <div className="text-center py-12">
                    <Gift className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground mb-2">Belum ada kode promo</p>
                    <p className="text-sm text-muted-foreground">Klik "Tambah Promo" untuk membuat kode promo baru</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {promos.map((promo) => (
                      <div key={promo.id} className="flex items-center justify-between p-4 bg-secondary/30 rounded-xl border border-border">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-lg">{promo.code}</p>
                            <Badge className={promo.isActive ? 'bg-green-500' : 'bg-gray-500'}>
                              {promo.isActive ? 'Aktif' : 'Nonaktif'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Diskon <span className="font-semibold text-foreground">{promo.discount}%</span> • 
                            Min. pembelian <span className="font-semibold text-foreground">{formatPrice(promo.minPurchase)}</span>
                          </p>
                          <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                            <span>Digunakan: {promo.usedCount}/{promo.maxUses || '∞'}</span>
                            {promo.expiresAt && (
                              <span className={new Date(promo.expiresAt) < new Date() ? 'text-red-500' : ''}>
                                {new Date(promo.expiresAt) < new Date() ? 'Kadaluarsa' : `Kadaluarsa: ${new Date(promo.expiresAt).toLocaleDateString('id-ID')}`}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => togglePromoStatus(promo.id, !promo.isActive)}
                            title={promo.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                          >
                            {promo.isActive ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openPromoDialog(promo)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDeletePromo(promo.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Menu Promo Items Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Menu className="w-5 h-5" />
                  Menu Promo ({menuItems.filter(i => i.isPromo).length})
                </CardTitle>
                <CardDescription>Menu yang sedang dalam promo</CardDescription>
              </CardHeader>
              <CardContent>
                {menuItems.filter(i => i.isPromo).length === 0 ? (
                  <div className="text-center py-12">
                    <Menu className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground mb-2">Belum ada menu promo</p>
                    <p className="text-sm text-muted-foreground">
                      Tandai menu sebagai promo di tab Menu untuk menampilkan di sini
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {menuItems.filter(i => i.isPromo).map((item) => (
                      <div key={item.id} className="p-4 bg-secondary/30 rounded-xl border border-border">
                        {item.image && (
                          <div className="w-full h-24 rounded-lg overflow-hidden mb-3">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <h4 className="font-semibold">{item.name}</h4>
                        <p className="text-sm text-muted-foreground">{item.category?.name}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {item.variants.slice(0, 2).map((v) => (
                            <Badge key={v.id} variant="secondary" className="text-xs">
                              {v.name}: {formatPrice(v.price)}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <Badge className={item.isAvailable ? 'bg-green-500' : 'bg-gray-500'}>
                            {item.isAvailable ? 'Tersedia' : 'Tidak tersedia'}
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openMenuItemDialog(item)}
                          >
                            <Edit className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Reservations Tab */}
          <TabsContent value="reservations">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle>Reservasi ({reservations.length})</CardTitle>
                    <CardDescription>Kelola reservasi pelanggan</CardDescription>
                  </div>
                  {/* Status Filter */}
                  <div className="flex items-center gap-2">
                    <Select value={reservationFilter} onValueChange={setReservationFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Filter Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Status</SelectItem>
                        <SelectItem value="pending">Menunggu</SelectItem>
                        <SelectItem value="confirmed">Dikonfirmasi</SelectItem>
                        <SelectItem value="completed">Selesai</SelectItem>
                        <SelectItem value="cancelled">Dibatalkan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {reservations.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">Belum ada reservasi</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reservations
                      .filter(res => reservationFilter === 'all' || res.status === reservationFilter)
                      .map((res) => (
                      <div key={res.id} className="p-4 bg-secondary/30 rounded-xl border border-border">
                        {/* Header Row */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-4 border-b border-border">
                          <div className="flex items-center gap-3">
                            {/* Reservation Code */}
                            <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1.5 rounded-lg">
                              <p className="text-xs font-medium opacity-80">Kode Reservasi</p>
                              <p className="font-mono font-bold text-sm">
                                {res.reservationCode || 'N/A'}
                              </p>
                            </div>
                            {/* Status Badge */}
                            <Badge className={`${statusColors[res.status]} text-sm px-3 py-1`}>
                              {statusLabels[res.status] || res.status}
                            </Badge>
                          </div>
                          {/* Created Time */}
                          <p className="text-xs text-muted-foreground">
                            Dibuat: {formatDate(res.createdAt)}
                          </p>
                        </div>

                        {/* Customer & Reservation Info Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                          {/* Customer Info */}
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <User className="w-4 h-4 text-muted-foreground" />
                              <span className="font-semibold">{res.name}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Phone className="w-4 h-4" />
                              <a href={`tel:${res.phone}`} className="hover:text-primary">
                                {res.phone}
                              </a>
                            </div>
                            {res.email && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Mail className="w-4 h-4" />
                                <a href={`mailto:${res.email}`} className="hover:text-primary truncate">
                                  {res.email}
                                </a>
                              </div>
                            )}
                          </div>

                          {/* Date & Time */}
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="w-4 h-4 text-amber-600" />
                              <span className="font-semibold">{res.date}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="w-4 h-4" />
                              <span>{res.time} WIB</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Users className="w-4 h-4" />
                              <span>{res.guests} orang</span>
                            </div>
                            {res.seatingType && (
                              <div className="flex items-center gap-2 text-sm">
                                {res.seatingType === 'indoor' ? (
                                  <>
                                    <Home className="w-4 h-4 text-amber-600" />
                                    <span className="font-medium text-amber-700">Indoor</span>
                                  </>
                                ) : (
                                  <>
                                    <TreePine className="w-4 h-4 text-green-600" />
                                    <span className="font-medium text-green-700">Outdoor</span>
                                  </>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Customer Notes */}
                          <div className="lg:col-span-2">
                            {res.notes ? (
                              <div className="bg-muted/50 rounded-lg p-3">
                                <p className="text-xs font-medium text-muted-foreground mb-1">Catatan Customer:</p>
                                <p className="text-sm">{res.notes}</p>
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground italic">Tidak ada catatan</p>
                            )}
                          </div>
                        </div>

                        {/* Admin Notes */}
                        {res.adminNotes && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                            <p className="text-xs font-medium text-blue-600 mb-1">Feedback dari Admin:</p>
                            <p className="text-sm text-blue-800">{res.adminNotes}</p>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-2 pt-3 border-t border-border">
                          {res.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => updateReservationStatus(res.id, 'confirmed')}
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Konfirmasi
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => updateReservationStatus(res.id, 'cancelled')}
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Tolak
                              </Button>
                            </>
                          )}
                          {res.status === 'confirmed' && (
                            <Button
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700"
                              onClick={() => updateReservationStatus(res.id, 'completed')}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Selesai
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openAdminNotesDialog(res)}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Catatan
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => sendReservationWhatsApp(res)}
                          >
                            <MessageCircle className="w-4 h-4 mr-1" />
                            WhatsApp
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(res.reservationCode || '')}
                            disabled={!res.reservationCode}
                          >
                            <Copy className="w-4 h-4 mr-1" />
                            Copy Kode
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Admin Notes Dialog */}
            <Dialog open={reservationNotesOpen} onOpenChange={setReservationNotesOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Catatan untuk Customer</DialogTitle>
                  <DialogDescription>
                    Catatan ini akan terlihat oleh customer saat mereka mengecek status reservasi.
                    Berguna untuk memberikan feedback atau informasi tambahan.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  {editingReservation && (
                    <div className="bg-muted p-3 rounded-lg text-sm">
                      <p><strong>Reservasi:</strong> {editingReservation.reservationCode}</p>
                      <p><strong>Customer:</strong> {editingReservation.name}</p>
                      <p><strong>Jadwal:</strong> {editingReservation.date} pukul {editingReservation.time}</p>
                    </div>
                  )}
                  <div>
                    <Label>Catatan / Feedback</Label>
                    <Textarea
                      value={adminNotesForm}
                      onChange={(e) => setAdminNotesForm(e.target.value)}
                      placeholder="Contoh: Reservasi dikonfirmasi untuk meja outdoor. Mohon datang 10 menit lebih awal."
                      rows={4}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setReservationNotesOpen(false)}>
                    Batal
                  </Button>
                  <Button onClick={saveAdminNotes} disabled={savingAdminNotes}>
                    {savingAdminNotes ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      'Simpan'
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </TabsContent>
          
          {/* Gallery Tab */}
          <TabsContent value="gallery">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Gallery ({gallery.length})</CardTitle>
                  <CardDescription>Foto-foto untuk ditampilkan di website</CardDescription>
                </div>
                <Dialog open={galleryUploadOpen} onOpenChange={setGalleryUploadOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Tambah Foto
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Tambah Foto Gallery</DialogTitle>
                      <DialogDescription>Upload foto atau masukkan URL</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      {/* Preview */}
                      {newGalleryImage.imageUrl && (
                        <div className="relative aspect-video rounded-lg overflow-hidden bg-secondary">
                          <img src={newGalleryImage.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                          <Button 
                            variant="destructive" 
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={() => setNewGalleryImage({...newGalleryImage, imageUrl: ''})}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                      
                      {/* Upload File */}
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          ref={galleryInputRef}
                          onChange={handleGalleryFileUpload}
                          className="hidden"
                        />
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => galleryInputRef.current?.click()}
                          disabled={uploadingGallery}
                        >
                          {uploadingGallery ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="w-4 h-4 mr-2" />
                              Upload dari Komputer
                            </>
                          )}
                        </Button>
                        <p className="text-xs text-muted-foreground mt-1 text-center">Format: JPG, PNG, WebP. Maks 5MB</p>
                      </div>
                      
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-background px-2 text-muted-foreground">atau</span>
                        </div>
                      </div>
                      
                      {/* URL Input */}
                      <div>
                        <Label>URL Gambar</Label>
                        <Input
                          placeholder="https://example.com/image.jpg"
                          value={newGalleryImage.imageUrl}
                          onChange={(e) => setNewGalleryImage({...newGalleryImage, imageUrl: e.target.value})}
                        />
                        <p className="text-xs text-muted-foreground mt-1">Paste URL gambar dari internet</p>
                      </div>
                      
                      {/* Title & Description */}
                      <div>
                        <Label>Judul (opsional)</Label>
                        <Input
                          value={newGalleryImage.title}
                          onChange={(e) => setNewGalleryImage({...newGalleryImage, title: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label>Deskripsi (opsional)</Label>
                        <Textarea
                          value={newGalleryImage.description}
                          onChange={(e) => setNewGalleryImage({...newGalleryImage, description: e.target.value})}
                          rows={2}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => {
                        setGalleryUploadOpen(false)
                        setNewGalleryImage({ title: '', description: '', imageUrl: '' })
                      }}>Batal</Button>
                      <Button onClick={uploadGalleryImage} disabled={!newGalleryImage.imageUrl || uploadingGallery}>
                        {uploadingGallery ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Menyimpan...
                          </>
                        ) : (
                          'Tambah Foto'
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {gallery.length === 0 ? (
                  <div className="text-center py-12">
                    <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">Belum ada foto di gallery</p>
                    <p className="text-sm text-muted-foreground mt-2">Klik "Tambah Foto" untuk menambahkan</p>
                  </div>
                ) : (
                  <>
                    {/* Reordering indicator */}
                    {isReordering && (
                      <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Menyimpan urutan...
                      </div>
                    )}
                    
                    {/* Instructions */}
                    <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
                      <Move className="w-4 h-4" />
                      Geser foto untuk mengubah urutan
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {gallery.map((img, index) => (
                        <div 
                          key={img.id} 
                          draggable
                          onDragStart={(e) => handleDragStart(e, index)}
                          onDragOver={(e) => handleDragOver(e, index)}
                          onDragLeave={handleDragLeave}
                          onDrop={(e) => handleDrop(e, index)}
                          onDragEnd={handleDragEnd}
                          className={`relative aspect-square rounded-xl overflow-hidden bg-secondary group cursor-grab active:cursor-grabbing transition-all ${
                            draggedIndex === index ? 'opacity-50 scale-95' : ''
                          } ${
                            dragOverIndex === index ? 'ring-4 ring-primary ring-offset-2' : ''
                          }`}
                        >
                          <img src={img.imageUrl} alt={img.title || 'Gallery'} className="w-full h-full object-cover pointer-events-none" />
                          
                          {/* Drag handle indicator */}
                          <div className="absolute top-2 left-2 bg-black/50 rounded-lg p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <GripVertical className="w-4 h-4 text-white" />
                          </div>
                          
                          {/* Order badge */}
                          <div className="absolute top-2 right-2 bg-black/50 rounded-full w-6 h-6 flex items-center justify-center">
                            <span className="text-white text-xs font-bold">{index + 1}</span>
                          </div>
                          
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Button variant="destructive" size="sm" onClick={() => deleteGalleryImage(img.id, img.imageUrl)}>
                              <Trash2 className="w-4 h-4 mr-2" />
                              Hapus
                            </Button>
                          </div>
                          {img.title && (
                            <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-2">
                              <p className="text-white text-sm truncate">{img.title}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Loyalty Tab */}
          <TabsContent value="loyalty">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="w-5 h-5" />
                      Member Loyalty ({loyaltyMembers.length})
                    </CardTitle>
                    <CardDescription>Kelola member loyalty dan poin</CardDescription>
                  </div>
                  {/* Phone Filter */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Cari nomor telepon..."
                      value={loyaltyPhoneFilter}
                      onChange={(e) => setLoyaltyPhoneFilter(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loyaltyMembers.length === 0 ? (
                  <div className="text-center py-12">
                    <Star className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">Belum ada member loyalty</p>
                    <p className="text-sm text-muted-foreground mt-1">Member akan ditambahkan otomatis saat customer melakukan pemesanan</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                    {loyaltyMembers
                      .filter(member => !loyaltyPhoneFilter || member.phone.includes(loyaltyPhoneFilter))
                      .map((member) => {
                        // Level badge colors
                        const levelColors: Record<string, string> = {
                          bronze: 'bg-amber-700 text-white',
                          silver: 'bg-gray-400 text-white',
                          gold: 'bg-yellow-500 text-white',
                          platinum: 'bg-blue-500 text-white',
                        }
                        const levelLabels: Record<string, string> = {
                          bronze: 'Bronze',
                          silver: 'Silver',
                          gold: 'Gold',
                          platinum: 'Platinum',
                        }
                        
                        return (
                          <div key={member.id} className="p-4 bg-secondary/30 rounded-xl border border-border">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                  <User className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                  <p className="font-semibold">{member.name}</p>
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Phone className="w-3 h-3" />
                                    <a href={`tel:${member.phone}`} className="hover:text-primary">{member.phone}</a>
                                    {member.email && (
                                      <>
                                        <span className="mx-1">•</span>
                                        <Mail className="w-3 h-3" />
                                        <span>{member.email}</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="text-right">
                                  <div className="flex items-center gap-2">
                                    <Star className="w-4 h-4 text-amber-500" />
                                    <span className="font-bold text-lg">{member.points}</span>
                                    <span className="text-sm text-muted-foreground">poin</span>
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    Total belanja: {formatPrice(member.totalSpent)}
                                  </p>
                                </div>
                                <Badge className={`${levelColors[member.level] || 'bg-gray-500 text-white'} px-3 py-1`}>
                                  {levelLabels[member.level] || member.level}
                                </Badge>
                              </div>
                            </div>
                            <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                              <span>Bergabung: {formatDate(member.createdAt)}</span>
                            </div>
                          </div>
                        )
                      })}
                    {loyaltyMembers.filter(member => !loyaltyPhoneFilter || member.phone.includes(loyaltyPhoneFilter)).length === 0 && loyaltyPhoneFilter && (
                      <div className="text-center py-8">
                        <Search className="w-8 h-8 mx-auto text-muted-foreground/50 mb-2" />
                        <p className="text-muted-foreground">Tidak ada member dengan nomor telepon tersebut</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Pengaturan Cafe
                </CardTitle>
                <CardDescription>Kelola informasi dan tampilan cafe</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="cafe_name">Nama Cafe</Label>
                      <Input
                        id="cafe_name"
                        value={editSettings.cafe_name}
                        onChange={(e) => setEditSettings({...editSettings, cafe_name: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="cafe_tagline">Tagline</Label>
                      <Input
                        id="cafe_tagline"
                        value={editSettings.cafe_tagline}
                        onChange={(e) => setEditSettings({...editSettings, cafe_tagline: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="cafe_description">Deskripsi</Label>
                      <Textarea
                        id="cafe_description"
                        value={editSettings.cafe_description}
                        onChange={(e) => setEditSettings({...editSettings, cafe_description: e.target.value})}
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="cafe_address">Alamat</Label>
                      <Textarea
                        id="cafe_address"
                        value={editSettings.cafe_address}
                        onChange={(e) => setEditSettings({...editSettings, cafe_address: e.target.value})}
                        rows={2}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label>Logo Cafe</Label>
                      <div className="flex items-center gap-4 mb-3">
                        <div className="w-24 h-24 rounded-xl overflow-hidden bg-secondary border-2 border-dashed border-border flex items-center justify-center">
                          {editSettings.cafe_logo ? (
                            <img src={editSettings.cafe_logo} alt="Logo preview" className="w-full h-full object-contain" />
                          ) : (
                            <ImageIcon className="w-8 h-8 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 space-y-2">
                          <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={async (e) => {
                              const file = e.target.files?.[0]
                              if (file) {
                                // Validate file size (max 5MB)
                                if (file.size > 5 * 1024 * 1024) {
                                  alert('Ukuran file terlalu besar. Maksimal 5MB.')
                                  return
                                }
                                
                                setUploadingLogo(true)
                                try {
                                  const formData = new FormData()
                                  formData.append('file', file)
                                  formData.append('type', 'logo')
                                  
                                  const response = await fetch('/api/upload', {
                                    method: 'POST',
                                    credentials: 'include',
                                    body: formData
                                  })
                                  
                                  if (response.ok) {
                                    const data = await response.json()
                                    setEditSettings({...editSettings, cafe_logo: data.url})
                                  } else {
                                    alert('Gagal mengupload logo')
                                  }
                                } catch (error) {
                                  console.error('Upload error:', error)
                                  alert('Gagal mengupload logo')
                                } finally {
                                  setUploadingLogo(false)
                                }
                              }
                            }}
                            className="hidden"
                          />
                          <Button 
                            type="button"
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploadingLogo}
                          >
                            {uploadingLogo ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Uploading...
                              </>
                            ) : (
                              <>
                                <Upload className="w-4 h-4 mr-2" />
                                Upload Logo
                              </>
                            )}
                          </Button>
                          <p className="text-xs text-muted-foreground">
                            Format: JPG, PNG, GIF, WebP. Maks 5MB
                          </p>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="cafe_logo" className="text-xs text-muted-foreground">Atau masukkan URL logo:</Label>
                        <Input
                          id="cafe_logo"
                          value={editSettings.cafe_logo}
                          onChange={(e) => setEditSettings({...editSettings, cafe_logo: e.target.value})}
                          placeholder="https://example.com/logo.png"
                        />
                        {editSettings.cafe_logo && (
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="secondary" className="text-xs">Logo tersedia</Badge>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => setEditSettings({...editSettings, cafe_logo: ''})}
                            >
                              <X className="w-3 h-3 mr-1" />
                              Hapus
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Hero Image Section */}
                    <div>
                      <Label>Foto Hero Section</Label>
                      <p className="text-xs text-muted-foreground mb-2">Foto latar belakang di halaman utama (rekomendasi: 1920x1080px)</p>
                      <div className="flex items-start gap-4 mb-3">
                        <div className="w-full h-32 rounded-xl overflow-hidden bg-secondary border-2 border-dashed border-border flex items-center justify-center">
                          {editSettings.cafe_hero_image ? (
                            <img src={editSettings.cafe_hero_image} alt="Hero preview" className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon className="w-8 h-8 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <input
                          type="file"
                          accept="image/*"
                          ref={heroInputRef}
                          onChange={async (e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              if (file.size > 5 * 1024 * 1024) {
                                alert('Ukuran file terlalu besar. Maksimal 5MB.')
                                return
                              }
                              
                              setUploadingHero(true)
                              try {
                                const formData = new FormData()
                                formData.append('file', file)
                                formData.append('type', 'hero')
                                
                                const response = await fetch('/api/upload', {
                                  method: 'POST',
                                  credentials: 'include',
                                  body: formData
                                })
                                
                                if (response.ok) {
                                  const data = await response.json()
                                  setEditSettings({...editSettings, cafe_hero_image: data.url})
                                } else {
                                  alert('Gagal mengupload foto hero')
                                }
                              } catch (error) {
                                console.error('Upload error:', error)
                                alert('Gagal mengupload foto hero')
                              } finally {
                                setUploadingHero(false)
                              }
                            }
                          }}
                          className="hidden"
                        />
                        <div className="flex gap-2">
                          <Button 
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => heroInputRef.current?.click()}
                            disabled={uploadingHero}
                          >
                            {uploadingHero ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Uploading...
                              </>
                            ) : (
                              <>
                                <Upload className="w-4 h-4 mr-2" />
                                Upload Foto
                              </>
                            )}
                          </Button>
                          {editSettings.cafe_hero_image && (
                            <Button 
                              type="button"
                              variant="ghost" 
                              size="sm" 
                              onClick={() => setEditSettings({...editSettings, cafe_hero_image: ''})}
                            >
                              <X className="w-3 h-3 mr-1" />
                              Hapus
                            </Button>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="cafe_hero_image" className="text-xs text-muted-foreground">Atau masukkan URL:</Label>
                          <Input
                            id="cafe_hero_image"
                            value={editSettings.cafe_hero_image}
                            onChange={(e) => setEditSettings({...editSettings, cafe_hero_image: e.target.value})}
                            placeholder="https://example.com/hero.jpg"
                          />
                        </div>
                      </div>
                      
                      {/* Hero Image Position Controls */}
                      {editSettings.cafe_hero_image && (
                        <div className="mt-3 p-4 bg-secondary/50 rounded-lg space-y-4">
                          <div>
                            <Label className="text-sm font-medium mb-1 block">Posisi Foto Hero - Desktop</Label>
                            <p className="text-xs text-muted-foreground mb-3">Atur bagian foto yang ditampilkan di layar besar</p>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="text-xs text-muted-foreground">Horizontal</Label>
                                <Select
                                  value={editSettings.cafe_hero_position_x}
                                  onValueChange={(value) => setEditSettings({...editSettings, cafe_hero_position_x: value})}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="left">Kiri</SelectItem>
                                    <SelectItem value="center">Tengah</SelectItem>
                                    <SelectItem value="right">Kanan</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label className="text-xs text-muted-foreground">Vertikal</Label>
                                <Select
                                  value={editSettings.cafe_hero_position_y}
                                  onValueChange={(value) => setEditSettings({...editSettings, cafe_hero_position_y: value})}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="top">Atas</SelectItem>
                                    <SelectItem value="center">Tengah</SelectItem>
                                    <SelectItem value="bottom">Bawah</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </div>
                          
                          <div className="border-t pt-4">
                            <Label className="text-sm font-medium mb-1 block">Posisi Foto Hero - Mobile</Label>
                            <p className="text-xs text-muted-foreground mb-3">Atur bagian foto yang ditampilkan di HP (karena foto terpotong)</p>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="text-xs text-muted-foreground">Horizontal</Label>
                                <Select
                                  value={editSettings.cafe_hero_position_x_mobile}
                                  onValueChange={(value) => setEditSettings({...editSettings, cafe_hero_position_x_mobile: value})}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="left">Kiri</SelectItem>
                                    <SelectItem value="center">Tengah</SelectItem>
                                    <SelectItem value="right">Kanan</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label className="text-xs text-muted-foreground">Vertikal</Label>
                                <Select
                                  value={editSettings.cafe_hero_position_y_mobile}
                                  onValueChange={(value) => setEditSettings({...editSettings, cafe_hero_position_y_mobile: value})}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="top">Atas</SelectItem>
                                    <SelectItem value="center">Tengah</SelectItem>
                                    <SelectItem value="bottom">Bawah</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="cafe_phone">Telepon/WhatsApp</Label>
                      <Input
                        id="cafe_phone"
                        value={editSettings.cafe_phone}
                        onChange={(e) => setEditSettings({...editSettings, cafe_phone: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="cafe_instagram">Instagram</Label>
                      <Input
                        id="cafe_instagram"
                        value={editSettings.cafe_instagram}
                        onChange={(e) => setEditSettings({...editSettings, cafe_instagram: e.target.value})}
                        placeholder="@starvillage.coffee"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="open_hour">Jam Buka</Label>
                        <Input
                          id="open_hour"
                          type="number"
                          value={editSettings.open_hour}
                          onChange={(e) => setEditSettings({...editSettings, open_hour: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="close_hour">Jam Tutup</Label>
                        <Input
                          id="close_hour"
                          type="number"
                          value={editSettings.close_hour}
                          onChange={(e) => setEditSettings({...editSettings, close_hour: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <Separator className="my-6" />
                
                <div className="flex justify-end gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      // Reset to original values
                      setEditSettings({
                        cafe_name: settings.cafe_name?.value || '',
                        cafe_tagline: settings.cafe_tagline?.value || '',
                        cafe_description: settings.cafe_description?.value || '',
                        cafe_address: settings.cafe_address?.value || '',
                        cafe_phone: settings.cafe_phone?.value || '',
                        cafe_instagram: settings.cafe_instagram?.value || '',
                        cafe_logo: settings.cafe_logo?.value || '',
                        cafe_hero_image: settings.cafe_hero_image?.value || '',
                        cafe_hero_position_x: settings.cafe_hero_position_x?.value || 'center',
                        cafe_hero_position_y: settings.cafe_hero_position_y?.value || 'center',
                        cafe_hero_position_x_mobile: settings.cafe_hero_position_x_mobile?.value || 'center',
                        cafe_hero_position_y_mobile: settings.cafe_hero_position_y_mobile?.value || 'center',
                        open_hour: settings.open_hour?.value || '10',
                        close_hour: settings.close_hour?.value || '23',
                        bank_bca_number: settings.bank_bca_number?.value || '',
                        bank_bca_name: settings.bank_bca_name?.value || '',
                        bank_mandiri_number: settings.bank_mandiri_number?.value || '',
                        bank_mandiri_name: settings.bank_mandiri_name?.value || '',
                        qris_image: settings.qris_image?.value || '',
                        staff_delivery_fee: settings.staff_delivery_fee?.value || '5',
                        staff_max_distance: settings.staff_max_distance?.value || '10',
                        staff_free_delivery_min: settings.staff_free_delivery_min?.value || '100',
                        gosend_enabled: settings.gosend_enabled?.value || 'true',
                        whatsapp_admin: settings.whatsapp_admin?.value || '',
                      })
                    }}
                  >
                    Reset
                  </Button>
                  <Button onClick={saveSettings} disabled={savingSettings}>
                    {savingSettings ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Simpan Pengaturan
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Payment Settings */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Pengaturan Pembayaran
                </CardTitle>
                <CardDescription>Kelola metode pembayaran yang tersedia</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* BCA */}
                  <div className="space-y-4 p-4 bg-blue-50 rounded-xl">
                    <h4 className="font-semibold text-blue-800">Bank BCA</h4>
                    <div>
                      <Label htmlFor="bank_bca_number">Nomor Rekening</Label>
                      <Input
                        id="bank_bca_number"
                        value={editSettings.bank_bca_number}
                        onChange={(e) => setEditSettings({...editSettings, bank_bca_number: e.target.value})}
                        placeholder="1234567890"
                      />
                    </div>
                    <div>
                      <Label htmlFor="bank_bca_name">Nama Pemilik</Label>
                      <Input
                        id="bank_bca_name"
                        value={editSettings.bank_bca_name}
                        onChange={(e) => setEditSettings({...editSettings, bank_bca_name: e.target.value})}
                        placeholder="Star Village Coffee"
                      />
                    </div>
                  </div>
                  
                  {/* Mandiri */}
                  <div className="space-y-4 p-4 bg-yellow-50 rounded-xl">
                    <h4 className="font-semibold text-yellow-800">Bank Mandiri</h4>
                    <div>
                      <Label htmlFor="bank_mandiri_number">Nomor Rekening</Label>
                      <Input
                        id="bank_mandiri_number"
                        value={editSettings.bank_mandiri_number}
                        onChange={(e) => setEditSettings({...editSettings, bank_mandiri_number: e.target.value})}
                        placeholder="1234567890"
                      />
                    </div>
                    <div>
                      <Label htmlFor="bank_mandiri_name">Nama Pemilik</Label>
                      <Input
                        id="bank_mandiri_name"
                        value={editSettings.bank_mandiri_name}
                        onChange={(e) => setEditSettings({...editSettings, bank_mandiri_name: e.target.value})}
                        placeholder="Star Village Coffee"
                      />
                    </div>
                  </div>
                </div>
                
                {/* QRIS */}
                <div className="mt-6 p-4 bg-purple-50 rounded-xl">
                  <h4 className="font-semibold text-purple-800 mb-4">QRIS</h4>
                  <div className="flex items-start gap-4">
                    <div className="w-32 h-32 rounded-xl overflow-hidden bg-white border-2 border-dashed border-purple-300 flex items-center justify-center">
                      {editSettings.qris_image ? (
                        <img src={editSettings.qris_image} alt="QRIS Preview" className="w-full h-full object-contain" />
                      ) : (
                        <QrCode className="w-10 h-10 text-purple-400" />
                      )}
                    </div>
                    <div className="flex-1 space-y-3">
                      <input
                        type="file"
                        accept="image/*"
                        ref={qrisInputRef}
                        onChange={async (e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            if (file.size > 5 * 1024 * 1024) {
                              alert('Ukuran file terlalu besar. Maksimal 5MB.')
                              return
                            }
                            
                            setUploadingQris(true)
                            try {
                              const formData = new FormData()
                              formData.append('file', file)
                              formData.append('type', 'qris')
                              
                              const response = await fetch('/api/upload', {
                                method: 'POST',
                                credentials: 'include',
                                body: formData
                              })
                              
                              if (response.ok) {
                                const data = await response.json()
                                setEditSettings({...editSettings, qris_image: data.url})
                              } else {
                                alert('Gagal mengupload QRIS')
                              }
                            } catch (error) {
                              console.error('Upload error:', error)
                              alert('Gagal mengupload QRIS')
                            } finally {
                              setUploadingQris(false)
                            }
                          }
                        }}
                        className="hidden"
                      />
                      <Button 
                        type="button"
                        variant="outline"
                        onClick={() => qrisInputRef.current?.click()}
                        disabled={uploadingQris}
                        className="bg-white"
                      >
                        {uploadingQris ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 mr-2" />
                            Upload QRIS
                          </>
                        )}
                      </Button>
                      <p className="text-xs text-purple-600">
                        Format: JPG, PNG. Maks 5MB
                      </p>
                      {editSettings.qris_image && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setEditSettings({...editSettings, qris_image: ''})}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="w-3 h-3 mr-1" />
                          Hapus QRIS
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Delivery Zones */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  Zona Delivery
                </CardTitle>
                <CardDescription>Kelola zona dan biaya pengiriman</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Zona delivery berdasarkan jarak dari cafe. Customer di luar jangkauan akan diarahkan ke GoSend.
                  </p>
                  
                  {/* Zone List */}
                  <div className="space-y-3">
                    {deliveryZones.map((zone, index) => (
                      <div key={zone.id || index} className="p-4 border rounded-lg bg-gray-50">
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 items-end">
                          <div>
                            <Label className="text-xs">Nama Zona</Label>
                            <Input
                              value={zone.name}
                              onChange={(e) => {
                                const newZones = [...deliveryZones]
                                newZones[index].name = e.target.value
                                setDeliveryZones(newZones)
                              }}
                              placeholder="Zona 1"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Jarak (km)</Label>
                            <div className="flex gap-1">
                              <Input
                                type="number"
                                step="0.5"
                                value={zone.minDistance}
                                onChange={(e) => {
                                  const newZones = [...deliveryZones]
                                  newZones[index].minDistance = parseFloat(e.target.value) || 0
                                  setDeliveryZones(newZones)
                                }}
                                placeholder="0"
                                className="w-20"
                              />
                              <span className="flex items-center">-</span>
                              <Input
                                type="number"
                                step="0.5"
                                value={zone.maxDistance}
                                onChange={(e) => {
                                  const newZones = [...deliveryZones]
                                  newZones[index].maxDistance = parseFloat(e.target.value) || 0
                                  setDeliveryZones(newZones)
                                }}
                                placeholder="2"
                                className="w-20"
                              />
                            </div>
                          </div>
                          <div>
                            <Label className="text-xs">Ongkir (Rp ribuan)</Label>
                            <Input
                              type="number"
                              value={zone.fee}
                              onChange={(e) => {
                                const newZones = [...deliveryZones]
                                newZones[index].fee = parseInt(e.target.value) || 0
                                setDeliveryZones(newZones)
                              }}
                              placeholder="5"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Min. Order (Rp ribuan)</Label>
                            <Input
                              type="number"
                              value={zone.minOrder}
                              onChange={(e) => {
                                const newZones = [...deliveryZones]
                                newZones[index].minOrder = parseInt(e.target.value) || 0
                                setDeliveryZones(newZones)
                              }}
                              placeholder="20"
                            />
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setDeliveryZones(deliveryZones.filter((_, i) => i !== index))
                            }}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Add Zone Button */}
                  <Button
                    variant="outline"
                    onClick={() => {
                      setDeliveryZones([
                        ...deliveryZones,
                        {
                          id: '',
                          name: `Zona ${deliveryZones.length + 1}`,
                          minDistance: deliveryZones.length > 0 ? deliveryZones[deliveryZones.length - 1].maxDistance : 0,
                          maxDistance: deliveryZones.length > 0 ? deliveryZones[deliveryZones.length - 1].maxDistance + 2 : 2,
                          fee: 5,
                          minOrder: 20
                        }
                      ])
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah Zona
                  </Button>
                  
                  {/* Save Button */}
                  <div className="flex justify-end pt-4 border-t">
                    <Button
                      onClick={saveDeliveryZones}
                      disabled={savingZones}
                      className="bg-amber-600 hover:bg-amber-700"
                    >
                      {savingZones ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      Simpan Zona
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Notification Settings */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Pengaturan Notifikasi
                </CardTitle>
                <CardDescription>Nomor WhatsApp untuk notifikasi pesanan</CardDescription>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="whatsapp_admin">Nomor WhatsApp Admin</Label>
                  <Input
                    id="whatsapp_admin"
                    value={editSettings.whatsapp_admin}
                    onChange={(e) => setEditSettings({...editSettings, whatsapp_admin: e.target.value})}
                    placeholder="628123456789"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Format: kode negara + nomor (tanpa +)</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
