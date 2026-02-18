import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  id: string
  name: string
  price: number
  image: string
  quantity: number
  variantSelections?: Record<string, string>
  personalizationText?: string
}

function cartItemKey(item: { id: string; variantSelections?: Record<string, string>; personalizationText?: string }) {
  return `${item.id}_${JSON.stringify(item.variantSelections || {})}_${item.personalizationText || ''}`
}

interface CartStore {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  getTotal: () => number
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        set((state) => {
          const key = cartItemKey(item)
          const existing = state.items.find((i) => cartItemKey(i) === key)

          if (existing) {
            return {
              items: state.items.map((i) =>
                cartItemKey(i) === key ? { ...i, quantity: i.quantity + 1 } : i
              ),
            }
          }

          return { items: [...state.items, { ...item, quantity: 1 }] }
        })
      },

      removeItem: (id) => {
        set((state) => ({ items: state.items.filter((item) => item.id !== id) }))
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) { get().removeItem(id); return }
        set((state) => ({
          items: state.items.map((item) => item.id === id ? { ...item, quantity } : item),
        }))
      },

      clearCart: () => { set({ items: [] }) },

      getTotal: () => get().items.reduce((total, item) => total + item.price * item.quantity, 0),
    }),
    { name: 'cart-storage' }
  )
)
