import Link from 'next/link'
import { cn } from '@/lib/utils'

/* ----------------------------- বোতাম ----------------------------- */

const VARIANTS = {
  primary:
    'bg-brand-700 text-white hover:bg-brand-800 active:bg-brand-900 shadow-sm disabled:bg-brand-300',
  gold: 'bg-gold-500 text-brand-950 hover:bg-gold-400 active:bg-gold-600 shadow-sm',
  outline:
    'border border-brand-700 text-brand-800 bg-transparent hover:bg-brand-50 active:bg-brand-100',
  ghost: 'text-brand-800 hover:bg-brand-50 active:bg-brand-100',
  soft: 'bg-cream-200 text-ink hover:bg-cream-300',
  danger: 'bg-rose-600 text-white hover:bg-rose-700',
} as const

const SIZES = {
  sm: 'px-3 py-1.5 text-sm gap-1.5',
  md: 'px-4 py-2.5 text-sm gap-2',
  lg: 'px-6 py-3 text-base gap-2',
} as const

export type ButtonVariant = keyof typeof VARIANTS
export type ButtonSize = keyof typeof SIZES

export function buttonClass(
  variant: ButtonVariant = 'primary',
  size: ButtonSize = 'md',
  extra?: string
) {
  return cn(
    'inline-flex items-center justify-center rounded-full font-semibold transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-60',
    VARIANTS[variant],
    SIZES[size],
    extra
  )
}

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  ...rest
}: ButtonProps) {
  return <button className={buttonClass(variant, size, className)} {...rest} />
}

type LinkButtonProps = React.ComponentProps<typeof Link> & {
  variant?: ButtonVariant
  size?: ButtonSize
}

export function LinkButton({
  variant = 'primary',
  size = 'md',
  className,
  ...rest
}: LinkButtonProps) {
  return <Link className={buttonClass(variant, size, className)} {...rest} />
}

/* --------------------------- সেকশনের শিরোনাম --------------------------- */

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  align = 'left',
}: {
  eyebrow?: string
  title: string
  description?: string
  action?: React.ReactNode
  align?: 'left' | 'center'
}) {
  return (
    <div
      className={cn(
        'mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between',
        align === 'center' && 'sm:flex-col sm:items-center'
      )}
    >
      <div className={cn('max-w-2xl', align === 'center' && 'text-center')}>
        {eyebrow && (
          <p className="mb-1 text-xs font-semibold tracking-[0.18em] text-gold-700 uppercase">
            {eyebrow}
          </p>
        )}
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-brand-900 sm:text-3xl">
          {title}
        </h2>
        {description && (
          <p className="mt-2 text-sm text-muted text-balance-bn">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

/* ------------------------------ ব্যাজ ------------------------------ */

export function Badge({
  children,
  tone = 'brand',
  className,
}: {
  children: React.ReactNode
  tone?: 'brand' | 'gold' | 'green' | 'gray' | 'rose'
  className?: string
}) {
  const tones = {
    brand: 'bg-brand-700 text-white',
    gold: 'bg-gold-400 text-brand-950',
    green: 'bg-emerald-600 text-white',
    gray: 'bg-cream-300 text-ink',
    rose: 'bg-rose-600 text-white',
  }
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-[0.7rem] font-semibold',
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  )
}

/* --------------------------- খালি অবস্থা --------------------------- */

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-brand-200 bg-cream-50 px-6 py-16 text-center">
      {icon && <div className="mb-4 text-brand-300">{icon}</div>}
      <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold text-brand-900">
        {title}
      </h3>
      {description && <p className="mt-2 max-w-md text-sm text-muted">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}

/* ---------------------------- কার্ডের খোল ---------------------------- */

export function Card({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-brand-100 bg-white p-5 shadow-(--shadow-soft)',
        className
      )}
    >
      {children}
    </div>
  )
}

/* ------------------------- লোডিং স্কেলিটন ------------------------- */

export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-brand-100 bg-white">
      <div className="skeleton aspect-3/4 w-full" />
      <div className="space-y-2 p-4">
        <div className="skeleton h-3 w-1/3 rounded" />
        <div className="skeleton h-4 w-4/5 rounded" />
        <div className="skeleton h-5 w-1/2 rounded" />
      </div>
    </div>
  )
}
