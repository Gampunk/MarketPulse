import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { PriceChange, Candle, Interval, MarketSymbol, ConnectionStatus } from '@/types/market'
import type { CoinMeta, GlobalMarketStats, TopMoverCoin } from '@/types/metadata'

// Stable empty reference — safe to return from getKlines when no data exists.
// A literal [] would create a new reference on every call, breaking Zustand reactive selectors.
const EMPTY_CANDLES: Candle[] = []

// --- Slice types ---

interface ConnectionState {
  status: ConnectionStatus
  reconnectCount: number
  lastConnectedAt: number | null
}

interface MarketStore {
  // Ticker slice — live 24h price stats per symbol
  tickers: Record<string, PriceChange>
  setTicker: (symbol: string, data: PriceChange) => void

  // Kline slice — rolling candle arrays per symbol per interval
  // klines[symbol][interval] = Candle[] (sorted ascending, max 500)
  klines: Record<string, Partial<Record<Interval, Candle[]>>>
  setKlineHistory: (symbol: string, interval: Interval, candles: Candle[]) => void
  updateKlineCandle: (symbol: string, interval: Interval, candle: Candle, isClosed: boolean) => void
  getKlines: (symbol: string, interval: Interval) => Candle[]

  // Symbol metadata slice — populated in Phase 4 via CoinGecko
  symbols: Record<string, MarketSymbol>
  setSymbols: (symbols: MarketSymbol[]) => void

  // CoinGecko coin metadata — keyed by baseAsset uppercase ('BTC', 'ETH').
  // Separate from Binance exchange symbols — different namespace, different source.
  coinMetadata: Record<string, CoinMeta>
  setCoinMetadata: (entries: CoinMeta[]) => void
  // Derives baseAsset from a Binance pair symbol by stripping USDT suffix.
  // Valid for all USDT pairs (the only pairs AddSymbolSearch allows — TD-016).
  getCoinMeta: (binanceSymbol: string) => CoinMeta | undefined

  // Analytics slice — populated by useAnalyticsOrchestrator (Phase 4B)
  // lastRefreshedAt is the AI/event hook point: non-null when the first complete snapshot has arrived.
  analytics: {
    topGainers: TopMoverCoin[]
    topLosers: TopMoverCoin[]
    globalStats: GlobalMarketStats | null
    lastRefreshedAt: number | null
  }
  setTopGainers: (coins: TopMoverCoin[]) => void
  setTopLosers: (coins: TopMoverCoin[]) => void
  setGlobalStats: (stats: GlobalMarketStats) => void
  setAnalyticsLastRefreshed: (ts: number) => void

  // Connection state slice — driven by BinanceCryptoSource lifecycle events
  connection: ConnectionState
  setConnectionStatus: (status: ConnectionStatus) => void
  onReconnect: () => void
}

export const useMarketStore = create<MarketStore>()(
  devtools(
    (set, get) => ({

      // ── Ticker ────────────────────────────────────────────────────────────
      tickers: {},
      setTicker: (symbol, data) =>
        set(
          state => ({ tickers: { ...state.tickers, [symbol]: data } }),
          false,
          'tickers/set'
        ),

      // ── Klines ───────────────────────────────────────────────────────────
      klines: {},

      setKlineHistory: (symbol, interval, candles) =>
        set(
          state => ({
            klines: {
              ...state.klines,
              [symbol]: {
                ...state.klines[symbol],
                // Cap at 500 candles; discard oldest if over
                [interval]: candles.slice(-500),
              },
            },
          }),
          false,
          'klines/setHistory'
        ),

      updateKlineCandle: (symbol, interval, candle, _isClosed) =>
        set(
          state => {
            const existing = state.klines[symbol]?.[interval] ?? []
            const last = existing[existing.length - 1]

            let updated: Candle[]

            if (!last || candle.time > last.time) {
              // Append new candle — trim to rolling 500
              const next = [...existing, candle]
              updated = next.length > 500 ? next.slice(next.length - 500) : next
            } else if (candle.time === last.time) {
              // Replace last candle with live update (same timestamp = still open)
              updated = [...existing.slice(0, -1), candle]
            } else {
              // Out-of-order update — discard to preserve sort invariant
              return state
            }

            return {
              klines: {
                ...state.klines,
                [symbol]: { ...state.klines[symbol], [interval]: updated },
              },
            }
          },
          false,
          'klines/updateCandle'
        ),

      getKlines: (symbol, interval) => get().klines[symbol]?.[interval] ?? EMPTY_CANDLES,

      // ── Symbol metadata ───────────────────────────────────────────────────
      symbols: {},
      setSymbols: symbols =>
        set(
          {
            symbols: Object.fromEntries(symbols.map(s => [s.symbol, s])),
          },
          false,
          'symbols/set'
        ),

      // ── CoinGecko coin metadata ───────────────────────────────────────────
      coinMetadata: {},
      setCoinMetadata: entries =>
        set(
          {
            // Key by CoinGecko symbol uppercase — matches Binance baseAsset.
            // CoinGecko returns symbol lowercase ('btc'); normalized to 'BTC' here.
            // O(1) lookup in getCoinMeta — no scan required.
            coinMetadata: Object.fromEntries(
              entries.map(e => [e.symbol.toUpperCase(), e])
            ),
          },
          false,
          'coinMetadata/set'
        ),
      getCoinMeta: binanceSymbol => {
        // Strip USDT suffix to derive baseAsset, then look up in coinMetadata.
        // TD-016: heuristic valid for USDT pairs only.
        const baseAsset = binanceSymbol.replace(/USDT$/, '')
        return get().coinMetadata[baseAsset]
      },

      // ── Analytics ────────────────────────────────────────────────────────
      analytics: {
        topGainers: [],
        topLosers: [],
        globalStats: null,
        lastRefreshedAt: null,
      },

      setTopGainers: coins =>
        set(
          state => ({ analytics: { ...state.analytics, topGainers: coins } }),
          false,
          'analytics/setTopGainers'
        ),

      setTopLosers: coins =>
        set(
          state => ({ analytics: { ...state.analytics, topLosers: coins } }),
          false,
          'analytics/setTopLosers'
        ),

      setGlobalStats: stats =>
        set(
          state => ({ analytics: { ...state.analytics, globalStats: stats } }),
          false,
          'analytics/setGlobalStats'
        ),

      setAnalyticsLastRefreshed: ts =>
        set(
          state => ({ analytics: { ...state.analytics, lastRefreshedAt: ts } }),
          false,
          'analytics/setLastRefreshed'
        ),

      // ── Connection ────────────────────────────────────────────────────────
      connection: {
        status: 'disconnected',
        reconnectCount: 0,
        lastConnectedAt: null,
      },

      setConnectionStatus: status =>
        set(
          state => ({
            connection: {
              ...state.connection,
              status,
              ...(status === 'connected' ? { lastConnectedAt: Date.now() } : {}),
            },
          }),
          false,
          'connection/setStatus'
        ),

      onReconnect: () =>
        set(
          state => ({
            connection: {
              ...state.connection,
              reconnectCount: state.connection.reconnectCount + 1,
            },
          }),
          false,
          'connection/onReconnect'
        ),
    }),
    {
      name: 'MarketPulse',
      enabled: import.meta.env.DEV,
    }
  )
)
