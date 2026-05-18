import { useMarketStore } from '@/stores/market'
import { fetchKlines, fetchExchangeInfo } from '@/api/rest/binance'
import type { MarketDataSource, TickData, Candle, MarketSymbol, Interval } from '@/types/market'

const WS_URL = 'wss://stream.binance.com:9443/stream'

const debug = import.meta.env.DEV ? console.debug.bind(console) : () => {}

// ── Binance stream event shapes ───────────────────────────────────────────────

interface MiniTickerEvent {
  e: '24hrMiniTicker'
  E: number
  s: string
  c: string
  o: string
  h: string
  l: string
  v: string
}

interface KlineEventData {
  t: number    // kline open time (ms)
  i: string    // interval
  o: string    // open
  c: string    // close (current)
  h: string    // high
  l: string    // low
  v: string    // base volume
  x: boolean   // is candle closed?
}

interface KlineEvent {
  e: 'kline'
  E: number
  s: string
  k: KlineEventData
}

type StreamEvent = { e: '24hrMiniTicker' } & MiniTickerEvent
                 | { e: 'kline' } & KlineEvent

// ── Singleton WebSocket transport + stream orchestrator ───────────────────────

class BinanceCryptoSource implements MarketDataSource {
  // Ticker subscribers: symbol → callback set
  private tickerSubs = new Map<string, Set<(data: TickData) => void>>()

  // Kline subscribers: symbol → interval → callback set
  private klineSubs = new Map<string, Map<Interval, Set<(candle: Candle, isClosed: boolean) => void>>>()

  // The single persistent WebSocket for all streams
  private ws: WebSocket | null = null

  private reconnectDelay = 1_000
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private msgId = 1

  // ── Connection lifecycle ────────────────────────────────────────────────────

  private ensureConnected() {
    const s = this.ws?.readyState
    if (s === WebSocket.OPEN || s === WebSocket.CONNECTING) return
    this.openConnection()
  }

