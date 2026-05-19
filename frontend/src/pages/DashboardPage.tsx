import { useState } from 'react'
import { useWatchlistStore } from '@/stores/watchlist'
import { useMarketStore } from '@/stores/market'
import { PriceChart } from '@/components/charts/PriceChart'
import { TimeframeSelector } from '@/components/charts/TimeframeSelector'
import { ChartTypeSelector } from '@/components/charts/ChartTypeSelector'
import { formatPrice, formatVolume, formatChange } from '@/lib/formatters'
import { cn } from '@/lib/utils'
import { MarketOverview } from '@/components/market/MarketOverview'
import type { Interval } from '@/types/market'
import type { ChartType } from '@/types/chart'

export function DashboardPage() {
  const activeSymbol = useWatchlistStore(s => s.activeSymbol)
  const price = useMarketStore(s => s.tickers[activeSymbol])
  const meta = useMarketStore(s => s.getCoinMeta(activeSymbol))
  const [interval, setSelectedInterval] = useState<Interval>('1m')
  const [chartType, setChartType] = useState<ChartType>('candlestick')

  return (
    <div className="flex flex-col gap-4 pb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {meta && (
            <img
              src={meta.logoUrl}
              alt={meta.name}
              className="w-8 h-8 rounded-full shrink-0"
              onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
            />
          )}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold text-[var(--color-text)]">
                {meta?.name ?? activeSymbol.replace(/USDT$/, '')}
              </h1>
              {meta && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--color-surface-2)] text-[var(--color-text-muted)]">
                  #{meta.marketCapRank}
                </span>
              )}
            </div>
            <p className="text-xs text-[var(--color-text-muted)]">
              {activeSymbol} · Real-time market data
            </p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <ChartTypeSelector type={chartType} onChange={setChartType} />
          <TimeframeSelector selected={interval} onChange={setSelectedInterval} />
          {price && (
            <div className="text-right">
              <p className="text-xl font-mono font-semibold text-[var(--color-text)]">
                ${formatPrice(price.price)}
              </p>
              <p
                className={cn(
                  'text-sm font-mono font-medium',
                  price.changePct24h >= 0
                    ? 'text-[var(--color-green)]'
                    : 'text-[var(--color-red)]'
                )}
              >
                {formatChange(price.changePct24h)}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="h-[clamp(300px,45vh,560px)] rounded-lg border border-[var(--color-border)] overflow-hidden">
        <PriceChart symbol={activeSymbol} interval={interval} chartType={chartType} />
      </div>

      <div className="grid grid-cols-4 gap-3">
        <StatCard label="Price" value={price ? `$${formatPrice(price.price)}` : null} />
        <StatCard
          label="Change 24h"
          value={price ? formatChange(price.changePct24h) : null}
          valueClass={
            price
              ? price.changePct24h >= 0
                ? 'text-[var(--color-green)]'
                : 'text-[var(--color-red)]'
              : undefined
          }
        />
        <StatCard label="Volume 24h" value={price ? formatVolume(price.volume24h) : null} />
        <StatCard
          label="High / Low"
          value={price ? `$${formatPrice(price.high24h)} / $${formatPrice(price.low24h)}` : null}
        />
      </div>

      <MarketOverview />
    </div>
  )
}

interface StatCardProps {
  label: string
  value: string | null
  valueClass?: string
}

function StatCard({ label, value, valueClass }: StatCardProps) {
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-muted)] mb-1">
        {label}
      </p>
      <p
        className={cn(
          'text-sm font-mono',
          value ? 'text-[var(--color-text)]' : 'text-[var(--color-text-muted)]',
          valueClass
        )}
      >
        {value ?? '—'}
      </p>
    </div>
  )
}
