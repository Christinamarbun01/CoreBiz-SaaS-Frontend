import { create } from 'zustand';
import type { Product } from '@/data/posMockData';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  customerId: string | null;

  // Actions
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  increaseQty: (productId: string) => void;
  decreaseQty: (productId: string) => void;
  setCustomerId: (id: string | null) => void;
  clearCart: () => void;

  // Computed selectors
  totalAmount: () => number;
  totalItems: () => number;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  customerId: null,

  addItem: (product) =>
    set((state) => {
      const existing = state.items.find((i) => i.product.id === product.id);
      if (existing) {
        // Produk sudah ada → naikkan qty
        return {
          items: state.items.map((i) =>
            i.product.id === product.id
              ? { ...i, quantity: i.quantity + 1 }
              : i,
          ),
        };
      }
      return { items: [...state.items, { product, quantity: 1 }] };
    }),

  removeItem: (productId) =>
    set((state) => ({
      items: state.items.filter((i) => i.product.id !== productId),
    })),

  increaseQty: (productId) =>
    set((state) => ({
      items: state.items.map((i) =>
        i.product.id === productId ? { ...i, quantity: i.quantity + 1 } : i,
      ),
    })),

  decreaseQty: (productId) =>
    set((state) => ({
      items: state.items
        .map((i) =>
          i.product.id === productId ? { ...i, quantity: i.quantity - 1 } : i,
        )
        .filter((i) => i.quantity > 0), // Auto-hapus jika qty ≤ 0
    })),

  setCustomerId: (id) => set({ customerId: id }),

  clearCart: () => set({ items: [], customerId: null }),

  totalAmount: () =>
    get().items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),

  totalItems: () =>
    get().items.reduce((sum, i) => sum + i.quantity, 0),
}));
