import { useState } from 'react'
import { useWatchlistStore } from '@/stores/watchlist'
import { useMarketStore } from '@/stores/market'
import { CandlestickChart } from '@/components/charts/CandlestickChart'
import { TimeframeSelector } from '@/components/charts/TimeframeSelector'
import { formatPrice, formatVolume, formatChange } from '@/lib/formatters'
import { cn } from '@/lib/utils'
import type { Interval } from '@/types/market'

export function DashboardPage() {
  const activeSymbol = useWatchlistStore(s => s.activeSymbol)
  const price = useMarketStore(s => s.tickers[activeSymbol])
  const [interval, setSelectedInterval] = useState<Interval>('1m')

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-[var(--color-text)]">
            {activeSymbol}
          </h1>
          <p className="text-xs text-[var(--color-text-muted)]">
            Real-time market data
          </p>
        </div>
        <div className="flex items-center gap-6">
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

      <div className="flex-1 rounded-lg border border-[var(--color-border)] overflow-hidden min-h-0">
        <CandlestickChart symbol={activeSymbol} interval={interval} />
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
