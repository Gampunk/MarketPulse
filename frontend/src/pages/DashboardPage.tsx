import { useWatchlistStore } from '@/stores/watchlist'

export function DashboardPage() {
  const activeSymbol = useWatchlistStore((s) => s.activeSymbol)

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
      </div>

      <div className="flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] flex items-center justify-center">
        <p className="text-sm text-[var(--color-text-muted)]">
          Chart component — Phase 3
        </p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {(['Price', 'Change 24h', 'Volume', 'Market Cap'] as const).map((label) => (
          <div
            key={label}
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3"
          >
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-muted)] mb-1">
              {label}
            </p>
            <p className="text-sm font-mono text-[var(--color-text-muted)]">
              —
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
