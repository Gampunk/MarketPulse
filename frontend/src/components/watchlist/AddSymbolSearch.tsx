import { useState, useMemo, useRef, useEffect } from 'react'
import { Plus, Search, X } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useWatchlistStore } from '@/stores/watchlist'
import { binanceSource } from '@/api/market/binance'
import { cn } from '@/lib/utils'

export function AddSymbolSearch() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const { items, addSymbol } = useWatchlistStore()
  const watchedSymbols = useMemo(() => new Set(items.map(i => i.symbol)), [items])

  const { data: symbols, isLoading } = useQuery({
    queryKey: ['supported-symbols'],
    queryFn: () => binanceSource.getSupportedSymbols(),
    staleTime: 60 * 60 * 1000,
    enabled: open,
  })

  const results = useMemo(() => {
    if (!symbols || !query.trim()) return []
    const q = query.toUpperCase().trim()
    return symbols
      .filter(s => !watchedSymbols.has(s.symbol) && (s.symbol.includes(q) || s.baseAsset.includes(q)))
      .slice(0, 12)
  }, [symbols, query, watchedSymbols])

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 0)
    } else {
      setQuery('')
    }
  }, [open])

  function handleAdd(symbol: string) {
    addSymbol(symbol)
    setOpen(false)
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)] transition-colors"
      >
        <Plus className="w-3.5 h-3.5" />
        <span>Add coin</span>
      </button>
    )
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-1.5 px-2 py-1.5 border-t border-[var(--color-border)]">
        <Search className="w-3.5 h-3.5 shrink-0 text-[var(--color-text-muted)]" />
        <input
          ref={inputRef}
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search USDT pairs…"
          className="flex-1 bg-transparent text-xs text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] outline-none min-w-0"
        />
        <button onClick={() => setOpen(false)} className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {query.trim().length > 0 && (
        <div className="max-h-48 overflow-y-auto border-t border-[var(--color-border)]">
          {isLoading && (
            <p className="px-3 py-2 text-xs text-[var(--color-text-muted)]">Loading…</p>
          )}
          {!isLoading && results.length === 0 && (
            <p className="px-3 py-2 text-xs text-[var(--color-text-muted)]">No results</p>
          )}
          {results.map(s => (
            <button
              key={s.symbol}
              onClick={() => handleAdd(s.symbol)}
              className={cn(
                'w-full text-left px-3 py-1.5 text-xs hover:bg-[var(--color-surface-2)] transition-colors',
                'flex items-center justify-between gap-2'
              )}
            >
              <span className="font-mono font-medium text-[var(--color-text)]">{s.baseAsset}</span>
              <span className="text-[var(--color-text-muted)] truncate">{s.symbol}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
