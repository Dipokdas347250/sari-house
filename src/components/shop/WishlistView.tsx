'use client'

import Link from 'next/link'
import { Heart, Trash2, ShoppingBag } from 'lucide-react'
import { toast } from 'sonner'
import { useWishlist } from '@/store/wishlist'
import { useHydrated } from '@/lib/use-hydrated'
import { SmartImage } from '@/components/ui/SmartImage'
import { Price } from '@/components/ui/Price'
import { EmptyState, LinkButton } from '@/components/ui/kit'
import { toBn } from '@/lib/utils'

export function WishlistView() {
  const { items, remove, clear } = useWishlist()
  const hydrated = useHydrated()

  if (!hydrated) {
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="skeleton aspect-3/4 rounded-2xl" />
        ))}
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={<Heart size={48} />}
        title="পছন্দের তালিকা খালি"
        description="যে পণ্যগুলো ভালো লাগবে, সেগুলোর পাশের ❤ চিহ্নে চাপ দিলে এখানে জমা থাকবে।"
        action={
          <LinkButton href="/products" variant="primary" size="lg">
            পণ্য দেখুন
          </LinkButton>
        }
      />
    )
  }

  return (
    <>
      <div className="mb-5 flex items-center justify-between">
        <p className="text-sm text-muted">{toBn(items.length)} টি পণ্য সংরক্ষিত আছে</p>
        <button
          type="button"
          onClick={() => {
            clear()
            toast.info('তালিকা খালি করা হয়েছে')
          }}
          className="rounded-full px-3 py-1.5 text-sm font-medium text-rose-600 hover:bg-rose-50"
        >
          সব সরিয়ে ফেলুন
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
        {items.map((item) => (
          <article
            key={item.productId}
            className="group overflow-hidden rounded-2xl border border-brand-100 bg-white"
          >
            <Link
              href={`/products/${item.slug}`}
              className="relative block aspect-3/4 overflow-hidden bg-cream-100"
            >
              <SmartImage
                src={item.image}
                alt={item.name}
                fill
                sizes="(max-width: 640px) 50vw, 25vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </Link>

            <div className="p-4">
              <h3 className="line-clamp-2 text-sm font-semibold text-ink">
                <Link href={`/products/${item.slug}`} className="hover:text-brand-700">
                  {item.name}
                </Link>
              </h3>

              <div className="mt-2">
                <Price price={item.price} comparePrice={item.comparePrice} size="sm" />
              </div>

              <div className="mt-3 flex gap-2">
                <Link
                  href={`/products/${item.slug}`}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-brand-700 py-2 text-xs font-semibold text-white hover:bg-brand-800"
                >
                  <ShoppingBag size={14} />
                  কিনুন
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    remove(item.productId)
                    toast.info('তালিকা থেকে সরানো হয়েছে', { description: item.name })
                  }}
                  aria-label={`${item.name} সরিয়ে ফেলুন`}
                  className="grid h-8 w-8 place-items-center rounded-full text-rose-600 hover:bg-rose-50"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </>
  )
}
