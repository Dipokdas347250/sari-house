import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { cn, toBn } from '@/lib/utils'

export function StatTile({
  label,
  value,
  delta,
  deltaPeriod = 'গত সপ্তাহের তুলনায়',
  upIsGood = true,
  icon,
  href,
}: {
  label: string
  value: string
  /** শতকরা পরিবর্তন; না দিলে দেখানো হবে না */
  delta?: number | null
  deltaPeriod?: string
  upIsGood?: boolean
  icon?: React.ReactNode
  href?: string
}) {
  const hasDelta = delta != null && Number.isFinite(delta)
  const up = hasDelta && delta > 0
  const flat = hasDelta && delta === 0
  const good = up === upIsGood

  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-muted">{label}</p>
        {icon && (
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-700">
            {icon}
          </span>
        )}
      </div>

      {/* বড় সংখ্যায় tabular-nums নয় — proportional figures ভালো দেখায় */}
      <p className="mt-2 font-sans text-2xl font-semibold text-brand-900 sm:text-[1.75rem]">
        {value}
      </p>

      {hasDelta && (
        <p
          className={cn(
            'mt-1.5 flex items-center gap-1 text-xs font-medium',
            flat ? 'text-muted' : good ? 'text-emerald-700' : 'text-rose-700'
          )}
        >
          {!flat &&
            (up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />)}
          {flat ? 'অপরিবর্তিত' : `${toBn(Math.abs(delta).toFixed(0))}%`}
          <span className="font-normal text-muted">{deltaPeriod}</span>
        </p>
      )}
    </>
  )

  const className =
    'rounded-2xl border border-brand-100 bg-white p-5 transition-shadow hover:shadow-(--shadow-soft)'

  if (href) {
    return (
      <a href={href} className={cn(className, 'block')}>
        {content}
      </a>
    )
  }

  return <div className={className}>{content}</div>
}
