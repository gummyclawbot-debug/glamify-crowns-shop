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

export function getCartItemKey(item: {
  id: string
  variantSelections?: Record<string, string>
  personalizationText?: string
}) {
  return `${item.id}_${JSON.stringify(item.variantSelections || {})}_${item.personalizationText || ''}`
}

interface CartStore {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (itemKey: string) => void
  updateQuantity: (itemKey: string, quantity: number) => void
  clearCart: () => void
  getTotal: () => number
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        set((state) => {
          const key = getCartItemKey(item)
          const existing = state.items.find((i) => getCartItemKey(i) === key)

          if (existing) {
            return {
              items: state.items.map((i) =>
                getCartItemKey(i) === key ? { ...i, quantity: i.quantity + 1 } : i
              ),
            }
          }

          return { items: [...state.items, { ...item, quantity: 1 }] }
        })
      },

      removeItem: (itemKey) => {
        set((state) => ({ items: state.items.filter((item) => getCartItemKey(item) !== itemKey) }))
      },

      updateQuantity: (itemKey, quantity) => {
        if (quantity <= 0) {
          get().removeItem(itemKey)
          return
        }

        set((state) => ({
          items: state.items.map((item) =>
            getCartItemKey(item) === itemKey ? { ...item, quantity } : item
          ),
        }))
      },

      clearCart: () => {
        set({ items: [] })
      },

      getTotal: () => get().items.reduce((total, item) => total + item.price * item.quantity, 0),
    }),
    { name: 'cart-storage' }
  )
)