  private openConnection() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }

    debug('[Binance WS] Connecting to', WS_URL)
    useMarketStore.getState().setConnectionStatus('connecting')

    const ws = new WebSocket(WS_URL)
    this.ws = ws

    ws.onopen = () => {
      if (this.ws !== ws) return
      debug('[Binance WS] Connected')
      this.reconnectDelay = 1_000
      useMarketStore.getState().setConnectionStatus('connected')
      this.resubscribeAll()
    }

    ws.onmessage = (event: MessageEvent<string>) => {
      if (this.ws !== ws) return
      try {
        const msg: { data?: StreamEvent } = JSON.parse(event.data)
        if (!msg.data) return
        if (msg.data.e === '24hrMiniTicker') this.handleTick(msg.data)
        else if (msg.data.e === 'kline') this.handleKline(msg.data)
      } catch {
        // ignore malformed frames
      }
    }

    ws.onclose = (event: CloseEvent) => {
      if (this.ws !== ws) return
      debug(
        `[Binance WS] Disconnected — code: ${event.code}, reason: "${event.reason || 'none'}", wasClean: ${event.wasClean}`
      )
      this.ws = null
      useMarketStore.getState().setConnectionStatus('disconnected')
      if (this.hasActiveSubscriptions()) this.scheduleReconnect()
    }

    ws.onerror = () => {
      if (this.ws !== ws) return
      debug('[Binance WS] Socket error — waiting for onclose')
      // onclose always follows onerror; reconnect logic lives there
    }
  }

  private resubscribeAll() {
    const streams: string[] = []

    for (const symbol of this.tickerSubs.keys()) {
      streams.push(`${symbol.toLowerCase()}@miniTicker`)
    }

    for (const [symbol, intervalMap] of this.klineSubs.entries()) {
      for (const interval of intervalMap.keys()) {
        if ((intervalMap.get(interval)?.size ?? 0) > 0) {
          streams.push(`${symbol.toLowerCase()}@kline_${interval}`)
        }
      }
    }

    if (streams.length > 0) {
      debug('[Binance WS] Resubscribing on connect:', streams)
      this.send({ method: 'SUBSCRIBE', params: streams, id: this.msgId++ })
    }
  }

  private hasActiveSubscriptions(): boolean {
    if (this.tickerSubs.size > 0) return true
    for (const intervalMap of this.klineSubs.values()) {
      for (const set of intervalMap.values()) {
        if (set.size > 0) return true
      }
    }
    return false
  }

  private scheduleReconnect() {
    debug(`[Binance WS] Reconnecting in ${this.reconnectDelay}ms`)
    useMarketStore.getState().onReconnect()
    this.reconnectTimer = setTimeout(() => {
      this.reconnectDelay = Math.min(this.reconnectDelay * 2, 30_000)
      debug(`[Binance WS] Reconnect attempt (next delay: ${this.reconnectDelay}ms)`)
      this.openConnection()
    }, this.reconnectDelay)
  }

  private send(payload: object) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(payload))
    }
  }

  // ── Tick handler ───────────────────────────────────────────────────────────

  private handleTick(d: MiniTickerEvent) {
    const price = parseFloat(d.c)
    const open = parseFloat(d.o)
    const change24h = price - open
    const changePct24h = open === 0 ? 0 : (change24h / open) * 100

    useMarketStore.getState().setTicker(d.s, {
      symbol: d.s,
      price,
      change24h,
      changePct24h,
      volume24h: parseFloat(d.v),
      high24h: parseFloat(d.h),
      low24h: parseFloat(d.l),
    })

    const tick: TickData = { symbol: d.s, price, timestamp: d.E }
    this.tickerSubs.get(d.s)?.forEach(cb => cb(tick))
  }

  // ── Kline handler ──────────────────────────────────────────────────────────

  private handleKline(event: KlineEvent) {
    const k = event.k
    const interval = k.i as Interval
    const candle: Candle = {
      time: Math.floor(k.t / 1000),
      open: parseFloat(k.o),
      high: parseFloat(k.h),
      low: parseFloat(k.l),
      close: parseFloat(k.c),
      volume: parseFloat(k.v),
    }

    debug(
      `[Binance WS] Kline ${event.s}/${interval} ${k.x ? '(closed)' : '(live)'} close=${k.c}`
    )

    useMarketStore.getState().updateKlineCandle(event.s, interval, candle, k.x)

    this.klineSubs.get(event.s)?.get(interval)?.forEach(cb => cb(candle, k.x))
  }

  // ── MarketDataSource: ticker subscription ──────────────────────────────────

  subscribeToPrice(symbol: string, callback: (data: TickData) => void): () => void {
    const isNew = !this.tickerSubs.has(symbol)
    if (isNew) this.tickerSubs.set(symbol, new Set())
    this.tickerSubs.get(symbol)!.add(callback)

    this.ensureConnected()

    if (isNew && this.ws?.readyState === WebSocket.OPEN) {
      debug(`[Binance WS] Subscribe ticker: ${symbol}`)
      this.send({ method: 'SUBSCRIBE', params: [`${symbol.toLowerCase()}@miniTicker`], id: this.msgId++ })
    }

    return () => {
      const set = this.tickerSubs.get(symbol)
      if (!set) return
      set.delete(callback)
      if (set.size > 0) return

      this.tickerSubs.delete(symbol)
      debug(`[Binance WS] Unsubscribe ticker: ${symbol}`)
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.send({ method: 'UNSUBSCRIBE', params: [`${symbol.toLowerCase()}@miniTicker`], id: this.msgId++ })
      }
    }
  }

  // ── MarketDataSource: kline subscription ───────────────────────────────────

  subscribeToKlines(
    symbol: string,
    interval: Interval,
    callback: (candle: Candle, isClosed: boolean) => void
  ): () => void {
    if (!this.klineSubs.has(symbol)) this.klineSubs.set(symbol, new Map())
    const intervalMap = this.klineSubs.get(symbol)!

    if (!intervalMap.has(interval)) intervalMap.set(interval, new Set())
    const callbacks = intervalMap.get(interval)!

    const isNew = callbacks.size === 0
    callbacks.add(callback)

    this.ensureConnected()

    const stream = `${symbol.toLowerCase()}@kline_${interval}`

    if (isNew && this.ws?.readyState === WebSocket.OPEN) {
      debug(`[Binance WS] Subscribe kline: ${stream}`)
      this.send({ method: 'SUBSCRIBE', params: [stream], id: this.msgId++ })
    }

    return () => {
      const set = this.klineSubs.get(symbol)?.get(interval)
      if (!set) return
      set.delete(callback)
      if (set.size > 0) return

      debug(`[Binance WS] Unsubscribe kline: ${stream}`)
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.send({ method: 'UNSUBSCRIBE', params: [stream], id: this.msgId++ })
      }

      this.klineSubs.get(symbol)?.delete(interval)
      if ((this.klineSubs.get(symbol)?.size ?? 0) === 0) {
        this.klineSubs.delete(symbol)
      }
    }
  }

  // ── MarketDataSource: REST methods (delegate to REST layer) ────────────────

  fetchOHLCV(symbol: string, interval: Interval, limit: number): Promise<Candle[]> {
    return fetchKlines(symbol, interval, limit)
  }

  getSupportedSymbols(): Promise<MarketSymbol[]> {
    return fetchExchangeInfo()
  }
}

export const binanceSource = new BinanceCryptoSource()
