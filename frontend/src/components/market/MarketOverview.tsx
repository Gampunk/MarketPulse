import { memo, useState } from 'react'
import { useMarketStore } from '@/stores/market'
import { formatChange, formatVolume, formatPrice } from '@/lib/formatters'
import { cn } from '@/lib/utils'
import type { TopMoverCoin } from '@/types/metadata'

type MoverTab = 'gainers' | 'losers'

function formatRelativeTime(ts: number | null): string {
  if (!ts) return '—'
  const mins = Math.floor((Date.now() - ts) / 60_000)
  if (mins < 1) return 'Just now'
  if (mins === 1) return '1 min ago'
  return `${mins} min ago`
}

// memo() prevents re-renders driven by DashboardPage's price-tick subscription.
// MarketOverview only re-renders when the analytics slice changes (~every 15 min).
export const MarketOverview = memo(function MarketOverview() {
  const [activeTab, setActiveTab] = useState<MoverTab>('gainers')
  const analytics = useMarketStore(s => s.analytics)
  const { topGainers, topLosers, globalStats, lastRefreshedAt } = analytics
  const hasData = globalStats !== null

  const activeCoins = activeTab === 'gainers' ? topGainers : topLosers

  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">

      {/* ── Global stats bar ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-5 px-4 py-2 border-b border-[var(--color-border)] bg-[var(--color-surface-2)]">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-muted)] shrink-0">
          Market Overview
        </span>

        {hasData ? (
          <div className="flex items-center gap-5 flex-1 min-w-0">
            <GlobalStat
              label="Market Cap"
              value={`$${formatVolume(globalStats.totalMarketCapUsd)}`}
            />
            <GlobalStat
              label="BTC Dom."
              value={`${globalStats.btcDominancePct.toFixed(1)}%`}
            />
            <GlobalStat
              label="24h Change"
              value={formatChange(globalStats.marketCapChange24hPct)}
              valueClass={
                globalStats.marketCapChange24hPct >= 0
                  ? 'text-[var(--color-green)]'
                  : 'text-[var(--color-red)]'
              }
            />
          </div>
        ) : (
          <span className="text-xs text-[var(--color-text-muted)] animate-pulse flex-1">
            Loading market data…
          </span>
        )}

        <span className="text-[10px] text-[var(--color-text-muted)] shrink-0 ml-auto">
          {formatRelativeTime(lastRefreshedAt)}
        </span>
      </div>

      {/* ── Tab bar ──────────────────────────────────────────────────────── */}
      <div className="flex border-b border-[var(--color-border)] bg-[var(--color-surface-2)]">
        <TabButton
          label="Top Gainers"
          active={activeTab === 'gainers'}
          count={topGainers.length}
          onClick={() => setActiveTab('gainers')}
          accentClass="text-[var(--color-green)]"
        />
        <TabButton
          label="Top Losers"
          active={activeTab === 'losers'}
          count={topLosers.length}
          onClick={() => setActiveTab('losers')}
          accentClass="text-[var(--color-red)]"
        />
      </div>

      {/* ── Mover list ───────────────────────────────────────────────────── */}
      <div>
        {activeCoins.length === 0
          ? <SkeletonRows />
          : activeCoins.map(coin => <MoverRow key={coin.id} coin={coin} />)
        }
      </div>
    </div>
  )
})

// ─── Sub-components ───────────────────────────────────────────────────────────

interface GlobalStatProps {
  label: string
  value: string
  valueClass?: string
}

function GlobalStat({ label, value, valueClass }: GlobalStatProps) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span className="text-[10px] text-[var(--color-text-muted)]">{label}</span>
      <span className={cn('font-mono text-xs font-medium text-[var(--color-text)]', valueClass)}>
        {value}
      </span>
    </div>
  )
}

interface TabButtonProps {
  label: string
  active: boolean
  count: number
  onClick: () => void
  accentClass: string
}

function TabButton({ label, active, count, onClick, accentClass }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 px-4 py-2 text-xs font-medium transition-colors border-b-2 -mb-px',
        active
          ? `border-current ${accentClass}`
          : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
      )}
    >
      {label}
      {count > 0 && (
        <span className={cn(
          'text-[10px] font-mono px-1 rounded',
          active ? 'bg-current/10' : 'bg-[var(--color-surface-2)]'
        )}>
          {count}
        </span>
      )}
    </button>
  )
}

function MoverRow({ coin }: { coin: TopMoverCoin }) {
  return (
    <div className="flex items-center gap-3 px-4 py-2 hover:bg-[var(--color-surface-2)] transition-colors">
      <img
        src={coin.logoUrl}
        alt={coin.name}
        className="w-5 h-5 rounded-full shrink-0"
        onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
      />
      <div className="flex-1 min-w-0">
        <span className="font-mono text-xs font-semibold text-[var(--color-text)] block">
          {coin.symbol.toUpperCase()}
        </span>
        <span className="text-[10px] text-[var(--color-text-muted)] truncate block leading-none">
          {coin.name}
        </span>
      </div>
      <div className="text-right shrink-0">
        <span className="font-mono text-xs text-[var(--color-text)] block">
          ${formatPrice(coin.priceUsd)}
        </span>
        <span
          className={cn(
            'font-mono text-[10px] font-semibold block',
            coin.changePct24h >= 0 ? 'text-[var(--color-green)]' : 'text-[var(--color-red)]'
          )}
        >
          {formatChange(coin.changePct24h)}
        </span>
      </div>
    </div>
  )
}

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-2">
          <div className="w-5 h-5 rounded-full bg-[var(--color-surface-2)] animate-pulse shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-2.5 w-12 rounded bg-[var(--color-surface-2)] animate-pulse" />
            <div className="h-2 w-20 rounded bg-[var(--color-surface-2)] animate-pulse" />
          </div>
          <div className="space-y-1.5 text-right">
            <div className="h-2.5 w-16 rounded bg-[var(--color-surface-2)] animate-pulse ml-auto" />
            <div className="h-2 w-10 rounded bg-[var(--color-surface-2)] animate-pulse ml-auto" />
          </div>
        </div>
      ))}
    </>
  )
}
