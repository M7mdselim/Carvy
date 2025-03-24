
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Product } from '../types'
import { toast } from 'sonner'

interface CartItem {
  product: Product
  quantity: number
}

interface CartStore {
  items: CartItem[]
  addItem: (product: Product) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  total: number
  calculateTotal: (items: CartItem[]) => number
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      total: 0, // Initialize total to 0

      // Helper Function to Calculate Total
      calculateTotal: (items: CartItem[]) => {
        return items.reduce(
          (sum, item) => sum + item.product.price * item.quantity,
          0
        )
      },

      // Add Item to Cart
      addItem: (product) => {
        const currentItems = get().items
        const existingItem = currentItems.find(item => item.product.id === product.id)

        // Check if we're exceeding available stock
        const currentQuantity = existingItem ? existingItem.quantity : 0
        const requestedQuantity = currentQuantity + 1
        
        if (requestedQuantity > product.stock) {
          toast.error(`Sorry, only ${product.stock} units available in stock`)
          return
        }

        let updatedItems
        if (existingItem) {
          // If item exists, increase the quantity
          updatedItems = currentItems.map(item =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        } else {
          // If item doesn't exist, add it to the cart
          updatedItems = [...currentItems, { product, quantity: 1 }]
        }

        set({
          items: updatedItems,
          total: get().calculateTotal(updatedItems) // Recalculate total
        })
      },

      // Remove Item from Cart
      removeItem: (productId) => {
        const updatedItems = get().items.filter(item => item.product.id !== productId)
        set({
          items: updatedItems,
          total: get().calculateTotal(updatedItems) // Recalculate total
        })
      },

      // Update Quantity of a Product
      updateQuantity: (productId, quantity) => {
        if (quantity < 1) {
          get().removeItem(productId) // Use removeItem if quantity < 1
          return
        }

        const currentItems = get().items
        const item = currentItems.find(item => item.product.id === productId)
        
        // Check if requested quantity exceeds stock
        if (item && quantity > item.product.stock) {
          toast.error(`Sorry, only ${item.product.stock} units available in stock`)
          return
        }

        const updatedItems = currentItems.map(item =>
          item.product.id === productId
            ? { ...item, quantity }
            : item
        )
        
        set({
          items: updatedItems,
          total: get().calculateTotal(updatedItems) // Recalculate total
        })
      },

      // Clear the Cart
      clearCart: () => set({ items: [], total: 0 }), // Total set to 0 when cart is cleared
    }),
    {
      name: 'cart-storage',
    }
  )
)
