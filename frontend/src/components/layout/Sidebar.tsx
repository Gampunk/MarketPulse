import { TrendingUp } from 'lucide-react'
import { useWatchlistStore } from '@/stores/watchlist'
import { cn } from '@/lib/utils'

export function Sidebar() {
  const { items, activeSymbol, setActiveSymbol } = useWatchlistStore()

  return (
    <aside className="w-56 shrink-0 flex flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="px-3 py-2 border-b border-[var(--color-border)]">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-muted)]">
          Watchlist
        </p>
      </div>

      <nav className="flex-1 overflow-y-auto py-1">
        {items.map((item) => (
          <button
            key={item.symbol}
            onClick={() => setActiveSymbol(item.symbol)}
            className={cn(
              'w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors text-left',
              activeSymbol === item.symbol
                ? 'bg-[var(--color-surface-2)] text-[var(--color-text)]'
                : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)]'
            )}
          >
            <TrendingUp className="w-3.5 h-3.5 shrink-0 text-[var(--color-accent)]" />
            <span className="font-mono text-xs font-medium">{item.symbol}</span>
          </button>
        ))}
      </nav>

      <div className="px-3 py-2 border-t border-[var(--color-border)]">
        <p className="text-[10px] text-[var(--color-text-muted)] text-center">
          Phase 1 — Foundation
        </p>
      </div>
    </aside>
  )
}
