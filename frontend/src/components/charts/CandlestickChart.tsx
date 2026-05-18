import { useEffect, useRef } from 'react'
import { createChart, ColorType, CrosshairMode, CandlestickSeries } from 'lightweight-charts'
import type { IChartApi, ISeriesApi, UTCTimestamp } from 'lightweight-charts'
import { useMarketStore } from '@/stores/market'
import { useKlineData } from '@/hooks/useKlineData'
import type { Interval } from '@/types/market'

// Minimum candle count that indicates full historical data has been loaded via REST.
// Live klines arrive one at a time; history arrives in bulk (default 300).
// Below this threshold the chart stays in "awaiting history" mode and calls setData
// on every update, which is correct and necessary before a full dataset is confirmed.
const HISTORY_READY_THRESHOLD = 50

interface Props {
  symbol: string
  interval: Interval
}

export function CandlestickChart({ symbol, interval }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null)

  // contextRef: which symbol+interval the chart is currently showing.
  // Drives context-change detection (symbol/interval switch).
  const contextRef = useRef<{ symbol: string; interval: Interval } | null>(null)

  // historyReadyRef: whether setData has been called with a full historical dataset
  // for the current context. Separating this from contextRef prevents the race
  // condition where a live kline arrives before REST history completes:
  //   live kline (1 candle) → setData([1]) → contextRef stamped ETHUSDT
  //   REST completes (300 candles) → effect sees isNewContext=false → series.update(last) only
  //   → 299 historical candles silently dropped
  // With historyReadyRef, we stay in setData mode until enough candles confirm history is loaded.
  const historyReadyRef = useRef(false)

  // Manages full data lifecycle: historical REST fetch + live WebSocket stream subscription.
  // Writes into useMarketStore — this component only reads from the store, never touches WS.
  useKlineData(symbol, interval)

  // Read from centralized store — chart is a pure consumer of store state.
  // Access the slice directly (not getKlines) — the ?? [] fallback in getKlines returns a new
  // array reference on every evaluation, causing an infinite re-render loop via Zustand's
  // Object.is selector comparison. undefined is a stable reference; no spurious re-renders.
  const candles = useMarketStore(s => s.klines[symbol]?.[interval])

  // Create/destroy chart instance once per mount
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const chart = createChart(container, {
      autoSize: true,
      layout: {
        background: { type: ColorType.Solid, color: '#161720' },
        textColor: '#7b7e9a',
        fontFamily: "'JetBrains Mono', ui-monospace, monospace",
        fontSize: 11,
      },
      grid: {
        vertLines: { color: '#2a2b3d' },
        horzLines: { color: '#2a2b3d' },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
      },
      rightPriceScale: {
        borderColor: '#2a2b3d',
      },
      timeScale: {
        borderColor: '#2a2b3d',
        timeVisible: true,
        secondsVisible: false,
      },
    })

    const series = chart.addSeries(CandlestickSeries, {
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderUpColor: '#22c55e',
      borderDownColor: '#ef4444',
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
    })

    chartRef.current = chart
    seriesRef.current = series

    return () => {
      chart.remove()
      chartRef.current = null
      seriesRef.current = null
      contextRef.current = null
      historyReadyRef.current = false
    }
  }, [])

  // Sync candle data from store to chart series.
  useEffect(() => {
    const series = seriesRef.current
    if (!series || !candles || candles.length === 0) return

    const ctx = contextRef.current
    const isNewContext = !ctx || ctx.symbol !== symbol || ctx.interval !== interval

    if (isNewContext) {
      // Symbol or interval changed — reset history state for new context
      contextRef.current = { symbol, interval }
      historyReadyRef.current = false
    }

    if (!historyReadyRef.current) {
      // History not yet confirmed for this context.
      // Always call setData regardless of whether this update came from a live kline
      // or the REST fetch — we don't know which arrived first, and setData is safe to
      // call repeatedly until full history is confirmed.
      const mapped = candles.map(c => ({
        time: c.time as UTCTimestamp,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      }))
      series.setData(mapped)
      // Force price scale to recalibrate for the new symbol's price range.
      // setData alone does not reliably reset a price scale that was calibrated to a
      // very different range (e.g., BTC ~77k → ETH ~2k). Without this, ETH candles
      // render far outside the visible area against the stale BTC scale.
      series.priceScale().applyOptions({ autoScale: true })

      // Transition to live-update mode once full history is confirmed.
      // Live klines arrive one at a time; REST history arrives in bulk (default 300).
      if (candles.length >= HISTORY_READY_THRESHOLD) {
        historyReadyRef.current = true
        // Defer fitContent() to the next animation frame.
        // Two reasons this must be async:
        // 1. With autoSize: true, TradingView's ResizeObserver fires before RAF — so by
        //    the time this callback runs, the chart knows its pixel dimensions and can
        //    correctly map the logical range to pixels. Synchronous fitContent() runs
        //    against a stale layout, leaving candles compressed at the chart edge.
        // 2. Only fit after HISTORY_READY_THRESHOLD candles — never fit to a 1-candle
        //    partial dataset (live kline before REST history), which would zoom the
        //    viewport to a micro range and conflict with the subsequent full-history fit.
        requestAnimationFrame(() => {
          chartRef.current?.timeScale().fitContent()
        })
      }
    } else {
      // Full history confirmed — apply live candle update only.
      // series.update() handles both open-candle ticks (same timestamp) and
      // new closed candles (later timestamp) without a full series redraw.
      const last = candles[candles.length - 1]
      series.update({
        time: last.time as UTCTimestamp,
        open: last.open,
        high: last.high,
        low: last.low,
        close: last.close,
      })
    }
  }, [candles, symbol, interval])

  return <div ref={containerRef} className="w-full h-full" />
}
