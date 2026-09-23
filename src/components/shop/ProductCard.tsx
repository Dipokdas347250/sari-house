'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Heart, ShoppingBag, Eye } from 'lucide-react'
import { toast } from 'sonner'
import { SmartImage, firstImage } from '@/components/ui/SmartImage'
import { Price } from '@/components/ui/Price'
import { Stars } from '@/components/ui/Stars'
import { Badge } from '@/components/ui/kit'
import { useCart } from '@/store/cart'
import { useWishlist } from '@/store/wishlist'
import type { ProductSummary } from '@/lib/products'
import { cn, toBn } from '@/lib/utils'

export function ProductCard({
  product,
  priority = false,
}: {
  product: ProductSummary
  priority?: boolean
}) {
  const router = useRouter()
  const add = useCart((s) => s.add)
  const wishlistItems = useWishlist((s) => s.items)
  const toggleWish = useWishlist((s) => s.toggle)
  const [hovered, setHovered] = useState(false)

  const inWishlist = wishlistItems.some((i) => i.productId === product.id)
  const outOfStock = product.stock <= 0
  const needsChoice = product.sizes.length > 1 || product.colors.length > 1
  const cover = firstImage(product.images)
  const second = product.images[1]

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()

    if (outOfStock) return

    if (needsChoice) {
      router.push(`/products/${product.slug}`)
      return
    }

    add({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: cover,
      price: product.price,
      comparePrice: product.comparePrice,
      quantity: 1,
      size: product.sizes[0] ?? null,
      color: product.colors[0]?.name ?? null,
      stock: product.stock,
    })
    toast.success('কার্টে যোগ হয়েছে', { description: product.name })
  }

  function handleWish(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    const added = toggleWish({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: cover,
      price: product.price,
      comparePrice: product.comparePrice,
    })
    toast[added ? 'success' : 'info'](
      added ? 'পছন্দের তালিকায় যোগ হয়েছে' : 'পছন্দের তালিকা থেকে সরানো হয়েছে',
      { description: product.name }
    )
  }

  return (
    <article
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-brand-100 bg-white transition-shadow duration-300 hover:shadow-(--shadow-soft)"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link
        href={`/products/${product.slug}`}
        className="relative block aspect-3/4 overflow-hidden bg-cream-100"
      >
        <SmartImage
          src={cover}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          priority={priority}
          className={cn(
            'object-cover transition-all duration-500',
            hovered && second ? 'scale-105 opacity-0' : 'scale-100 opacity-100'
          )}
        />
        {second && (
          <SmartImage
            src={second}
            alt={`${product.name} — অন্য দিক`}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={cn(
              'object-cover transition-all duration-500',
              hovered ? 'scale-105 opacity-100' : 'scale-100 opacity-0'
            )}
          />
        )}

        {/* কোণার ব্যাজ */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {outOfStock ? (
            <Badge tone="gray">স্টকে নেই</Badge>
          ) : product.stock <= 5 ? (
            <Badge tone="rose">মাত্র {toBn(product.stock)} টি বাকি</Badge>
          ) : null}
          {product.isFeatured && !outOfStock && <Badge tone="gold">বাছাই করা</Badge>}
        </div>

        {/* দ্রুত কাজের বোতাম */}
        <div
          className={cn(
            'absolute top-3 right-3 flex flex-col gap-2 transition-all duration-300',
            'opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:translate-x-2 sm:group-hover:translate-x-0'
          )}
        >
          <button
            type="button"
            onClick={handleWish}
            aria-label={inWishlist ? 'পছন্দ থেকে সরান' : 'পছন্দের তালিকায় রাখুন'}
            aria-pressed={inWishlist}
            className="grid h-9 w-9 place-items-center rounded-full bg-white/95 text-brand-700 shadow-sm backdrop-blur transition-colors hover:bg-brand-700 hover:text-white"
          >
            <Heart size={16} className={inWishlist ? 'fill-brand-600 text-brand-600' : ''} />
          </button>
          <span className="grid h-9 w-9 place-items-center rounded-full bg-white/95 text-brand-700 shadow-sm backdrop-blur">
            <Eye size={16} />
          </span>
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <Link
          href={`/category/${product.categorySlug}`}
          className="text-[0.7rem] font-medium tracking-wide text-gold-700 hover:text-gold-800"
        >
          {product.categoryName}
        </Link>

        <h3 className="mt-1 line-clamp-2 text-[0.95rem] font-semibold text-ink">
          <Link href={`/products/${product.slug}`} className="hover:text-brand-700">
            {product.name}
          </Link>
        </h3>

        <div className="mt-1.5">
          <Stars rating={product.rating} count={product.reviewCount} />
        </div>

        <div className="mt-auto pt-3">
          <Price price={product.price} comparePrice={product.comparePrice} size="sm" />

          <button
            type="button"
            onClick={handleAdd}
            disabled={outOfStock}
            className={cn(
              'mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors',
              outOfStock
                ? 'cursor-not-allowed bg-cream-200 text-muted'
                : 'bg-brand-700 text-white hover:bg-brand-800'
            )}
          >
            <ShoppingBag size={16} />
            {outOfStock ? 'স্টকে নেই' : needsChoice ? 'বিস্তারিত দেখুন' : 'কার্টে যোগ করুন'}
          </button>
        </div>
      </div>
    </article>
  )
}
