import { useEffect } from 'react'
import { useWatchlistStore } from '@/stores/watchlist'
import { binanceSource } from '@/api/market/binance'

// Called once at the app root. Subscribes to all watchlist symbols and keeps
// the subscription set in sync as the watchlist changes.
export function usePriceStream() {
  const items = useWatchlistStore(s => s.items)

  useEffect(() => {
    const cleanups = items.map(({ symbol }) =>
      binanceSource.subscribeToPrice(symbol, () => {
        // PricesStore is updated inside binanceSource.handleTick — no local state needed
      })
    )
    return () => cleanups.forEach(fn => fn())
  }, [items])
}
