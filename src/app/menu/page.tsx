'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { 
  Coffee, Sparkles, Flame, Wine, Milk, Leaf, 
  GlassWater, Cookie, Utensils, Search, Star, 
  Plus, Minus, ShoppingCart, ArrowLeft, MapPin,
  Clock, Phone, Instagram, Bot, Send, Loader2, X,
  Moon, Sun, Heart, Zap, MessageCircle, Check
} from 'lucide-react'
import Link from 'next/link'

// Types
interface ItemVariant {
  id: string
  name: string
  price: number
}

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
  isAvailable: boolean
  variants: ItemVariant[]
  category: { id: string; name: string; slug: string }
}

interface MenuCategory {
  id: string
  name: string
  slug: string
  icon: string | null
  items: MenuItem[]
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

const formatPrice = (price: number) => `Rp ${(price * 1000).toLocaleString('id-ID')}`

const iconMap: Record<string, React.ReactNode> = {
  'coffee': <Coffee className="w-5 h-5" />,
  'sparkles': <Sparkles className="w-5 h-5" />,
  'flame': <Flame className="w-5 h-5" />,
  'wine': <Wine className="w-5 h-5" />,
  'milk': <Milk className="w-5 h-5" />,
  'leaf': <Leaf className="w-5 h-5" />,
  'glass-water': <GlassWater className="w-5 h-5" />,
  'cookie': <Cookie className="w-5 h-5" />,
  'utensils': <Utensils className="w-5 h-5" />,
}

// Cart Hook
function useCart() {
  const [items, setItems] = useState<{
    id: string
    itemId: string
    itemName: string
    variantId: string
    variantName: string
    price: number
    quantity: number
  }[]>(() => {
    // Initialize from localStorage on first render
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('cart')
      if (savedCart) {
        return JSON.parse(savedCart)
      }
    }
    return []
  })
  const [isOpen, setIsOpen] = useState(false)
  const [toast, setToast] = useState<{ show: boolean; message: string }>({ show: false, message: '' })

  // Save cart to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items))
  }, [items])

  const showToast = (message: string) => {
    setToast({ show: true, message })
    setTimeout(() => setToast({ show: false, message: '' }), 2000)
  }

  const addItem = (item: MenuItem, variant: ItemVariant) => {
    setItems(prev => {
      const existing = prev.find(i => i.itemId === item.id && i.variantId === variant.id)
      if (existing) {
        showToast(`${item.name} ditambahkan ke keranjang`)
        return prev.map(i => 
          i.id === existing.id 
            ? { ...i, quantity: i.quantity + 1 }
            : i
        )
      }
      showToast(`${item.name} masuk keranjang!`)
      return [...prev, {
        id: `${item.id}-${variant.id}-${Date.now()}`,
        itemId: item.id,
        itemName: item.name,
        variantId: variant.id,
        variantName: variant.name,
        price: variant.price,
        quantity: 1
      }]
    })
  }

  const removeItem = (id: string) => setItems(prev => prev.filter(i => i.id !== id))
  
  const updateQuantity = (id: string, delta: number) => {
    setItems(prev => prev.map(i => {
      if (i.id === id) {
        const newQty = i.quantity + delta
        return { ...i, quantity: newQty }  // Allow quantity to go to 0 or negative
      }
      return i
    }).filter(i => i.quantity > 0))  // Then filter out items with quantity <= 0
  }

  const clearCart = () => setItems([])
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0)

  return { items, isOpen, setIsOpen, addItem, removeItem, updateQuantity, clearCart, total, itemCount, toast }
}

