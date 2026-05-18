export type ChartType = 'candlestick' | 'line'

export type SeriesKey = 'price' | 'volume' | string

export interface PriceChartContext {
  symbol: string
  interval: string
  chartType: ChartType
}
