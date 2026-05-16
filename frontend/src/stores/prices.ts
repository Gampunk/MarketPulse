import { create } from 'zustand'
import type { PriceChange } from '@/types/market'

interface PricesStore {
  prices: Record<string, PriceChange>
  setPrice: (symbol: string, data: PriceChange) => void
  getPrice: (symbol: string) => PriceChange | undefined
}

export const usePricesStore = create<PricesStore>((set, get) => ({
  prices: {},
  setPrice: (symbol, data) =>
    set((state) => ({ prices: { ...state.prices, [symbol]: data } })),
  getPrice: (symbol) => get().prices[symbol],
}))
