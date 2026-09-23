'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type WishlistItem = {
  productId: string
  slug: string
  name: string
  image: string
  price: number
  comparePrice: number | null
}

type WishlistState = {
  items: WishlistItem[]
  hydrated: boolean
  toggle: (item: WishlistItem) => boolean
  remove: (productId: string) => void
  has: (productId: string) => boolean
  clear: () => void
}

export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      hydrated: false,

      toggle: (item) => {
        const exists = get().items.some((i) => i.productId === item.productId)
        set((state) => ({
          items: exists
            ? state.items.filter((i) => i.productId !== item.productId)
            : [...state.items, item],
        }))
        return !exists // true হলে যোগ হয়েছে
      },

      remove: (productId) =>
        set((state) => ({ items: state.items.filter((i) => i.productId !== productId) })),

      has: (productId) => get().items.some((i) => i.productId === productId),

      clear: () => set({ items: [] }),
    }),
    {
      name: 'sharighor-wishlist',
      partialize: (state) => ({ items: state.items }),
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true
      },
    }
  )
)
