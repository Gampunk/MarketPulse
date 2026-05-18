import { cn } from '@/lib/utils'
import type { ChartType } from '@/types/chart'

const CHART_TYPES: { label: string; value: ChartType }[] = [
  { label: 'Candles', value: 'candlestick' },
  { label: 'Line',    value: 'line'        },
]

interface Props {
  type: ChartType
  onChange: (type: ChartType) => void
}

export function ChartTypeSelector({ type, onChange }: Props) {
  return (
    <div className="flex items-center gap-0.5">
      {CHART_TYPES.map(({ label, value }) => (
        <button
          key={value}
          onClick={() => onChange(value)}
          className={cn(
            'px-2 py-1 text-xs font-mono rounded transition-colors',
            type === value
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
