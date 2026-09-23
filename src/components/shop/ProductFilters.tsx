'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useState, useTransition } from 'react'
import { SlidersHorizontal, X, Check, RotateCcw, Loader2 } from 'lucide-react'
import { SORT_OPTIONS } from '@/lib/constants'
import { cn, toBn, formatTaka } from '@/lib/utils'

export type FilterCategory = { name: string; slug: string; count: number }

export function ProductFilters({
  categories,
  priceRange,
  lockedCategory,
}: {
  categories: FilterCategory[]
  priceRange: { min: number; max: number }
  /** ক্যাটাগরি পেজে ক্যাটাগরি ফিল্টার দেখানো হয় না */
  lockedCategory?: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [open, setOpen] = useState(false)

  // ঠিকানায় থাকা দামের সীমা বদলালে ঘরদুটোও নিজে থেকে বদলে যায়
  const urlMin = searchParams.get('min') ?? ''
  const urlMax = searchParams.get('max') ?? ''
  const [minPrice, setMinPrice] = useState(urlMin)
  const [maxPrice, setMaxPrice] = useState(urlMax)
  const [lastRange, setLastRange] = useState(`${urlMin}|${urlMax}`)
  if (lastRange !== `${urlMin}|${urlMax}`) {
    setLastRange(`${urlMin}|${urlMax}`)
    setMinPrice(urlMin)
    setMaxPrice(urlMax)
  }

  const activeCategory = searchParams.get('category')
  const activeSort = searchParams.get('sort') ?? 'newest'
  const inStockOnly = searchParams.get('stock') === '1'

  const activeCount =
    (activeCategory ? 1 : 0) +
    (searchParams.get('min') || searchParams.get('max') ? 1 : 0) +
    (inStockOnly ? 1 : 0)

  function update(changes: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString())
    for (const [key, value] of Object.entries(changes)) {
      if (value === null || value === '') params.delete(key)
      else params.set(key, value)
    }
    params.delete('page') // ফিল্টার বদলালে প্রথম পাতায় ফিরুন
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false })
    })
  }

  function clearAll() {
    startTransition(() => {
      const params = new URLSearchParams()
      const search = searchParams.get('search')
      if (search) params.set('search', search)
      router.push(params.toString() ? `${pathname}?${params}` : pathname, {
        scroll: false,
      })
    })
  }

  const panel = (
    <div className="space-y-7">
      {/* ক্যাটাগরি */}
      {!lockedCategory && categories.length > 0 && (
        <fieldset>
          <legend className="mb-3 text-sm font-semibold text-brand-900">ক্যাটাগরি</legend>
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => update({ category: null })}
              className={cn(
                'flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm transition-colors',
                !activeCategory
                  ? 'bg-brand-50 font-semibold text-brand-800'
                  : 'text-ink hover:bg-cream-100'
              )}
            >
              সব ক্যাটাগরি
              {!activeCategory && <Check size={15} />}
            </button>
            {categories.map((c) => (
              <button
                key={c.slug}
                type="button"
                onClick={() => update({ category: c.slug })}
                className={cn(
                  'flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm transition-colors',
                  activeCategory === c.slug
                    ? 'bg-brand-50 font-semibold text-brand-800'
                    : 'text-ink hover:bg-cream-100'
                )}
              >
                <span>{c.name}</span>
                <span className="text-xs text-muted">{toBn(c.count)}</span>
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {/* দাম */}
      <fieldset>
        <legend className="mb-1 text-sm font-semibold text-brand-900">দামের সীমা</legend>
        <p className="mb-3 text-xs text-muted">
          {formatTaka(priceRange.min)} — {formatTaka(priceRange.max)}
        </p>
        <div className="flex items-center gap-2">
          <input
            type="number"
            inputMode="numeric"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="সর্বনিম্ন"
            aria-label="সর্বনিম্ন দাম"
            className="w-full rounded-xl border border-brand-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500"
          />
          <span className="text-muted">—</span>
          <input
            type="number"
            inputMode="numeric"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="সর্বোচ্চ"
            aria-label="সর্বোচ্চ দাম"
            className="w-full rounded-xl border border-brand-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500"
          />
        </div>
        <button
          type="button"
          onClick={() => update({ min: minPrice || null, max: maxPrice || null })}
          className="mt-3 w-full rounded-xl bg-brand-700 py-2 text-sm font-semibold text-white hover:bg-brand-800"
        >
          দাম অনুযায়ী দেখুন
        </button>

        <div className="mt-3 flex flex-wrap gap-2">
          {[
            { label: '২০০০ টাকার নিচে', min: null, max: '2000' },
            { label: '২০০০ — ৫০০০', min: '2000', max: '5000' },
            { label: '৫০০০ — ১০০০০', min: '5000', max: '10000' },
            { label: '১০০০০ এর বেশি', min: '10000', max: null },
          ].map((r) => (
            <button
              key={r.label}
              type="button"
              onClick={() => update({ min: r.min, max: r.max })}
              className="rounded-full border border-brand-200 px-3 py-1 text-xs text-ink hover:border-brand-500 hover:bg-brand-50"
            >
              {r.label}
            </button>
          ))}
        </div>
      </fieldset>

      {/* স্টক */}
      <fieldset>
        <legend className="sr-only">স্টক</legend>
        <label className="flex cursor-pointer items-center gap-2.5 text-sm text-ink">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => update({ stock: e.target.checked ? '1' : null })}
            className="h-4 w-4 accent-brand-700"
          />
          শুধু স্টকে আছে এমন পণ্য
        </label>
      </fieldset>

      {activeCount > 0 && (
        <button
          type="button"
          onClick={clearAll}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-brand-200 py-2 text-sm font-medium text-brand-800 hover:bg-brand-50"
        >
          <RotateCcw size={14} />
          ফিল্টার মুছে ফেলুন
        </button>
      )}
    </div>
  )

  return (
    <>
      {/* মোবাইলের জন্য বোতাম + সাজানোর অপশন */}
      <div className="mb-5 flex items-center gap-3 lg:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 rounded-full border border-brand-200 bg-white px-4 py-2 text-sm font-medium text-ink"
        >
          <SlidersHorizontal size={16} />
          ফিল্টার
          {activeCount > 0 && (
            <span className="grid h-5 w-5 place-items-center rounded-full bg-brand-700 text-[0.65rem] font-bold text-white">
              {toBn(activeCount)}
            </span>
          )}
        </button>

        <select
          value={activeSort}
          onChange={(e) => update({ sort: e.target.value })}
          aria-label="সাজান"
          className="flex-1 rounded-full border border-brand-200 bg-white px-4 py-2 text-sm outline-none"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {/* ডেস্কটপ সাইডবার */}
      <aside className="hidden lg:block">
        <div className="sticky top-28 rounded-2xl border border-brand-100 bg-white p-5">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-semibold text-brand-900">
              <SlidersHorizontal size={17} />
              ফিল্টার
            </h2>
            {isPending && <Loader2 size={16} className="animate-spin text-brand-600" />}
          </div>
          {panel}
        </div>
      </aside>

      {/* মোবাইল ড্রয়ার */}
      <div
        className={cn(
          'fixed inset-0 z-[55] lg:hidden',
          open ? 'pointer-events-auto' : 'pointer-events-none'
        )}
        aria-hidden={!open}
      >
        <div
          onClick={() => setOpen(false)}
          className={cn(
            'absolute inset-0 bg-brand-950/40 transition-opacity',
            open ? 'opacity-100' : 'opacity-0'
          )}
        />
        <div
          className={cn(
            'absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-cream-50 transition-transform duration-300',
            open ? 'translate-y-0' : 'translate-y-full'
          )}
        >
          <div className="sticky top-0 flex items-center justify-between border-b border-brand-100 bg-cream-50 px-5 py-4">
            <h2 className="font-semibold text-brand-900">ফিল্টার</h2>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="বন্ধ করুন"
              className="grid h-9 w-9 place-items-center rounded-full hover:bg-brand-50"
            >
              <X size={20} />
            </button>
          </div>
          <div className="px-5 py-5">{panel}</div>
          <div className="sticky bottom-0 border-t border-brand-100 bg-cream-50 px-5 py-4">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="w-full rounded-full bg-brand-700 py-3 font-semibold text-white"
            >
              দেখুন
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

/** ডেস্কটপের উপরের সারির সাজানোর ড্রপডাউন */
export function SortSelect() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  return (
    <select
      value={searchParams.get('sort') ?? 'newest'}
      onChange={(e) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set('sort', e.target.value)
        params.delete('page')
        router.push(`${pathname}?${params}`, { scroll: false })
      }}
      aria-label="সাজান"
      className="hidden rounded-full border border-brand-200 bg-white px-4 py-2 text-sm outline-none lg:block"
    >
      {SORT_OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  )
}
