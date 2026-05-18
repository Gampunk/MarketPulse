// Standalone Binance REST fetchers.
// Used by TanStack Query hooks and BinanceCryptoSource.fetchOHLCV/getSupportedSymbols.
// Designed to be cache-ready and multi-exchange extensible.
import type { Candle, MarketSymbol, Interval } from '@/types/market'

const REST_BASE = 'https://api.binance.com'

export async function fetchKlines(
  symbol: string,
  interval: Interval,
  limit: number
): Promise<Candle[]> {
  const url = `${REST_BASE}/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Binance klines ${res.status}: ${symbol}/${interval}`)
  const raw: [number, string, string, string, string, string, ...unknown[]][] = await res.json()
  return raw.map(([time, open, high, low, close, volume]) => ({
    time: Math.floor(time / 1000),
    open: parseFloat(open),
    high: parseFloat(high),
    low: parseFloat(low),
    close: parseFloat(close),
    volume: parseFloat(volume),
  }))
}

export async function fetchExchangeInfo(): Promise<MarketSymbol[]> {
  const res = await fetch(`${REST_BASE}/api/v3/exchangeInfo?permissions=SPOT`)
  if (!res.ok) throw new Error(`Binance exchangeInfo ${res.status}`)
  const data: {
    symbols: { symbol: string; baseAsset: string; quoteAsset: string; status: string }[]
  } = await res.json()
  return data.symbols
    .filter(s => s.quoteAsset === 'USDT' && s.status === 'TRADING')
    .map(s => ({ symbol: s.symbol, baseAsset: s.baseAsset, quoteAsset: s.quoteAsset }))
}
