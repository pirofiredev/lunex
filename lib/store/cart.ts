"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartLine } from "@/lib/types";
import { ShippingCountry } from "@/lib/shipping";

export interface ShippingSelection {
  country: ShippingCountry;
  postalCode: string;
  amountCHF: number;
  distanceKm: number | null;
}

interface CartState {
  lines: CartLine[];
  isOpen: boolean;
  shipping: ShippingSelection | null;
  open: () => void;
  close: () => void;
  addLine: (line: CartLine) => void;
  removeLine: (productId: string, size: string) => void;
  setQuantity: (productId: string, size: string, quantity: number) => void;
  setShipping: (shipping: ShippingSelection | null) => void;
  clear: () => void;
  count: () => number;
  subtotal: () => number;
  total: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      isOpen: false,
      shipping: null,
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      addLine: (line) =>
        set((state) => {
          const existing = state.lines.find(
            (l) => l.productId === line.productId && l.size === line.size
          );
          if (existing) {
            return {
              lines: state.lines.map((l) =>
                l === existing ? { ...l, quantity: l.quantity + line.quantity } : l
              ),
            };
          }
          return { lines: [...state.lines, line], };
        }),
      removeLine: (productId, size) =>
        set((state) => ({
          lines: state.lines.filter(
            (l) => !(l.productId === productId && l.size === size)
          ),
        })),
      setQuantity: (productId, size, quantity) =>
        set((state) => ({
          lines: state.lines
            .map((l) =>
              l.productId === productId && l.size === size ? { ...l, quantity } : l
            )
            .filter((l) => l.quantity > 0),
        })),
      setShipping: (shipping) => set({ shipping }),
      clear: () => set({ lines: [], shipping: null }),
      count: () => get().lines.reduce((sum, l) => sum + l.quantity, 0),
      subtotal: () => get().lines.reduce((sum, l) => sum + l.quantity * l.priceCHF, 0),
      total: () => get().subtotal() + (get().shipping?.amountCHF ?? 0),
    }),
    { name: "lunex-cart" }
  )
);
