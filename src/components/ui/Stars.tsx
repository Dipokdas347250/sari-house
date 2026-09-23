import { Star } from 'lucide-react'
import { toBn, cn } from '@/lib/utils'

export function Stars({
  rating,
  count,
  size = 14,
  showCount = true,
  className,
}: {
  rating: number
  count?: number
  size?: number
  showCount?: boolean
  className?: string
}) {
  const rounded = Math.round(rating * 2) / 2

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div
        className="flex items-center gap-0.5"
        role="img"
        aria-label={`৫ এর মধ্যে ${toBn(rating.toFixed(1))} রেটিং`}
      >
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            width={size}
            height={size}
            aria-hidden
            className={
              i <= rounded
                ? 'fill-gold-400 text-gold-400'
                : i - 0.5 === rounded
                  ? 'fill-gold-200 text-gold-400'
                  : 'fill-transparent text-cream-300'
            }
          />
        ))}
      </div>
      {showCount && (
        <span className="text-xs text-muted">
          {count && count > 0 ? `(${toBn(count)})` : '(নতুন)'}
        </span>
      )}
    </div>
  )
}
