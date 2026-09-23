'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ShoppingBag, Heart, Zap, Minus, Plus, Check, Truck, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import { useCart } from '@/store/cart'
import { useWishlist } from '@/store/wishlist'
import type { ProductDetail } from '@/lib/products'
import { cn, toBn, formatTaka } from '@/lib/utils'

export function ProductBuyBox({
  product,
  deliveryInside,
  deliveryOutside,
}: {
  product: ProductDetail
  deliveryInside: number
  deliveryOutside: number
}) {
  const router = useRouter()
  const add = useCart((s) => s.add)
  const wishItems = useWishlist((s) => s.items)
  const toggleWish = useWishlist((s) => s.toggle)

  const [size, setSize] = useState<string | null>(product.sizes[0] ?? null)
  const [colorName, setColorName] = useState<string | null>(
    product.colors[0]?.name ?? null
  )
  const [quantity, setQuantity] = useState(1)

  const outOfStock = product.stock <= 0
  const inWishlist = wishItems.some((i) => i.productId === product.id)
  const cover = product.images[0] ?? ''

  function buildItem() {
    return {
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: cover,
      price: product.price,
      comparePrice: product.comparePrice,
      quantity,
      size,
      color: colorName,
      stock: product.stock,
    }
  }

  function handleAdd() {
    if (outOfStock) return
    add(buildItem())
    toast.success('কার্টে যোগ হয়েছে', {
      description: `${product.name} — ${toBn(quantity)} টি`,
    })
  }

  function handleBuyNow() {
    if (outOfStock) return
    add(buildItem())
    router.push('/checkout')
  }

  function handleWish() {
    const added = toggleWish({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: cover,
      price: product.price,
      comparePrice: product.comparePrice,
    })
    toast[added ? 'success' : 'info'](
      added ? 'পছন্দের তালিকায় যোগ হয়েছে' : 'পছন্দের তালিকা থেকে সরানো হয়েছে'
    )
  }

  return (
    <div className="space-y-6">
      {/* সাইজ */}
      {product.sizes.length > 0 && (
        <fieldset>
          <legend className="mb-2.5 text-sm font-semibold text-brand-900">
            সাইজ {size && <span className="font-normal text-muted">— {size}</span>}
          </legend>
          <div className="flex flex-wrap gap-2">
            {product.sizes.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSize(s)}
                aria-pressed={size === s}
                className={cn(
                  'rounded-full border px-4 py-2 text-sm font-medium transition-colors',
                  size === s
                    ? 'border-brand-700 bg-brand-700 text-white'
                    : 'border-brand-200 bg-white text-ink hover:border-brand-400'
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {/* রঙ */}
      {product.colors.length > 0 && (
        <fieldset>
          <legend className="mb-2.5 text-sm font-semibold text-brand-900">
            রঙ {colorName && <span className="font-normal text-muted">— {colorName}</span>}
          </legend>
          <div className="flex flex-wrap gap-2.5">
            {product.colors.map((c) => (
              <button
                key={c.name}
                type="button"
                onClick={() => setColorName(c.name)}
                aria-pressed={colorName === c.name}
                aria-label={c.name}
                title={c.name}
                className={cn(
                  'relative grid h-10 w-10 place-items-center rounded-full border-2 transition-all',
                  colorName === c.name
                    ? 'border-brand-700 scale-110'
                    : 'border-brand-100 hover:border-brand-300'
                )}
              >
                <span
                  className="h-7 w-7 rounded-full ring-1 ring-black/10"
                  style={{ backgroundColor: c.hex }}
                />
                {colorName === c.name && (
                  <Check
                    size={14}
                    className="absolute text-white mix-blend-difference"
                    strokeWidth={3}
                  />
                )}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {/* সংখ্যা */}
      <div className="flex flex-wrap items-center gap-4">
        <div>
          <p className="mb-2.5 text-sm font-semibold text-brand-900">সংখ্যা</p>
          <div className="flex items-center rounded-full border border-brand-200 bg-white">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              aria-label="কমান"
              className="grid h-10 w-10 place-items-center rounded-full text-brand-800 hover:bg-brand-50 disabled:opacity-40"
            >
              <Minus size={15} />
            </button>
            <span className="w-12 text-center font-semibold">{toBn(quantity)}</span>
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.min(product.stock || 1, q + 1))}
              disabled={quantity >= product.stock}
              aria-label="বাড়ান"
              className="grid h-10 w-10 place-items-center rounded-full text-brand-800 hover:bg-brand-50 disabled:opacity-40"
            >
              <Plus size={15} />
            </button>
          </div>
        </div>

        <div className="pt-8">
          {outOfStock ? (
            <span className="text-sm font-semibold text-rose-600">স্টকে নেই</span>
          ) : product.stock <= 5 ? (
            <span className="text-sm font-semibold text-amber-700">
              তাড়াতাড়ি করুন — মাত্র {toBn(product.stock)} টি বাকি
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-700">
              <Check size={16} /> স্টকে আছে
            </span>
          )}
        </div>
      </div>

      {/* মোট দাম */}
      {quantity > 1 && !outOfStock && (
        <p className="text-sm text-muted">
          মোট:{' '}
          <strong className="text-brand-800">
            {formatTaka(product.price * quantity)}
          </strong>
        </p>
      )}

      {/* বোতাম */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={handleAdd}
          disabled={outOfStock}
          className="flex flex-1 items-center justify-center gap-2 rounded-full border-2 border-brand-700 bg-white py-3 font-semibold text-brand-800 transition-colors hover:bg-brand-50 disabled:cursor-not-allowed disabled:border-cream-300 disabled:text-muted"
        >
          <ShoppingBag size={18} />
          কার্টে যোগ করুন
        </button>

        <button
          type="button"
          onClick={handleBuyNow}
          disabled={outOfStock}
          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-brand-700 py-3 font-semibold text-white transition-colors hover:bg-brand-800 disabled:cursor-not-allowed disabled:bg-cream-300 disabled:text-muted"
        >
          <Zap size={18} />
          এখনই কিনুন
        </button>

        <button
          type="button"
          onClick={handleWish}
          aria-label={inWishlist ? 'পছন্দ থেকে সরান' : 'পছন্দের তালিকায় রাখুন'}
          aria-pressed={inWishlist}
          className="grid h-12 w-12 shrink-0 place-items-center self-center rounded-full border border-brand-200 text-brand-700 transition-colors hover:bg-brand-50 sm:self-auto"
        >
          <Heart size={20} className={inWishlist ? 'fill-brand-600 text-brand-600' : ''} />
        </button>
      </div>

      {/* ডেলিভারির তথ্য */}
      <div className="space-y-2.5 rounded-2xl bg-cream-100 p-4 text-sm">
        <p className="flex items-start gap-2.5 text-ink">
          <Truck size={17} className="mt-0.5 shrink-0 text-brand-600" />
          <span>
            ঢাকার ভেতরে ডেলিভারি চার্জ <strong>{formatTaka(deliveryInside)}</strong> (১-২ দিন),
            ঢাকার বাইরে <strong>{formatTaka(deliveryOutside)}</strong> (২-৪ দিন)।
          </span>
        </p>
        <p className="flex items-start gap-2.5 text-ink">
          <ShieldCheck size={17} className="mt-0.5 shrink-0 text-brand-600" />
          <span>পণ্য হাতে পেয়ে টাকা দিন। সমস্যা থাকলে ৩ দিনের মধ্যে বদলে নিন।</span>
        </p>
      </div>
    </div>
  )
}