// Header
function Header({ settings, cart }: { settings: CafeSettings; cart: ReturnType<typeof useCart> }) {
  return (
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

          <div className="flex items-center gap-3">
            <Sheet open={cart.isOpen} onOpenChange={cart.setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="relative gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  {cart.itemCount > 0 && (
                    <span className="absolute -top-2 -right-2 w-5 h-5 bg-amber-600 text-white text-xs rounded-full flex items-center justify-center">
                      {cart.itemCount}
                    </span>
                  )}
                  <span className="hidden sm:inline">Keranjang</span>
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-md">
                <SheetHeader>
                  <SheetTitle>Keranjang Belanja</SheetTitle>
                </SheetHeader>
                <div className="mt-6 flex-1 overflow-y-auto">
                  {cart.items.length === 0 ? (
                    <div className="text-center py-12">
                      <ShoppingCart className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
                      <p className="text-muted-foreground">Keranjang kosong</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {cart.items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-4 bg-secondary/50 rounded-xl">
                          <div className="flex-1">
                            <p className="font-medium">{item.itemName}</p>
                            <p className="text-sm text-muted-foreground">{item.variantName}</p>
                            <p className="font-bold text-amber-700 mt-1">{formatPrice(item.price)}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button size="icon" variant="outline" className="w-8 h-8" onClick={() => cart.updateQuantity(item.id, -1)}>
                              <Minus className="w-4 h-4" />
                            </Button>
                            <span className="w-8 text-center font-medium">{item.quantity}</span>
                            <Button size="icon" variant="outline" className="w-8 h-8" onClick={() => cart.updateQuantity(item.id, 1)}>
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {cart.items.length > 0 && (
                  <div className="border-t pt-4 mt-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-lg">Total</span>
                      <span className="text-2xl font-bold text-amber-700">{formatPrice(cart.total)}</span>
                    </div>
                    <Link href="/checkout" className="block">
                      <Button 
                        className="w-full bg-amber-600 hover:bg-amber-700 py-6 text-lg"
                      >
                        <ShoppingCart className="w-5 h-5 mr-2" />
                        Checkout
                      </Button>
                    </Link>
                  </div>
                )}
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}

// Menu Item Card
function MenuItemCard({ item, onAddToCart }: { item: MenuItem; onAddToCart: (item: MenuItem, variant: ItemVariant) => void }) {
  const [showVariants, setShowVariants] = useState(false)
  const isOutOfStock = item.stock === 0

  return (
    <Card className={`group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 ${isOutOfStock ? 'opacity-60' : ''}`}>
      {item.image && (
        <div className="relative h-48 overflow-hidden">
          <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute top-3 right-3 flex flex-col gap-1">
            {item.isNew && <Badge className="bg-green-500 text-white text-xs">Baru</Badge>}
            {item.isPopular && <Badge className="bg-amber-500 text-white text-xs">Popular</Badge>}
            {item.isPromo && <Badge className="bg-red-500 text-white text-xs">Promo</Badge>}
          </div>
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Badge variant="destructive" className="text-lg px-4 py-2">Habis</Badge>
            </div>
          )}
        </div>
      )}
      
      <CardContent className="p-5">
        <h4 className="font-bold text-lg mb-1">{item.name}</h4>
        
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
            <span className="text-sm font-medium">{item.rating.toFixed(1)}</span>
          </div>
          <span className="text-xs text-muted-foreground">({item.totalRatings})</span>
          {!item.image && isOutOfStock && (
            <Badge variant="destructive" className="ml-auto text-xs">Habis</Badge>
          )}
        </div>

        {item.variants.length === 1 ? (
          <div className="flex items-center justify-between">
            <span className="font-bold text-xl text-amber-700">{formatPrice(item.variants[0].price)}</span>
            <Button 
              onClick={() => onAddToCart(item, item.variants[0])} 
              disabled={isOutOfStock}
              className="bg-amber-600 hover:bg-amber-700"
            >
              <Plus className="w-5 h-5 mr-1" />
              Tambah
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {item.variants.slice(0, 2).map((v) => (
                <Badge key={v.id} variant="secondary" className="text-xs">
                  {v.name}: {formatPrice(v.price)}
                </Badge>
              ))}
              {item.variants.length > 2 && (
                <Badge variant="outline" className="text-xs">+{item.variants.length - 2}</Badge>
              )}
            </div>
            <Sheet open={showVariants} onOpenChange={setShowVariants}>
              <SheetTrigger asChild>
                <Button disabled={isOutOfStock} className="bg-amber-600 hover:bg-amber-700">
                  <Plus className="w-5 h-5 mr-1" />
                  Tambah
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-md">
                <SheetHeader>
                  <SheetTitle>{item.name}</SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-4">
                  {item.variants.map((variant) => (
                    <div key={variant.id} className="flex items-center justify-between p-4 bg-secondary/50 rounded-xl">
                      <div>
                        <p className="font-medium">{variant.name}</p>
                        <p className="font-bold text-amber-700">{formatPrice(variant.price)}</p>
                      </div>
                      <Button onClick={() => { onAddToCart(item, variant); setShowVariants(false) }}>
                        <Plus className="w-5 h-5" />
                      </Button>
                    </div>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// AI Menu Assistant Component
function AIMenuAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const quickActions = [
    { icon: <Moon className="w-4 h-4" />, label: 'Lagi Ngantuk', mood: 'ngantuk butuh kopi yang bisa bikin melek' },
    { icon: <Zap className="w-4 h-4" />, label: 'Butuh Energi', mood: 'butuh energi dan semangat' },
    { icon: <Heart className="w-4 h-4" />, label: 'Pengen Creamy', preference: 'creamy dan lembut' },
    { icon: <Sun className="w-4 h-4" />, label: 'Yang Segar', preference: 'segar dan dingin' },
  ]

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || loading) return

    setMessages(prev => [...prev, { role: 'user', content: messageText }])
    setInput('')
    setLoading(true)

    try {
      const response = await fetch('/api/ai-menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageText })
      })

      const data = await response.json()
      
      if (data.success) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.response }])
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: 'Maaf, saya tidak bisa memberikan rekomendasi sekarang. Coba lagi ya!' }])
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Terjadi kesalahan. Silakan coba lagi.' }])
    } finally {
      setLoading(false)
    }
  }

  const handleQuickAction = (mood?: string, preference?: string) => {
    const message = mood ? `Saya lagi ${mood}` : `Saya pengen yang ${preference}`
    sendMessage(message)
  }

  return (
    <>
      {/* Floating AI Button - positioned higher on mobile to avoid cart button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 sm:bottom-6 right-4 sm:right-6 z-40 flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 group animate-bounce-slow"
      >
        <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
        <span className="font-semibold text-sm whitespace-nowrap">Bingung Pilih? 🤔</span>
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
      </button>

      {/* AI Chat Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsOpen(false)} />
          
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <Bot className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold">AI Menu Assistant</h3>
                    <p className="text-sm opacity-80">Bantu pilih menu yang cocok</p>
                  </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[200px]">
              {messages.length === 0 ? (
                <div className="text-center py-6">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 flex items-center justify-center">
                    <Bot className="w-8 h-8 text-purple-600" />
                  </div>
                  <p className="font-semibold text-lg mb-2">Halo! Saya AI Menu Assistant 👋</p>
                  <p className="text-muted-foreground text-sm mb-4">Ceritakan suasana hatimu, dan saya akan rekomendasikan menu yang pas!</p>
                  
                  {/* Quick Actions */}
                  <div className="grid grid-cols-2 gap-2">
                    {quickActions.map((action, index) => (
                      <button
                        key={index}
                        onClick={() => handleQuickAction(action.mood, action.preference)}
                        className="flex items-center gap-2 p-3 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors text-left"
                      >
                        <span className="text-purple-600">{action.icon}</span>
                        <span className="text-sm font-medium">{action.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-br-md'
                          : 'bg-secondary rounded-bl-md'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))
              )}
              
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-secondary rounded-2xl rounded-bl-md px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                      <span className="text-sm text-muted-foreground">Sedang berpikir...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
                  placeholder="Ketik suasana hatumu..."
                  className="flex-1 px-4 py-3 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  onClick={() => sendMessage(input)}
                  disabled={loading || !input.trim()}
                  className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white flex items-center justify-center disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// Main Menu Page
function MenuPage() {
  const searchParams = useSearchParams()
  const categoryParam = searchParams.get('category')
  
  const [categories, setCategories] = useState<MenuCategory[]>([])
  const [settings, setSettings] = useState<CafeSettings>(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('')
  
  const cart = useCart()

  useEffect(() => {
    async function fetchData() {
      try {
        const [menuRes, settingsRes] = await Promise.all([
          fetch('/api/menu'),
          fetch('/api/settings'),
        ])

        if (menuRes.ok) {
          const data = await menuRes.json()
          setCategories(data.categories || [])
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

  useEffect(() => {
    if (categoryParam) {
      setActiveCategory(categoryParam)
    }
  }, [categoryParam])

  // Category mapping
  const categoryMapping: Record<string, string[]> = {
    'coffee': ['classic-coffee', 'signature-coffee', 'manual-brew', 'coffee-mocktail', 'kopi-susu'],
    'non-coffee': ['milky-base', 'mocktail', 'tea-selection', 'juice', 'my-bottle'],
    'food': ['food', 'mie', 'burger'],
    'snacks': ['snack', 'roti-bakar', 'toast']
  }

  // Filter items
  const allItems = categories.flatMap(cat => cat.items.map(item => ({ ...item, category: cat })))
  
  const filteredItems = allItems.filter(item => {
    const matchesSearch = !searchQuery || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.name.toLowerCase().includes(searchQuery.toLowerCase())
    
    if (!matchesSearch) return false
    
    if (!activeCategory) return true
    
    const mappedSlugs = categoryMapping[activeCategory] || [activeCategory]
    return mappedSlugs.includes(item.category.slug)
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-amber-600 animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Memuat menu...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      <Header settings={settings} cart={cart} />
      
      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Menu Kami</h1>
          <p className="text-muted-foreground">Pilih menu favorit Anda</p>
        </div>

        {/* Cara Order Section - Enhanced Design */}
        <div className="mb-10">
          {/* Main Guide Card */}
          <Card className="border-0 shadow-xl overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
            <CardContent className="p-0">
              {/* Header with gradient */}
              <div className="bg-gradient-to-r from-amber-600 to-orange-600 px-6 py-4 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <Utensils className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Cara Memesan di Star Village</h2>
                    <p className="text-white/80 text-sm">Mudah, cepat, dan praktis!</p>
                  </div>
                </div>
              </div>
              
              {/* Steps */}
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Step 1 */}
                  <div className="relative group">
                    <div className="bg-white rounded-2xl p-5 shadow-md hover:shadow-xl transition-all duration-300 border border-amber-100 h-full">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                          1
                        </div>
                        <div>
                          <p className="font-bold text-gray-800">Pilih Menu</p>
                          <p className="text-xs text-muted-foreground">Browse & cari</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        Jelajahi menu favorit Anda. Gunakan <span className="font-medium text-amber-700">pencarian</span> atau filter kategori untuk menemukan menu yang diinginkan.
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
                          <p className="font-bold text-gray-800">Kustomisasi</p>
                          <p className="text-xs text-muted-foreground">Varian & jumlah</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        Pilih <span className="font-medium text-orange-700">ukuran, varian</span> yang diinginkan, atur jumlah, lalu tambahkan ke keranjang belanja.
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
                          <p className="font-bold text-gray-800">Checkout</p>
                          <p className="text-xs text-muted-foreground">Isi data & bayar</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        Lengkapi data pengambilan, pilih <span className="font-medium text-purple-700">metode pembayaran</span>, dan gunakan kode promo jika ada.
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
                          <p className="font-bold text-gray-800">Selesai!</p>
                          <p className="text-xs text-muted-foreground">Ambil order</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        Terima <span className="font-medium text-green-700">notifikasi WhatsApp</span>, tunggu pesanan diproses, dan ambil di cafe atau terima delivery!
                      </p>
                      <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-200 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-300" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* AI Assistant Promo Card */}
          <Card className="mt-4 border-0 shadow-lg overflow-hidden bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700">
            <CardContent className="p-0">
              <div className="flex flex-col sm:flex-row items-center gap-4 p-5">
                <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                    <Sparkles className="w-4 h-4 text-yellow-300" />
                    <span className="text-white/80 text-xs font-medium uppercase tracking-wider">Fitur Baru</span>
                    <Sparkles className="w-4 h-4 text-yellow-300" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">AI Menu Assistant</h3>
                  <p className="text-white/90 text-sm">
                    Bingung pilih menu? Ceritakan suasana hatimu dan AI kami akan rekomendasikan menu yang cocok! 
                    Klik tombol <span className="font-medium text-yellow-300">"Bingung Pilih? 🤔"</span> di bawah kanan layar.
                  </p>
                </div>
                <div className="hidden md:block flex-shrink-0">
                  <div className="w-32 h-20 bg-white/10 rounded-xl flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl mb-1">🤖</div>
                      <p className="text-xs text-white/80">AI Powered</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Cari menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 py-6 text-lg rounded-2xl shadow-lg"
            />
          </div>
        </div>

        {/* Category Tabs - Sticky */}
        <div className="sticky top-[60px] sm:top-[70px] z-30 -mx-4 px-4 py-3 bg-gradient-to-b from-amber-50 via-amber-50 to-transparent mb-4">
          <div className="flex gap-1 sm:gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <button
              onClick={() => setActiveCategory('')}
              className={`flex-shrink-0 px-3 sm:px-6 py-2 sm:py-3 rounded-xl text-sm sm:text-base font-medium transition-all whitespace-nowrap ${
                activeCategory === '' 
                  ? 'bg-amber-600 text-white shadow-md' 
                  : 'bg-white hover:bg-amber-100 shadow'
              }`}
            >
              <Utensils className="w-4 h-4 sm:w-5 sm:h-5 inline mr-1 sm:mr-2" />
              Semua
            </button>
            <button
              onClick={() => setActiveCategory('coffee')}
              className={`flex-shrink-0 px-3 sm:px-6 py-2 sm:py-3 rounded-xl text-sm sm:text-base font-medium transition-all whitespace-nowrap ${
                activeCategory === 'coffee' 
                  ? 'bg-amber-600 text-white shadow-md' 
                  : 'bg-white hover:bg-amber-100 shadow'
              }`}
            >
              <Coffee className="w-4 h-4 sm:w-5 sm:h-5 inline mr-1 sm:mr-2" />
              Coffee
            </button>
            <button
              onClick={() => setActiveCategory('non-coffee')}
              className={`flex-shrink-0 px-3 sm:px-6 py-2 sm:py-3 rounded-xl text-sm sm:text-base font-medium transition-all whitespace-nowrap ${
                activeCategory === 'non-coffee' 
                  ? 'bg-pink-600 text-white shadow-md' 
                  : 'bg-white hover:bg-pink-100 shadow'
              }`}
            >
              <GlassWater className="w-4 h-4 sm:w-5 sm:h-5 inline mr-1 sm:mr-2" />
              Non-Coffee
            </button>
            <button
              onClick={() => setActiveCategory('food')}
              className={`flex-shrink-0 px-3 sm:px-6 py-2 sm:py-3 rounded-xl text-sm sm:text-base font-medium transition-all whitespace-nowrap ${
                activeCategory === 'food' 
                  ? 'bg-orange-600 text-white shadow-md' 
                  : 'bg-white hover:bg-orange-100 shadow'
              }`}
            >
              <Utensils className="w-4 h-4 sm:w-5 sm:h-5 inline mr-1 sm:mr-2" />
              Food
            </button>
            <button
              onClick={() => setActiveCategory('snacks')}
              className={`flex-shrink-0 px-3 sm:px-6 py-2 sm:py-3 rounded-xl text-sm sm:text-base font-medium transition-all whitespace-nowrap ${
                activeCategory === 'snacks' 
                  ? 'bg-green-600 text-white shadow-md' 
                  : 'bg-white hover:bg-green-100 shadow'
              }`}
            >
              <Cookie className="w-4 h-4 sm:w-5 sm:h-5 inline mr-1 sm:mr-2" />
              Snacks
            </button>
          </div>
        </div>

        {/* Items Grid */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-20">
            <Search className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-xl font-medium text-muted-foreground">Tidak ada menu ditemukan</p>
            <p className="text-muted-foreground mt-2">Coba kata kunci lain</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <MenuItemCard key={item.id} item={item} onAddToCart={cart.addItem} />
            ))}
          </div>
        )}
      </main>

      {/* Floating Cart Button (Mobile) */}
      {cart.itemCount > 0 && (
        <div className="fixed bottom-4 left-4 right-4 sm:hidden z-40">
          <Button 
            className="w-full bg-amber-600 hover:bg-amber-700 py-6 shadow-xl gap-3"
            onClick={() => cart.setIsOpen(true)}
          >
            <ShoppingCart className="w-5 h-5" />
            <span className="font-bold">{cart.itemCount} Item</span>
            <span className="ml-auto font-bold">{formatPrice(cart.total)}</span>
          </Button>
        </div>
      )}

      {/* Toast Notification */}
      {cart.toast.show && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-bounce">
          <div className="bg-green-600 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2">
            <Check className="w-5 h-5" />
            <span className="font-medium">{cart.toast.message}</span>
          </div>
        </div>
      )}

      {/* AI Menu Assistant */}
      <AIMenuAssistant />
    </div>
  )
}

export default function Page() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-amber-600 animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Memuat menu...</p>
        </div>
      </div>
    }>
      <MenuPage />
    </Suspense>
  )
}
