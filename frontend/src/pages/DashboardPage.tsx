import { useWatchlistStore } from '@/stores/watchlist'
import { usePricesStore } from '@/stores/prices'
import { formatPrice, formatVolume, formatChange } from '@/lib/formatters'
import { cn } from '@/lib/utils'

export function DashboardPage() {
  const activeSymbol = useWatchlistStore(s => s.activeSymbol)
  const price = usePricesStore(s => s.prices[activeSymbol])

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
        {price && (
          <div className="text-right">
            <p className="text-xl font-mono font-semibold text-[var(--color-text)]">
              ${formatPrice(price.price)}
            </p>
            <p
              className={cn(
                'text-sm font-mono font-medium',
                price.changePct24h >= 0 ? 'text-[var(--color-green)]' : 'text-[var(--color-red)]'
              )}
            >
              {formatChange(price.changePct24h)}
            </p>
          </div>
        )}
      </div>

      <div className="flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] flex items-center justify-center">
        <p className="text-sm text-[var(--color-text-muted)]">
          Chart component — Phase 3
        </p>
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
        <StatCard label="High / Low" value={price ? `$${formatPrice(price.high24h)} / $${formatPrice(price.low24h)}` : null} />
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
      <p className={cn('text-sm font-mono', value ? 'text-[var(--color-text)]' : 'text-[var(--color-text-muted)]', valueClass)}>
        {value ?? '—'}
      </p>
    </div>
  )
}
