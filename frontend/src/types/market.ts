export interface TickData {
  symbol: string
  price: number
  timestamp: number
}

export interface Candle {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export type Interval = '1m' | '5m' | '15m' | '1h' | '4h' | '1d' | '1w'

export interface MarketSymbol {
  symbol: string
  baseAsset: string
  quoteAsset: string
  name?: string
  logoUrl?: string
}

export interface PriceChange {
  symbol: string
  price: number
  change24h: number
  changePct24h: number
  volume24h: number
  high24h: number
  low24h: number
}

export interface WatchlistItem {
  symbol: string
  addedAt: number
}

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected'

export interface MarketDataSource {
  // Tick-level price subscription — fires on every miniTicker update
  subscribeToPrice(symbol: string, callback: (data: TickData) => void): () => void

  // Live OHLCV candle stream — fires on every kline update for the given interval
  // Added in Phase 3 to support charting and future analytics consumers
  subscribeToKlines(
    symbol: string,
    interval: Interval,
    callback: (candle: Candle, isClosed: boolean) => void
  ): () => void

  // Historical OHLCV data via REST
  fetchOHLCV(symbol: string, interval: Interval, limit: number): Promise<Candle[]>

  // Full symbol list for the exchange
  getSupportedSymbols(): Promise<MarketSymbol[]>
}
