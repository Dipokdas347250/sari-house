import { Suspense } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { ChevronLeft, PackageOpen } from 'lucide-react'
import {
  getProducts,
  getCategories,
  getCategoryBySlug,
  getPriceRange,
} from '@/lib/products'
import { ProductGrid } from '@/components/shop/ProductGrid'
import { ProductFilters, SortSelect } from '@/components/shop/ProductFilters'
import { Pagination } from '@/components/shop/Pagination'
import { EmptyState, LinkButton } from '@/components/ui/kit'
import { SmartImage } from '@/components/ui/SmartImage'
import { toBn } from '@/lib/utils'

export const dynamic = 'force-dynamic'

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const category = await getCategoryBySlug(slug)
  if (!category) return { title: 'ক্যাটাগরি পাওয়া যায়নি' }
  return {
    title: category.name,
    description: category.description ?? `${category.name} এর সম্পূর্ণ সংগ্রহ।`,
  }
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params
  const sp = await searchParams

  const category = await getCategoryBySlug(slug)
  if (!category) notFound()

  const query = {
    category: slug,
    sort: one(sp.sort),
    minPrice: one(sp.min) ? Number(one(sp.min)) : undefined,
    maxPrice: one(sp.max) ? Number(one(sp.max)) : undefined,
    inStock: one(sp.stock) === '1',
    page: Number(one(sp.page) ?? 1) || 1,
    perPage: 12,
  }

  const [result, categories, priceRange] = await Promise.all([
    getProducts(query),
    getCategories(),
    getPriceRange(),
  ])

  return (
    <div>
      {/* ক্যাটাগরির ব্যানার */}
      <div className="relative h-52 overflow-hidden bg-brand-950 sm:h-64">
        <SmartImage
          src={category.image ?? '/seed/banner-2.svg'}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-55"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-950 via-brand-950/60 to-brand-950/25" />
        <div className="container-x relative flex h-full flex-col justify-end pb-7">
          <nav
            aria-label="পথনির্দেশ"
            className="mb-2 flex items-center gap-1 text-sm text-cream-300/80"
          >
            <Link href="/" className="hover:text-gold-300">
              হোম
            </Link>
            <ChevronLeft size={14} className="rotate-180" />
            <span className="text-white">{category.name}</span>
          </nav>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-white sm:text-4xl">
            {category.name}
          </h1>
          {category.description && (
            <p className="mt-2 max-w-2xl text-sm text-cream-200/85">
              {category.description}
            </p>
          )}
        </div>
      </div>

      <div className="container-x py-8 sm:py-10">
        <div className="grid gap-8 lg:grid-cols-[17rem_1fr]">
          <Suspense fallback={<div className="hidden lg:block" />}>
            <ProductFilters
              categories={categories.map((c) => ({
                name: c.name,
                slug: c.slug,
                count: c._count.products,
              }))}
              priceRange={priceRange}
              lockedCategory={slug}
            />
          </Suspense>

          <div>
            <div className="mb-5 flex items-center justify-between">
              <p className="text-sm text-muted">
                {toBn(result.total)} টি পণ্য
              </p>
              <Suspense fallback={null}>
                <SortSelect />
              </Suspense>
            </div>

            {result.items.length === 0 ? (
              <EmptyState
                icon={<PackageOpen size={44} />}
                title="এই ক্যাটাগরিতে এখন কোনো পণ্য নেই"
                description="শীঘ্রই নতুন পণ্য আসছে। ততক্ষণে অন্য সংগ্রহগুলো দেখে নিন।"
                action={
                  <LinkButton href="/products" variant="primary">
                    সব পণ্য দেখুন
                  </LinkButton>
                }
              />
            ) : (
              <>
                <ProductGrid products={result.items} columns={3} priorityCount={3} />
                <Pagination
                  page={result.page}
                  totalPages={result.totalPages}
                  basePath={`/category/${slug}`}
                  params={{
                    sort: one(sp.sort),
                    min: one(sp.min),
                    max: one(sp.max),
                    stock: one(sp.stock),
                  }}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
