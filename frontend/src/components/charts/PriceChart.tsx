import { useEffect, useRef, useState } from 'react'
import {
  ColorType,
  CrosshairMode,
  CandlestickSeries,
  LineSeries,
  HistogramSeries,
} from 'lightweight-charts'
import type { UTCTimestamp, MouseEventParams } from 'lightweight-charts'
import { useMarketStore } from '@/stores/market'
import { useKlineData } from '@/hooks/useKlineData'
import { useChartEngine } from '@/hooks/useChartEngine'
import { formatVolume } from '@/lib/formatters'
import type { Interval, Candle } from '@/types/market'
import type { ChartType, PriceChartContext } from '@/types/chart'

// Minimum candle count that confirms full REST history has loaded (vs. a single live kline).
// Binance default limit is 300; threshold is intentionally well below that to be safe.
const HISTORY_READY_THRESHOLD = 50

// --- Chart configuration ---

const CHART_OPTIONS = {
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
  crosshair: { mode: CrosshairMode.Normal },
  rightPriceScale: { borderColor: '#2a2b3d' },
  timeScale: { borderColor: '#2a2b3d', timeVisible: true, secondsVisible: false },
}

const CANDLESTICK_OPTIONS = {
  upColor: '#22c55e',
  downColor: '#ef4444',
  borderUpColor: '#22c55e',
  borderDownColor: '#ef4444',
  wickUpColor: '#22c55e',
  wickDownColor: '#ef4444',
}

const LINE_OPTIONS = {
  color: '#6366f1',
  lineWidth: 2 as const,
  crosshairMarkerVisible: true,
  crosshairMarkerRadius: 4,
}

const HISTOGRAM_OPTIONS = {
  priceFormat: { type: 'volume' as const },
  priceScaleId: 'volume',
}

const VOLUME_SCALE_OPTIONS = {
  scaleMargins: { top: 0.75, bottom: 0 },
  // Hide the volume axis — value is surfaced via crosshair tooltip instead.
  visible: false,
  borderVisible: false,
}

// --- Data mappers (module-level — no recreation on each render) ---

function mapToPriceData(c: Candle, chartType: ChartType) {
  if (chartType === 'candlestick') {
    return { time: c.time as UTCTimestamp, open: c.open, high: c.high, low: c.low, close: c.close }
  }
  return { time: c.time as UTCTimestamp, value: c.close }
}

function mapToVolumeData(c: Candle) {
  return {
    time: c.time as UTCTimestamp,
    value: c.volume,
    color: c.close >= c.open ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)',
  }
}

// ---

interface Props {
  symbol: string
  interval: Interval
  chartType: ChartType
}

interface VolumeTooltip {
  formatted: string
  isGreen: boolean
}

