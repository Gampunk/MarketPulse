import { TrendingUp, X } from 'lucide-react'
import { useWatchlistStore } from '@/stores/watchlist'
import { useMarketStore } from '@/stores/market'
import { AddSymbolSearch } from '@/components/watchlist/AddSymbolSearch'
import { formatPrice, formatChange } from '@/lib/formatters'
import { cn } from '@/lib/utils'
import type { CoinMeta } from '@/types/metadata'

export function Sidebar() {
  const { items, activeSymbol, setActiveSymbol, removeSymbol } = useWatchlistStore()

  return (
    <aside className="w-56 shrink-0 flex flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="px-3 py-2 border-b border-[var(--color-border)]">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-muted)]">
          Watchlist
        </p>
      </div>

      <nav className="flex-1 overflow-y-auto py-1">
        {items.map((item) => (
          <WatchlistRow
            key={item.symbol}
            symbol={item.symbol}
            isActive={activeSymbol === item.symbol}
            onSelect={() => setActiveSymbol(item.symbol)}
            onRemove={() => removeSymbol(item.symbol)}
          />
        ))}
      </nav>

      <div className="border-t border-[var(--color-border)]">
        <AddSymbolSearch />
      </div>
    </aside>
  )
}

interface WatchlistRowProps {
  symbol: string
  isActive: boolean
  onSelect: () => void
  onRemove: () => void
}

function WatchlistRow({ symbol, isActive, onSelect, onRemove }: WatchlistRowProps) {
  const price = useMarketStore(s => s.tickers[symbol])
  const meta = useMarketStore(s => s.getCoinMeta(symbol))

  return (
    <div className="group relative">
      <button
        onClick={onSelect}
        className={cn(
          'w-full flex items-start gap-2 px-3 pr-7 py-2 transition-colors text-left',
          isActive
            ? 'bg-[var(--color-surface-2)] text-[var(--color-text)]'
            : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)]'
        )}
      >
        <CoinIcon meta={meta} />
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-1.5 min-w-0">
            <span className="font-mono text-xs font-medium truncate">
              {symbol.replace(/USDT$/, '')}
            </span>
            {meta && (
              <span className="text-[10px] text-[var(--color-text-muted)] truncate hidden group-hover:hidden">
                #{meta.marketCapRank}
              </span>
            )}
          </div>
          {meta && (
            <span className="block text-[10px] text-[var(--color-text-muted)] truncate leading-none mb-0.5">
              {meta.name}
            </span>
          )}
          {price ? (
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-xs text-[var(--color-text)]">
                ${formatPrice(price.price)}
              </span>
              <span
                className={cn(
                  'font-mono text-[10px] font-medium',
                  price.changePct24h >= 0
                    ? 'text-[var(--color-green)]'
                    : 'text-[var(--color-red)]'
                )}
              >
                {formatChange(price.changePct24h)}
              </span>
            </div>
          ) : (
            <span className="block text-[10px] text-[var(--color-text-muted)] animate-pulse">
              —
            </span>
          )}
        </div>
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation()
          onRemove()
        }}
        aria-label={`Remove ${symbol}`}
        className="absolute right-2 top-2.5 opacity-0 group-hover:opacity-100 transition-opacity text-[var(--color-text-muted)] hover:text-[var(--color-red)] p-0.5"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  )
}

function CoinIcon({ meta }: { meta: CoinMeta | undefined }) {
  if (meta) {
    return (
      <img
        src={meta.logoUrl}
        alt={meta.name}
        className="w-4 h-4 shrink-0 rounded-full mt-0.5"
        onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
      />
    )
  }
  return <TrendingUp className="w-3.5 h-3.5 shrink-0 text-[var(--color-accent)] mt-0.5" />
}
