'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react'
import { useCart, cartSubtotal, cartCount, cartSavings } from '@/store/cart'
import { SmartImage } from '@/components/ui/SmartImage'
import { formatTaka, toBn, cn } from '@/lib/utils'

export function CartDrawer({ freeDeliveryAbove }: { freeDeliveryAbove: number }) {
  const { items, isOpen, closeCart, increment, decrement, remove } = useCart()

  const subtotal = cartSubtotal(items)
  const count = cartCount(items)
  const savings = cartSavings(items)
  const remaining = Math.max(0, freeDeliveryAbove - subtotal)
  const progress =
    freeDeliveryAbove > 0 ? Math.min(100, (subtotal / freeDeliveryAbove) * 100) : 100

  // Esc চাপলে বন্ধ হবে
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeCart()
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [isOpen, closeCart])

  return (
    <div
      className={cn('fixed inset-0 z-[60]', isOpen ? 'pointer-events-auto' : 'pointer-events-none')}
      aria-hidden={!isOpen}
    >
      <div
        onClick={closeCart}
        className={cn(
          'absolute inset-0 bg-brand-950/45 transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'opacity-0'
        )}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="আপনার কার্ট"
        className={cn(
          'absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-cream-50 shadow-2xl transition-transform duration-300',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <header className="flex items-center justify-between border-b border-brand-100 bg-white px-5 py-4">
          <h2 className="flex items-center gap-2 font-[family-name:var(--font-display)] text-lg font-bold text-brand-900">
            <ShoppingBag size={20} />
            আপনার কার্ট
            {count > 0 && (
              <span className="rounded-full bg-brand-700 px-2 py-0.5 text-xs font-semibold text-white">
                {toBn(count)}
              </span>
            )}
          </h2>
          <button
            type="button"
            onClick={closeCart}
            aria-label="কার্ট বন্ধ করুন"
            className="grid h-9 w-9 place-items-center rounded-full text-brand-800 hover:bg-brand-50"
          >
            <X size={20} />
          </button>
        </header>

        {/* ফ্রি ডেলিভারির অগ্রগতি */}
        {freeDeliveryAbove > 0 && items.length > 0 && (
          <div className="border-b border-brand-100 bg-white px-5 py-3">
            {remaining > 0 ? (
              <p className="text-xs text-muted">
                আর <strong className="text-brand-800">{formatTaka(remaining)}</strong> কিনলেই
                ডেলিভারি ফ্রি!
              </p>
            ) : (
              <p className="text-xs font-semibold text-emerald-700">
                অভিনন্দন! আপনার ডেলিভারি চার্জ ফ্রি 🎉
              </p>
            )}
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-cream-200">
              <div
                className="h-full rounded-full bg-gold-500 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* পণ্যের তালিকা */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <ShoppingBag size={48} className="mb-4 text-brand-200" />
              <p className="font-semibold text-brand-900">কার্ট এখনো খালি</p>
              <p className="mt-1 mb-5 text-sm text-muted">
                পছন্দের শাড়িটি খুঁজে নিন, আমরা পৌঁছে দেব।
              </p>
              <Link
                href="/products"
                onClick={closeCart}
                className="rounded-full bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-800"
              >
                কেনাকাটা শুরু করুন
              </Link>
            </div>
          ) : (
            <ul className="space-y-3">
              {items.map((item) => (
                <li
                  key={item.key}
                  className="flex gap-3 rounded-2xl border border-brand-100 bg-white p-3"
                >
                  <Link
                    href={`/products/${item.slug}`}
                    onClick={closeCart}
                    className="relative h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-cream-100"
                  >
                    <SmartImage
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </Link>

                  <div className="flex min-w-0 flex-1 flex-col">
                    <Link
                      href={`/products/${item.slug}`}
                      onClick={closeCart}
                      className="line-clamp-2 text-sm font-semibold text-ink hover:text-brand-700"
                    >
                      {item.name}
                    </Link>

                    {(item.size || item.color) && (
                      <p className="mt-0.5 text-xs text-muted">
                        {[item.size, item.color].filter(Boolean).join(' • ')}
                      </p>
                    )}

                    <p className="mt-1 text-sm font-bold text-brand-800">
                      {formatTaka(item.price)}
                    </p>

                    <div className="mt-auto flex items-center justify-between pt-2">
                      <div className="flex items-center rounded-full border border-brand-200">
                        <button
                          type="button"
                          onClick={() => decrement(item.key)}
                          disabled={item.quantity <= 1}
                          aria-label="সংখ্যা কমান"
                          className="grid h-7 w-7 place-items-center rounded-full text-brand-800 hover:bg-brand-50 disabled:opacity-40"
                        >
                          <Minus size={13} />
                        </button>
                        <span className="w-8 text-center text-sm font-semibold">
                          {toBn(item.quantity)}
                        </span>
                        <button
                          type="button"
                          onClick={() => increment(item.key)}
                          disabled={item.quantity >= item.stock}
                          aria-label="সংখ্যা বাড়ান"
                          className="grid h-7 w-7 place-items-center rounded-full text-brand-800 hover:bg-brand-50 disabled:opacity-40"
                        >
                          <Plus size={13} />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => remove(item.key)}
                        aria-label={`${item.name} সরিয়ে ফেলুন`}
                        className="grid h-8 w-8 place-items-center rounded-full text-rose-600 hover:bg-rose-50"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* নিচের অংশ */}
        {items.length > 0 && (
          <footer className="border-t border-brand-100 bg-white px-5 py-4">
            {savings > 0 && (
              <p className="mb-2 text-xs font-medium text-emerald-700">
                আপনি সাশ্রয় করছেন {formatTaka(savings)}
              </p>
            )}
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-muted">মোট (ডেলিভারি ছাড়া)</span>
              <span className="text-xl font-bold text-brand-800">{formatTaka(subtotal)}</span>
            </div>

            <Link
              href="/checkout"
              onClick={closeCart}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-brand-700 py-3 font-semibold text-white transition-colors hover:bg-brand-800"
            >
              অর্ডার করুন
              <ArrowRight size={18} />
            </Link>
            <Link
              href="/cart"
              onClick={closeCart}
              className="mt-2 block w-full rounded-full py-2 text-center text-sm font-medium text-brand-800 hover:bg-brand-50"
            >
              কার্ট বিস্তারিত দেখুন
            </Link>
          </footer>
        )}
      </aside>
    </div>
  )
}
