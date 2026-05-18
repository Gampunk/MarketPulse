import { useRef, useState, useEffect } from 'react'
import { createChart } from 'lightweight-charts'
import type { IChartApi, ISeriesApi, DeepPartial, ChartOptions } from 'lightweight-charts'
import type { SeriesKey } from '@/types/chart'

export interface ChartEngine {
  chartRef: { readonly current: IChartApi | null }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  addSeries(key: SeriesKey, definition: any, options?: any): ISeriesApi<any>
  removeSeries(key: SeriesKey): void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getSeries(key: SeriesKey): ISeriesApi<any> | undefined
  clearAllSeries(): void
  isReady: boolean
}

// Owns the TradingView chart instance lifecycle and a named series registry.
// Consumers call addSeries/removeSeries by key — never touch chartRef.current.addSeries() directly.
// Future indicator hooks compose with the chart via this engine API (see ARCHITECTURE.md).
export function useChartEngine(
  containerRef: { readonly current: HTMLDivElement | null },
  options: DeepPartial<ChartOptions>
): ChartEngine {
  const chartRef = useRef<IChartApi | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const registryRef = useRef<Map<SeriesKey, ISeriesApi<any>>>(new Map())
  const [isReady, setIsReady] = useState(false)

  // Capture options in a ref so the chart creation effect has no option deps.
  // Chart options are set at creation time — dynamic option changes use chart.applyOptions()
  // externally, not by recreating the chart.
  const optionsRef = useRef(options)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const chart = createChart(container, optionsRef.current)
    chartRef.current = chart
    setIsReady(true)

    return () => {
      // Teardown: remove all tracked series first, then destroy chart
      registryRef.current.forEach(s => {
        try { chart.removeSeries(s) } catch { /* already removed */ }
      })
      registryRef.current.clear()
      chart.remove()
      chartRef.current = null
      setIsReady(false)
    }
  // containerRef is a stable object ref — omitted from deps intentionally
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function addSeries(
    key: SeriesKey,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    definition: any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    options?: any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): ISeriesApi<any> {
    const chart = chartRef.current
    if (!chart) throw new Error(`useChartEngine: addSeries('${key}') called before chart is ready`)

    // Replace existing series if key is already registered
    const existing = registryRef.current.get(key)
    if (existing) {
      try { chart.removeSeries(existing) } catch { /* already removed */ }
      registryRef.current.delete(key)
    }

    const series = chart.addSeries(definition, options ?? {})
    registryRef.current.set(key, series)
    return series
  }

  function removeSeries(key: SeriesKey): void {
    const chart = chartRef.current
    const series = registryRef.current.get(key)
    if (!series) return
    if (chart) {
      try { chart.removeSeries(series) } catch { /* already removed */ }
    }
    registryRef.current.delete(key)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function getSeries(key: SeriesKey): ISeriesApi<any> | undefined {
    return registryRef.current.get(key)
  }

  function clearAllSeries(): void {
    const chart = chartRef.current
    registryRef.current.forEach(s => {
      if (chart) {
        try { chart.removeSeries(s) } catch { /* already removed */ }
      }
    })
    registryRef.current.clear()
  }

  return { chartRef, addSeries, removeSeries, getSeries, clearAllSeries, isReady }
}
