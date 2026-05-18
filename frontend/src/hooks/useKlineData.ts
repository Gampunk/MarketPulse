import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useMarketStore } from '@/stores/market'
import { binanceSource } from '@/api/market/binance'
import { fetchKlines } from '@/api/rest/binance'
import type { Interval } from '@/types/market'

const debug = import.meta.env.DEV ? console.debug.bind(console) : () => {}

// Manages the full kline data lifecycle for a symbol+interval:
// 1. Fetches historical candles via REST (TanStack Query — cached per symbol+interval)
// 2. Deposits history into the market store
// 3. Subscribes to the live kline stream (BinanceCryptoSource singleton)
// 4. Live updates merge into the store via updateKlineCandle
//
// Used by chart components in Phase 3B. Active during Phase 3A for stream verification.
export function useKlineData(symbol: string, interval: Interval, limit = 300) {
  const setKlineHistory = useMarketStore(s => s.setKlineHistory)

  // Historical fetch — re-fetches on symbol or interval change
  useQuery({
    queryKey: ['klines', symbol, interval, limit],
    queryFn: async () => {
      debug(`[KlineData] Fetching historical ${symbol}/${interval} (limit: ${limit})`)
      const candles = await fetchKlines(symbol, interval, limit)
      setKlineHistory(symbol, interval, candles)
      debug(`[KlineData] Loaded ${candles.length} historical candles for ${symbol}/${interval}`)
      return candles
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  })

  // Live stream subscription — resubscribes when symbol or interval changes
  useEffect(() => {
    debug(`[KlineData] Subscribing live stream: ${symbol}/${interval}`)
    const cleanup = binanceSource.subscribeToKlines(symbol, interval, () => {
      // Market store updated inside binanceSource.handleKline — no local state needed
    })
    return () => {
      debug(`[KlineData] Unsubscribing live stream: ${symbol}/${interval}`)
      cleanup()
    }
  }, [symbol, interval])
}
