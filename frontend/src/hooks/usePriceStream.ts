import { useEffect, useRef } from 'react'
import { useWatchlistStore } from '@/stores/watchlist'
import { binanceSource } from '@/api/market/binance'

// Manages the Binance WebSocket subscription set for the lifetime of the app.
// Only subscribes/unsubscribes the delta when the watchlist changes —
// does NOT teardown and rebuild all subscriptions on every render.
export function usePriceStream() {
  const items = useWatchlistStore(s => s.items)
  // Stable map of symbol → cleanup function, persisted across renders
  const cleanupMap = useRef(new Map<string, () => void>())

  useEffect(() => {
    const currentSymbols = new Set(items.map(i => i.symbol))
    const prevSymbols = new Set(cleanupMap.current.keys())

    // Subscribe to symbols that are new in the watchlist
    for (const symbol of currentSymbols) {
      if (!prevSymbols.has(symbol)) {
        const cleanup = binanceSource.subscribeToPrice(symbol, () => {
          // Store update happens inside binanceSource — no local state needed
        })
        cleanupMap.current.set(symbol, cleanup)
      }
    }

    // Unsubscribe from symbols that were removed from the watchlist
    for (const symbol of prevSymbols) {
      if (!currentSymbols.has(symbol)) {
        cleanupMap.current.get(symbol)?.()
        cleanupMap.current.delete(symbol)
      }
    }
  }, [items])

  // Unsubscribe everything on unmount (app teardown)
  useEffect(() => {
    const map = cleanupMap.current
    return () => {
      map.forEach(fn => fn())
      map.clear()
    }
  }, [])
}
