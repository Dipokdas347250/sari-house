import { formatTaka, toBn, discountPercent, cn } from '@/lib/utils'

export function Price({
  price,
  comparePrice,
  size = 'md',
  className,
}: {
  price: number
  comparePrice?: number | null
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  const off = discountPercent(price, comparePrice)
  const sizes = {
    sm: { now: 'text-base', was: 'text-xs', off: 'text-[0.68rem]' },
    md: { now: 'text-lg', was: 'text-sm', off: 'text-xs' },
    lg: { now: 'text-3xl', was: 'text-base', off: 'text-sm' },
  }[size]

  return (
    <div className={cn('flex flex-wrap items-baseline gap-x-2 gap-y-1', className)}>
      <span className={cn('font-bold text-brand-800', sizes.now)}>
        {formatTaka(price)}
      </span>
      {off > 0 && (
        <>
          <span className={cn('text-muted line-through', sizes.was)}>
            {formatTaka(comparePrice!)}
          </span>
          <span
            className={cn(
              'rounded-full bg-gold-100 px-2 py-0.5 font-semibold text-gold-800',
              sizes.off
            )}
          >
            {toBn(off)}% ছাড়
          </span>
        </>
      )}
    </div>
  )
}
