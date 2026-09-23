'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type CartItem = {
  /** একই পণ্যের ভিন্ন সাইজ/রঙ আলাদা লাইন হিসেবে থাকে */
  key: string
  productId: string
  slug: string
  name: string
  image: string
  price: number
  comparePrice: number | null
  quantity: number
  size: string | null
  color: string | null
  stock: number
}

export type NewCartItem = Omit<CartItem, 'key'>

type CartState = {
  items: CartItem[]
  isOpen: boolean
  hydrated: boolean
  add: (item: NewCartItem) => void
  remove: (key: string) => void
  setQuantity: (key: string, quantity: number) => void
  increment: (key: string) => void
  decrement: (key: string) => void
  clear: () => void
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
}

const makeKey = (productId: string, size: string | null, color: string | null) =>
  `${productId}::${size ?? '-'}::${color ?? '-'}`

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      hydrated: false,

      add: (item) =>
        set((state) => {
          const key = makeKey(item.productId, item.size, item.color)
          const existing = state.items.find((i) => i.key === key)
          if (existing) {
            const quantity = Math.min(existing.quantity + item.quantity, item.stock || 99)
            return {
              items: state.items.map((i) => (i.key === key ? { ...i, quantity } : i)),
              isOpen: true,
            }
          }
          return { items: [...state.items, { ...item, key }], isOpen: true }
        }),

      remove: (key) =>
        set((state) => ({ items: state.items.filter((i) => i.key !== key) })),

      setQuantity: (key, quantity) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.key === key
              ? { ...i, quantity: Math.max(1, Math.min(quantity, i.stock || 99)) }
              : i
          ),
        })),

      increment: (key) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.key === key
              ? { ...i, quantity: Math.min(i.quantity + 1, i.stock || 99) }
              : i
          ),
        })),

      decrement: (key) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.key === key ? { ...i, quantity: Math.max(1, i.quantity - 1) } : i
          ),
        })),

      clear: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),
    }),
    {
      name: 'sharighor-cart',
      partialize: (state) => ({ items: state.items }),
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true
      },
    }
  )
)

export const cartCount = (items: CartItem[]) =>
  items.reduce((sum, i) => sum + i.quantity, 0)

export const cartSubtotal = (items: CartItem[]) =>
  items.reduce((sum, i) => sum + i.price * i.quantity, 0)

export const cartSavings = (items: CartItem[]) =>
  items.reduce(
    (sum, i) => sum + (i.comparePrice ? (i.comparePrice - i.price) * i.quantity : 0),
    0
  )