export function PriceChart({ symbol, interval, chartType }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)

  // Chart infrastructure — series registry, chart lifecycle
  const engine = useChartEngine(containerRef, CHART_OPTIONS)

  // contextRef: full rendering context { symbol, interval, chartType }.
  // Any dimension change triggers series reset + setData path.
  const contextRef = useRef<PriceChartContext | null>(null)

  // historyReadyRef: gates setData vs. update — stays false until HISTORY_READY_THRESHOLD
  // candles are present, preventing the race where a live kline before REST history
  // causes the component to enter update() mode with incomplete data.
  const historyReadyRef = useRef(false)

  // Volume tooltip — shown in chart top-left on crosshair hover, null when inactive.
  const [volumeTooltip, setVolumeTooltip] = useState<VolumeTooltip | null>(null)

  // Data subscription — deposits history + subscribes live stream into useMarketStore.
  // Chart is a pure consumer of store state; this hook owns the data pipeline.
  useKlineData(symbol, interval)

  // Stable store slice access — direct path avoids the ?? [] new-reference loop
  // that would cause infinite re-renders via Zustand's Object.is selector comparison.
  const candles = useMarketStore(s => s.klines[symbol]?.[interval])

  useEffect(() => {
    if (!engine.isReady || !candles || candles.length === 0) return

    const ctx = contextRef.current
    const isNewContext =
      !ctx ||
      ctx.symbol !== symbol ||
      ctx.interval !== interval ||
      ctx.chartType !== chartType

    // isSymbolChange is scoped inside isNewContext — price scale recalibration
    // is only needed when the symbol (and thus price range) changes.
    // Interval and chartType changes operate on the same symbol's price range.
    const isSymbolChange = !ctx || ctx.symbol !== symbol

    if (isNewContext) {
      contextRef.current = { symbol, interval, chartType }
      historyReadyRef.current = false

      // Swap or create the price series. engine.addSeries replaces the existing
      // 'price' series if present — no chart recreation required for type switching.
      engine.addSeries(
        'price',
        chartType === 'candlestick' ? CandlestickSeries : LineSeries,
        chartType === 'candlestick' ? CANDLESTICK_OPTIONS : LINE_OPTIONS
      )

      // Volume series persists across chart type switches — only add if absent.
      if (!engine.getSeries('volume')) {
        engine.addSeries('volume', HistogramSeries, HISTOGRAM_OPTIONS)
        engine.chartRef.current?.priceScale('volume').applyOptions(VOLUME_SCALE_OPTIONS)
      }
    }

    const priceSeries = engine.getSeries('price')
    const volumeSeries = engine.getSeries('volume')
    if (!priceSeries || !volumeSeries) return

    if (!historyReadyRef.current) {
      // History load path — call setData on both series.
      // Covers both: initial load and repeated calls before threshold is reached
      // (live kline may arrive before REST history; setData is safe to call repeatedly).
      priceSeries.setData(candles.map(c => mapToPriceData(c, chartType)))
      volumeSeries.setData(candles.map(mapToVolumeData))

      // Recalibrate the price axis only on symbol change.
      // Interval and chartType changes share the same symbol's price range —
      // resetting the scale on those changes causes unnecessary axis jumps.
      if (isSymbolChange) {
        priceSeries.priceScale().applyOptions({ autoScale: true })
      }

      if (candles.length >= HISTORY_READY_THRESHOLD) {
        historyReadyRef.current = true
        // Defer fitContent() to the next RAF — ResizeObserver fires before RAF,
        // so by this point TradingView has measured the container's pixel dimensions.
        // Synchronous fitContent() runs against a stale layout.
        requestAnimationFrame(() => {
          engine.chartRef.current?.timeScale().fitContent()
        })
      }
    } else {
      // Live update path — apply only the latest candle.
      // series.update() handles both open-candle ticks (same timestamp)
      // and new closed candles (later timestamp) without a full series redraw.
      const last = candles[candles.length - 1]
      priceSeries.update(mapToPriceData(last, chartType))
      volumeSeries.update(mapToVolumeData(last))
    }
  }, [candles, symbol, interval, chartType, engine.isReady])

  // Crosshair subscription — drives the volume tooltip bubble.
  // Reads the volume series data at the hovered bar and sets tooltip state.
  // The subscription is established once when the chart is ready and torn down on unmount.
  useEffect(() => {
    if (!engine.isReady) return
    const chart = engine.chartRef.current
    if (!chart) return

    const handler = (param: MouseEventParams) => {
      const volumeSeries = engine.getSeries('volume')
      if (!param.time || !volumeSeries) {
        setVolumeTooltip(null)
        return
      }
      const bar = param.seriesData.get(volumeSeries) as { value?: number; color?: string } | undefined
      if (!bar?.value) {
        setVolumeTooltip(null)
        return
      }
      setVolumeTooltip({
        formatted: formatVolume(bar.value),
        // Green bar = close >= open (color contains the green RGB values)
        isGreen: (bar.color ?? '').includes('34,197'),
      })
    }

    chart.subscribeCrosshairMove(handler)
    return () => { chart.unsubscribeCrosshairMove(handler) }
  }, [engine.isReady])

  return (
    <div ref={containerRef} className="w-full h-full relative">
      {volumeTooltip && (
        <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5 px-2 py-1 rounded border border-[var(--color-border)] bg-[var(--color-surface-2)] pointer-events-none select-none">
          <span className="text-[10px] uppercase tracking-widest text-[var(--color-text-muted)]">
            Vol
          </span>
          <span
            className="font-mono text-xs font-semibold"
            style={{ color: volumeTooltip.isGreen ? 'var(--color-green)' : 'var(--color-red)' }}
          >
            {volumeTooltip.formatted}
          </span>
        </div>
      )}
    </div>
  )
}
