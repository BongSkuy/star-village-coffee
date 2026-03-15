'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'

/**
 * Cart item interface
 */
export interface CartItem {
  id: string
  itemId: string
  itemName: string
  variantId: string
  variantName: string
  price: number // Price in thousands (K)
  quantity: number
  notes?: string
}

/**
 * Cart item input for adding items
 */
export interface CartItemInput {
  itemId: string
  itemName: string
  variantId: string
  variantName: string
  price: number
  notes?: string
}

const CART_STORAGE_KEY = 'cart'

/**
 * Save cart to localStorage
 */
function saveCartToStorage(items: CartItem[]): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
  } catch (error) {
    console.error('Error saving cart to localStorage:', error)
  }
}

/**
 * Generate unique cart item ID
 */
function generateCartItemId(itemId: string, variantId: string): string {
  return `${itemId}-${variantId}`
}

/**
 * Hook for managing shopping cart
 * Persists cart to localStorage
 * 
 * @example
 * ```tsx
 * const cart = useCart()
 * 
 * // Add item
 * cart.addItem({
 *   itemId: 'menu-1',
 *   itemName: 'Espresso',
 *   variantId: 'hot',
 *   variantName: 'HOT',
 *   price: 18
 * })
 * 
 * // Get total
 * console.log(cart.total) // Total price in thousands
 * console.log(cart.itemCount) // Total quantity
 * ```
 */
export function useCart() {
  // Use lazy initializer to load from localStorage on first render
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(CART_STORAGE_KEY)
        if (saved) {
          return JSON.parse(saved)
        }
      } catch (error) {
        console.error('Error loading cart from localStorage:', error)
      }
    }
    return []
  })
  
  const [toast, setToast] = useState<{ show: boolean; message: string }>({
    show: false,
    message: '',
  })
  
  // Track if this is the first render to avoid saving on initial load
  const isFirstRender = useRef(true)

  // Save cart to localStorage whenever items change (except on first render)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    saveCartToStorage(items)
  }, [items])

  /**
   * Show toast notification
   */
  const showToast = useCallback((message: string) => {
    setToast({ show: true, message })
    const timer = setTimeout(() => setToast({ show: false, message: '' }), 2000)
    return () => clearTimeout(timer)
  }, [])

  /**
   * Add item to cart
   * If item with same itemId and variantId exists, increment quantity
   */
  const addItem = useCallback(
    (input: CartItemInput) => {
      setItems((prev) => {
        const existingId = generateCartItemId(input.itemId, input.variantId)
        const existing = prev.find((i) => i.id === existingId)

        if (existing) {
          showToast(`${input.itemName} ditambahkan ke keranjang`)
          return prev.map((i) =>
            i.id === existingId ? { ...i, quantity: i.quantity + 1 } : i
          )
        }

        showToast(`${input.itemName} masuk keranjang!`)
        return [
          ...prev,
          {
            id: existingId,
            itemId: input.itemId,
            itemName: input.itemName,
            variantId: input.variantId,
            variantName: input.variantName,
            price: input.price,
            quantity: 1,
            notes: input.notes,
          },
        ]
      })
    },
    [showToast]
  )

  /**
   * Remove item from cart
   */
  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }, [])

  /**
   * Update item quantity
   * @param delta - Amount to change (positive or negative)
   */
  const updateQuantity = useCallback((id: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((i) => {
          if (i.id === id) {
            const newQty = i.quantity + delta
            return { ...i, quantity: newQty }
          }
          return i
        })
        .filter((i) => i.quantity > 0)
    )
  }, [])

  /**
   * Set exact quantity for an item
   */
  const setQuantity = useCallback((id: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.id !== id))
    } else {
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, quantity } : i))
      )
    }
  }, [])

  /**
   * Update item notes
   */
  const updateNotes = useCallback((id: string, notes: string) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, notes } : i))
    )
  }, [])

  /**
   * Clear all items from cart
   */
  const clear = useCallback(() => {
    setItems([])
  }, [])

  /**
   * Get item by ID
   */
  const getItem = useCallback(
    (id: string): CartItem | undefined => {
      return items.find((i) => i.id === id)
    },
    [items]
  )

  /**
   * Check if item exists in cart
   */
  const hasItem = useCallback(
    (itemId: string, variantId: string): boolean => {
      const id = generateCartItemId(itemId, variantId)
      return items.some((i) => i.id === id)
    },
    [items]
  )

  /**
   * Get quantity of specific item
   */
  const getItemQuantity = useCallback(
    (itemId: string, variantId: string): number => {
      const id = generateCartItemId(itemId, variantId)
      const item = items.find((i) => i.id === id)
      return item?.quantity ?? 0
    },
    [items]
  )

  // Computed values
  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  )

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  )

  const isEmpty = items.length === 0

  return {
    // State
    items,
    isEmpty,
    total,
    itemCount,
    toast,
    
    // Actions
    addItem,
    removeItem,
    updateQuantity,
    setQuantity,
    updateNotes,
    clear,
    
    // Getters
    getItem,
    hasItem,
    getItemQuantity,
  }
}

/**
 * Simple cart hook without toast notifications
 * Useful for admin contexts or when you don't need UI feedback
 */
export function useCartSimple() {
  // Use lazy initializer to load from localStorage on first render
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(CART_STORAGE_KEY)
        if (saved) {
          return JSON.parse(saved)
        }
      } catch (error) {
        console.error('Error loading cart from localStorage:', error)
      }
    }
    return []
  })
  
  // Track if this is the first render to avoid saving on initial load
  const isFirstRender = useRef(true)

  // Save cart to localStorage whenever items change (except on first render)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    saveCartToStorage(items)
  }, [items])

  const addItem = useCallback((input: CartItemInput) => {
    setItems((prev) => {
      const existingId = generateCartItemId(input.itemId, input.variantId)
      const existing = prev.find((i) => i.id === existingId)

      if (existing) {
        return prev.map((i) =>
          i.id === existingId ? { ...i, quantity: i.quantity + 1 } : i
        )
      }

      return [
        ...prev,
        {
          id: existingId,
          itemId: input.itemId,
          itemName: input.itemName,
          variantId: input.variantId,
          variantName: input.variantName,
          price: input.price,
          quantity: 1,
          notes: input.notes,
        },
      ]
    })
  }, [])

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }, [])

  const updateQuantity = useCallback((id: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((i) => {
          if (i.id === id) {
            return { ...i, quantity: i.quantity + delta }
          }
          return i
        })
        .filter((i) => i.quantity > 0)
    )
  }, [])

  const clear = useCallback(() => {
    setItems([])
  }, [])

  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  )

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  )

  return {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clear,
    total,
    itemCount,
    isEmpty: items.length === 0,
  }
}
