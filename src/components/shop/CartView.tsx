'use client'

import Link from 'next/link'
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, Truck } from 'lucide-react'
import { toast } from 'sonner'
import { useCart, cartSubtotal, cartSavings } from '@/store/cart'
import { useHydrated } from '@/lib/use-hydrated'
import { SmartImage } from '@/components/ui/SmartImage'
import { EmptyState, LinkButton } from '@/components/ui/kit'
import { formatTaka, toBn } from '@/lib/utils'

export function CartView({
  deliveryInside,
  deliveryOutside,
  freeDeliveryAbove,
}: {
  deliveryInside: number
  deliveryOutside: number
  freeDeliveryAbove: number
}) {
  const { items, increment, decrement, remove, clear } = useCart()
  const hydrated = useHydrated()

  if (!hydrated) {
    return (
      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-4">
          {[0, 1].map((i) => (
            <div key={i} className="skeleton h-32 rounded-2xl" />
          ))}
        </div>
        <div className="skeleton h-64 rounded-2xl" />
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={<ShoppingBag size={48} />}
        title="আপনার কার্ট এখনো খালি"
        description="পছন্দের শাড়ি বা পোশাক বেছে নিন — আমরা সারা দেশে পৌঁছে দিই।"
        action={
          <LinkButton href="/products" variant="primary" size="lg">
            কেনাকাটা শুরু করুন
          </LinkButton>
        }
      />
    )
  }

  const subtotal = cartSubtotal(items)
  const savings = cartSavings(items)
  const freeShipping = freeDeliveryAbove > 0 && subtotal >= freeDeliveryAbove
  const remaining = Math.max(0, freeDeliveryAbove - subtotal)

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
      {/* পণ্যের তালিকা */}
      <div>
        <div className="overflow-hidden rounded-2xl border border-brand-100 bg-white">
          <ul>
            {items.map((item, i) => (
              <li
                key={item.key}
                className={`flex gap-4 p-4 sm:p-5 ${i > 0 ? 'border-t border-brand-100' : ''}`}
              >
                <Link
                  href={`/products/${item.slug}`}
                  className="relative h-28 w-22 shrink-0 overflow-hidden rounded-xl bg-cream-100 sm:h-32 sm:w-26"
                >
                  <SmartImage
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="110px"
                    className="object-cover"
                  />
                </Link>

                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link
                        href={`/products/${item.slug}`}
                        className="line-clamp-2 font-semibold text-ink hover:text-brand-700"
                      >
                        {item.name}
                      </Link>
                      {(item.size || item.color) && (
                        <p className="mt-1 text-xs text-muted">
                          {[item.size, item.color].filter(Boolean).join(' • ')}
                        </p>
                      )}
                      <p className="mt-1.5 font-bold text-brand-800">
                        {formatTaka(item.price)}
                        {item.comparePrice && item.comparePrice > item.price && (
                          <span className="ml-2 text-xs font-normal text-muted line-through">
                            {formatTaka(item.comparePrice)}
                          </span>
                        )}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        remove(item.key)
                        toast.info('কার্ট থেকে সরানো হয়েছে', { description: item.name })
                      }}
                      aria-label={`${item.name} সরিয়ে ফেলুন`}
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-rose-600 transition-colors hover:bg-rose-50"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3">
                    <div className="flex items-center rounded-full border border-brand-200">
                      <button
                        type="button"
                        onClick={() => decrement(item.key)}
                        disabled={item.quantity <= 1}
                        aria-label="কমান"
                        className="grid h-9 w-9 place-items-center rounded-full text-brand-800 hover:bg-brand-50 disabled:opacity-40"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-10 text-center text-sm font-semibold">
                        {toBn(item.quantity)}
                      </span>
                      <button
                        type="button"
                        onClick={() => increment(item.key)}
                        disabled={item.quantity >= item.stock}
                        aria-label="বাড়ান"
                        className="grid h-9 w-9 place-items-center rounded-full text-brand-800 hover:bg-brand-50 disabled:opacity-40"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <p className="text-sm text-muted">
                      সাবটোটাল{' '}
                      <strong className="text-ink">
                        {formatTaka(item.price * item.quantity)}
                      </strong>
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <LinkButton href="/products" variant="ghost" size="sm">
            <ArrowLeft size={15} />
            আরও কেনাকাটা করুন
          </LinkButton>

          <button
            type="button"
            onClick={() => {
              clear()
              toast.info('কার্ট খালি করা হয়েছে')
            }}
            className="rounded-full px-3 py-1.5 text-sm font-medium text-rose-600 hover:bg-rose-50"
          >
            কার্ট খালি করুন
          </button>
        </div>
      </div>

      {/* সারাংশ */}
      <aside>
        <div className="sticky top-28 rounded-2xl border border-brand-100 bg-white p-5">
          <h2 className="mb-4 font-[family-name:var(--font-display)] text-lg font-semibold text-brand-900">
            অর্ডারের সারাংশ
          </h2>

          <dl className="space-y-2.5 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">পণ্যের মোট দাম</dt>
              <dd className="font-medium text-ink">{formatTaka(subtotal)}</dd>
            </div>
            {savings > 0 && (
              <div className="flex justify-between text-emerald-700">
                <dt>ছাড়ে সাশ্রয়</dt>
                <dd className="font-medium">− {formatTaka(savings)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-muted">ডেলিভারি চার্জ</dt>
              <dd className="text-right font-medium text-ink">
                {freeShipping ? (
                  <span className="text-emerald-700">ফ্রি</span>
                ) : (
                  <span className="text-xs text-muted">
                    ঢাকায় {formatTaka(deliveryInside)} / বাইরে {formatTaka(deliveryOutside)}
                  </span>
                )}
              </dd>
            </div>
          </dl>

          <div className="mt-4 flex items-baseline justify-between border-t border-brand-100 pt-4">
            <span className="font-semibold text-ink">সর্বমোট</span>
            <span className="text-2xl font-bold text-brand-800">{formatTaka(subtotal)}</span>
          </div>
          <p className="mt-1 text-xs text-muted">ডেলিভারি চার্জ চেকআউটে যোগ হবে</p>

          {freeDeliveryAbove > 0 && !freeShipping && (
            <div className="mt-4 flex items-start gap-2 rounded-xl bg-gold-50 p-3 text-xs text-gold-900">
              <Truck size={15} className="mt-0.5 shrink-0" />
              <span>
                আর <strong>{formatTaka(remaining)}</strong> কিনলেই ডেলিভারি ফ্রি পাবেন।
              </span>
            </div>
          )}

          <Link
            href="/checkout"
            className="mt-5 block w-full rounded-full bg-brand-700 py-3 text-center font-semibold text-white transition-colors hover:bg-brand-800"
          >
            চেকআউটে যান
          </Link>

          <p className="mt-3 text-center text-xs text-muted">
            ক্যাশ অন ডেলিভারি, বিকাশ ও নগদে পেমেন্ট করা যাবে
          </p>
        </div>
      </aside>
    </div>
  )
}
