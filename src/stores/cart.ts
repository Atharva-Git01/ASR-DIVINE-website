import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type CartItem = {
  id: string
  productId: string
  variantId?: string
  name: string
  variantLabel?: string
  price: number
  qty: number
  image?: string
  giftWrapped: boolean
  giftMessage?: string
}

type CartStore = {
  items: CartItem[]
  isOpen: boolean

  // Actions
  addItem: (item: Omit<CartItem, 'qty' | 'giftWrapped'>) => void
  removeItem: (id: string) => void
  updateQty: (id: string, qty: number) => void
  toggleGiftWrap: (id: string) => void
  setGiftMessage: (id: string, message: string) => void
  clearCart: () => void
  openCart: () => void
  closeCart: () => void

  // Derived
  itemCount: () => number
  subtotal: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (newItem) => {
        set((state) => {
          const existing = state.items.find(
            (i) => i.productId === newItem.productId && i.variantId === newItem.variantId
          )
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === existing.id ? { ...i, qty: i.qty + 1 } : i
              ),
              isOpen: true,
            }
          }
          return {
            items: [...state.items, { ...newItem, qty: 1, giftWrapped: false }],
            isOpen: true,
          }
        })
      },

      removeItem: (id) =>
        set((state) => ({ items: state.items.filter((i) => i.id !== id) })),

      updateQty: (id, qty) => {
        if (qty <= 0) {
          get().removeItem(id)
          return
        }
        set((state) => ({
          items: state.items.map((i) => (i.id === id ? { ...i, qty } : i)),
        }))
      },

      toggleGiftWrap: (id) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id ? { ...i, giftWrapped: !i.giftWrapped } : i
          ),
        })),

      setGiftMessage: (id, message) =>
        set((state) => ({
          items: state.items.map((i) => (i.id === id ? { ...i, giftMessage: message } : i)),
        })),

      clearCart: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      itemCount: () => get().items.reduce((sum, i) => sum + i.qty, 0),
      subtotal: () => get().items.reduce((sum, i) => sum + i.price * i.qty, 0),
    }),
    {
      name: 'cocoa-crumb-cart',
      partialize: (state) => ({ items: state.items }),
    }
  )
)
