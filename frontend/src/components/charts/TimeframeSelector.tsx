import { cn } from '@/lib/utils'
import type { Interval } from '@/types/market'

const TIMEFRAMES: { label: string; value: Interval }[] = [
  { label: '1m',  value: '1m'  },
  { label: '5m',  value: '5m'  },
  { label: '15m', value: '15m' },
  { label: '1h',  value: '1h'  },
  { label: '4h',  value: '4h'  },
  { label: '1D',  value: '1d'  },
]

interface Props {
  selected: Interval
  onChange: (interval: Interval) => void
}

export function TimeframeSelector({ selected, onChange }: Props) {
  return (
    <div className="flex items-center gap-0.5">
      {TIMEFRAMES.map(({ label, value }) => (
        <button
          key={value}
          onClick={() => onChange(value)}
          className={cn(
            'px-2 py-1 text-xs font-mono rounded transition-colors',
            selected === value
              ? 'bg-[var(--color-accent)] text-white'
              : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)]'
          )}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
