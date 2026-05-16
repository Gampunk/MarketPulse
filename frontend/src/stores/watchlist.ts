import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { WatchlistItem } from '@/types/market'

const DEFAULT_SYMBOLS: WatchlistItem[] = [
  { symbol: 'BTCUSDT', addedAt: Date.now() },
  { symbol: 'ETHUSDT', addedAt: Date.now() },
  { symbol: 'SOLUSDT', addedAt: Date.now() },
  { symbol: 'BNBUSDT', addedAt: Date.now() },
]

interface WatchlistStore {
  items: WatchlistItem[]
  activeSymbol: string
  addSymbol: (symbol: string) => void
  removeSymbol: (symbol: string) => void
  setActiveSymbol: (symbol: string) => void
}

export const useWatchlistStore = create<WatchlistStore>()(
  persist(
    (set) => ({
      items: DEFAULT_SYMBOLS,
      activeSymbol: 'BTCUSDT',
      addSymbol: (symbol) =>
        set((state) => ({
          items: state.items.some((i) => i.symbol === symbol)
            ? state.items
            : [...state.items, { symbol, addedAt: Date.now() }],
        })),
      removeSymbol: (symbol) =>
        set((state) => ({
          items: state.items.filter((i) => i.symbol !== symbol),
        })),
      setActiveSymbol: (symbol) => set({ activeSymbol: symbol }),
    }),
    { name: 'marketpulse-watchlist' }
  )
)
