import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { ChevronLeft, Package, Ruler, Palette, Hash } from 'lucide-react'
import {
  getProductBySlug,
  getRelatedProducts,
  getApprovedReviews,
} from '@/lib/products'
import { getSettings } from '@/lib/settings'
import { ProductGallery } from '@/components/shop/ProductGallery'
import { ProductBuyBox } from '@/components/shop/ProductBuyBox'
import { ReviewSection } from '@/components/shop/ReviewSection'
import { ProductGrid } from '@/components/shop/ProductGrid'
import { ViewTracker } from '@/components/shop/ViewTracker'
import { Price } from '@/components/ui/Price'
import { Stars } from '@/components/ui/Stars'
import { SectionHeading } from '@/components/ui/kit'
import { JsonLd } from '@/components/ui/JsonLd'
import { productJsonLd, breadcrumbJsonLd } from '@/lib/jsonld'
import { toBn, discountPercent } from '@/lib/utils'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) return { title: 'পণ্য পাওয়া যায়নি' }

  return {
    title: product.name,
    description: product.shortDesc || product.description.slice(0, 150),
    openGraph: {
      title: product.name,
      description: product.shortDesc,
      images: product.images[0] ? [product.images[0]] : [],
    },
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) notFound()

  const [related, reviews, settings] = await Promise.all([
    getRelatedProducts(product.categoryId, product.id, 4),
    getApprovedReviews(product.id),
    getSettings(),
  ])

  const off = discountPercent(product.price, product.comparePrice)

  const specs = [
    product.fabric && { icon: Package, label: 'কাপড়', value: product.fabric },
    product.sizes.length > 0 && {
      icon: Ruler,
      label: 'সাইজ',
      value: product.sizes.join(', '),
    },
    product.colors.length > 0 && {
      icon: Palette,
      label: 'রঙ',
      value: product.colors.map((c) => c.name).join(', '),
    },
    product.sku && { icon: Hash, label: 'কোড', value: product.sku },
  ].filter(Boolean) as { icon: typeof Package; label: string; value: string }[]

  return (
    <div className="container-x py-8 sm:py-10">
      <ViewTracker productId={product.id} />

      <JsonLd
        data={[
          productJsonLd(product, settings),
          breadcrumbJsonLd([
            { name: 'হোম', path: '/' },
            { name: 'সব পণ্য', path: '/products' },
            { name: product.categoryName, path: `/category/${product.categorySlug}` },
            { name: product.name, path: `/products/${product.slug}` },
          ]),
        ]}
      />

      {/* ব্রেডক্রাম */}
      <nav
        aria-label="পথনির্দেশ"
        className="mb-6 flex flex-wrap items-center gap-1 text-sm text-muted"
      >
        <Link href="/" className="hover:text-brand-700">
          হোম
        </Link>
        <ChevronLeft size={14} className="rotate-180" />
        <Link href="/products" className="hover:text-brand-700">
          সব পণ্য
        </Link>
        <ChevronLeft size={14} className="rotate-180" />
        <Link href={`/category/${product.categorySlug}`} className="hover:text-brand-700">
          {product.categoryName}
        </Link>
        <ChevronLeft size={14} className="rotate-180" />
        <span className="line-clamp-1 text-ink">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <ProductGallery
          images={product.images}
          alt={product.name}
          badge={off > 0 ? `${toBn(off)}% ছাড়` : undefined}
        />

        <div>
          <Link
            href={`/category/${product.categorySlug}`}
            className="text-xs font-semibold tracking-wide text-gold-700 uppercase"
          >
            {product.categoryName}
          </Link>

          <h1 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-bold text-brand-900 text-balance-bn sm:text-3xl">
            {product.name}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-4">
            <Stars rating={product.rating} count={product.reviewCount} size={16} />
            {product.soldCount > 0 && (
              <span className="text-sm text-muted">
                {toBn(product.soldCount)} টি বিক্রি হয়েছে
              </span>
            )}
          </div>

          {product.shortDesc && (
            <p className="mt-4 text-sm leading-relaxed text-muted">{product.shortDesc}</p>
          )}

          <div className="mt-5 border-y border-brand-100 py-5">
            <Price
              price={product.price}
              comparePrice={product.comparePrice}
              size="lg"
            />
          </div>

          <div className="mt-6">
            <ProductBuyBox
              product={product}
              deliveryInside={Number(settings.deliveryInsideDhaka) || 0}
              deliveryOutside={Number(settings.deliveryOutsideDhaka) || 0}
            />
          </div>
        </div>
      </div>

      {/* বিস্তারিত ও স্পেসিফিকেশন */}
      <section className="mt-14 grid gap-8 lg:grid-cols-[1fr_20rem]">
        <div>
          <h2 className="mb-4 font-[family-name:var(--font-display)] text-xl font-semibold text-brand-900">
            পণ্যের বিস্তারিত
          </h2>
          <div className="space-y-4 text-sm leading-relaxed text-ink">
            {product.description.split('\n\n').map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </div>

        {specs.length > 0 && (
          <aside>
            <h2 className="mb-4 font-[family-name:var(--font-display)] text-xl font-semibold text-brand-900">
              এক নজরে
            </h2>
            <dl className="overflow-hidden rounded-2xl border border-brand-100 bg-white">
              {specs.map(({ icon: Icon, label, value }, i) => (
                <div
                  key={label}
                  className={`flex gap-3 px-4 py-3.5 ${i > 0 ? 'border-t border-brand-100' : ''}`}
                >
                  <Icon size={17} className="mt-0.5 shrink-0 text-brand-500" />
                  <div>
                    <dt className="text-xs text-muted">{label}</dt>
                    <dd className="text-sm font-medium text-ink">{value}</dd>
                  </div>
                </div>
              ))}
            </dl>
          </aside>
        )}
      </section>

      {/* রিভিউ */}
      <section className="mt-14">
        <h2 className="mb-6 font-[family-name:var(--font-display)] text-xl font-semibold text-brand-900 sm:text-2xl">
          ক্রেতাদের মতামত
        </h2>
        <ReviewSection
          productId={product.id}
          rating={product.rating}
          reviews={reviews.map((r) => ({
            id: r.id,
            customerName: r.customerName,
            rating: r.rating,
            comment: r.comment,
            createdAt: r.createdAt.toISOString(),
          }))}
        />
      </section>

      {/* সম্পর্কিত পণ্য */}
      {related.length > 0 && (
        <section className="mt-16">
          <SectionHeading
            eyebrow="আরও দেখুন"
            title="এগুলোও ভালো লাগতে পারে"
          />
          <ProductGrid products={related} />
        </section>
      )}
    </div>
  )
}
