import { usePricesStore } from '@/stores/prices'
import type { MarketDataSource, TickData, Candle, MarketSymbol, Interval } from '@/types/market'

const WS_BASE = 'wss://stream.binance.com:9443/stream'
const REST_BASE = 'https://api.binance.com'

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

class BinanceCryptoSource implements MarketDataSource {
  private ws: WebSocket | null = null
  private subscribers = new Map<string, Set<(data: TickData) => void>>()
  private pendingSubscriptions = new Set<string>()
  private reconnectDelay = 1_000
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private closing = false
  private msgId = 1

  private buildUrl(): string {
    const streams = [...this.subscribers.keys()]
      .map(s => `${s.toLowerCase()}@miniTicker`)
      .join('/')
    return `${WS_BASE}?streams=${streams}`
  }

  private connect() {
    if (this.subscribers.size === 0) return
    this.closing = false
    this.ws = new WebSocket(this.buildUrl())

    this.ws.onopen = () => {
      this.reconnectDelay = 1_000
      if (this.pendingSubscriptions.size > 0) {
        this.send({
          method: 'SUBSCRIBE',
          params: [...this.pendingSubscriptions].map(s => `${s.toLowerCase()}@miniTicker`),
          id: this.msgId++,
        })
        this.pendingSubscriptions.clear()
      }
    }

    this.ws.onmessage = (event: MessageEvent<string>) => {
      try {
        const msg: { stream: string; data: MiniTickerEvent } = JSON.parse(event.data)
        if (msg.data?.e !== '24hrMiniTicker') return
        this.handleTick(msg.data)
      } catch {
        // ignore malformed messages
      }
    }

    this.ws.onclose = () => {
      if (!this.closing) this.scheduleReconnect()
    }

    this.ws.onerror = () => {
      this.ws?.close()
    }
  }

  private handleTick(d: MiniTickerEvent) {
    const price = parseFloat(d.c)
    const open = parseFloat(d.o)
    const change24h = price - open
    const changePct24h = open === 0 ? 0 : (change24h / open) * 100

    usePricesStore.getState().setPrice(d.s, {
      symbol: d.s,
      price,
      change24h,
      changePct24h,
      volume24h: parseFloat(d.v),
      high24h: parseFloat(d.h),
      low24h: parseFloat(d.l),
    })

    const tick: TickData = { symbol: d.s, price, timestamp: d.E }
    this.subscribers.get(d.s)?.forEach(cb => cb(tick))
  }

  private send(payload: object) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(payload))
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer)
    this.reconnectTimer = setTimeout(() => {
      this.reconnectDelay = Math.min(this.reconnectDelay * 2, 30_000)
      this.connect()
    }, this.reconnectDelay)
  }

  subscribeToPrice(symbol: string, callback: (data: TickData) => void): () => void {
    const isNew = !this.subscribers.has(symbol)
    if (isNew) this.subscribers.set(symbol, new Set())
    this.subscribers.get(symbol)!.add(callback)

    if (!this.ws || this.ws.readyState === WebSocket.CLOSED) {
      this.connect()
    } else if (isNew) {
      if (this.ws.readyState === WebSocket.OPEN) {
        this.send({
          method: 'SUBSCRIBE',
          params: [`${symbol.toLowerCase()}@miniTicker`],
          id: this.msgId++,
        })
      } else {
        this.pendingSubscriptions.add(symbol)
      }
    }

    return () => {
      const set = this.subscribers.get(symbol)
      if (!set) return
      set.delete(callback)
      if (set.size > 0) return
      this.subscribers.delete(symbol)
      this.send({
        method: 'UNSUBSCRIBE',
        params: [`${symbol.toLowerCase()}@miniTicker`],
        id: this.msgId++,
      })
      if (this.subscribers.size === 0) {
        this.closing = true
        if (this.reconnectTimer) clearTimeout(this.reconnectTimer)
        this.ws?.close()
        this.ws = null
      }
    }
  }

  async fetchOHLCV(symbol: string, interval: Interval, limit: number): Promise<Candle[]> {
    const url = `${REST_BASE}/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Binance klines ${res.status}`)
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

  async getSupportedSymbols(): Promise<MarketSymbol[]> {
    const res = await fetch(`${REST_BASE}/api/v3/exchangeInfo?permissions=SPOT`)
    if (!res.ok) throw new Error(`Binance exchangeInfo ${res.status}`)
    const data: {
      symbols: { symbol: string; baseAsset: string; quoteAsset: string; status: string }[]
    } = await res.json()
    return data.symbols
      .filter(s => s.quoteAsset === 'USDT' && s.status === 'TRADING')
      .map(s => ({ symbol: s.symbol, baseAsset: s.baseAsset, quoteAsset: s.quoteAsset }))
  }
}

export const binanceSource = new BinanceCryptoSource()
