import { BarChart2 } from 'lucide-react'

export function TopBar() {
  return (
    <header className="flex items-center gap-3 px-4 h-12 border-b border-[var(--color-border)] bg-[var(--color-surface)] shrink-0">
      <BarChart2 className="w-5 h-5 text-[var(--color-accent)]" />
      <span className="font-semibold tracking-tight text-[var(--color-text)]">
        MarketPulse
      </span>
      <div className="ml-auto flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-green)] animate-pulse" />
          Live
        </span>
      </div>
    </header>
  )
}
