import { Suspense } from 'react'
import Link from 'next/link'
import type { Metadata } from 'next'
import { PackageOpen, ChevronLeft } from 'lucide-react'
import { getProducts, getCategories, getPriceRange } from '@/lib/products'
import { ProductGrid } from '@/components/shop/ProductGrid'
import { ProductFilters, SortSelect } from '@/components/shop/ProductFilters'
import { Pagination } from '@/components/shop/Pagination'
import { EmptyState, LinkButton, ProductCardSkeleton } from '@/components/ui/kit'
import { toBn } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'সব পণ্য',
  description: 'শাড়ি, থ্রি-পিস, কুর্তি ও ওড়নার সম্পূর্ণ সংগ্রহ এক জায়গায়।',
}

type SearchParams = Record<string, string | string[] | undefined>

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const sp = await searchParams

  const query = {
    category: one(sp.category),
    search: one(sp.search),
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

  const filterCategories = categories.map((c) => ({
    name: c.name,
    slug: c.slug,
    count: c._count.products,
  }))

  const plainParams: Record<string, string | undefined> = {
    category: query.category,
    search: query.search,
    sort: query.sort,
    min: one(sp.min),
    max: one(sp.max),
    stock: one(sp.stock),
  }

  const activeCategory = categories.find((c) => c.slug === query.category)

  return (
    <div className="container-x py-8 sm:py-10">
      {/* ব্রেডক্রাম */}
      <nav aria-label="পথনির্দেশ" className="mb-5 flex items-center gap-1 text-sm text-muted">
        <Link href="/" className="hover:text-brand-700">
          হোম
        </Link>
        <ChevronLeft size={14} className="rotate-180" />
        <span className="text-ink">সব পণ্য</span>
      </nav>

      <header className="mb-7">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-brand-900 sm:text-3xl">
          {query.search
            ? `"${query.search}" এর ফলাফল`
            : activeCategory
              ? activeCategory.name
              : 'সব পণ্য'}
        </h1>
        <p className="mt-1.5 text-sm text-muted">
          {result.total > 0
            ? `${toBn(result.total)} টি পণ্য পাওয়া গেছে`
            : 'কোনো পণ্য পাওয়া যায়নি'}
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[17rem_1fr]">
        <Suspense fallback={<div className="hidden lg:block" />}>
          <ProductFilters categories={filterCategories} priceRange={priceRange} />
        </Suspense>

        <div>
          <div className="mb-5 hidden items-center justify-between lg:flex">
            <p className="text-sm text-muted">
              {toBn(result.page)} নম্বর পাতা, মোট {toBn(result.totalPages)} টি পাতার মধ্যে
            </p>
            <Suspense fallback={null}>
              <SortSelect />
            </Suspense>
          </div>

          {result.items.length === 0 ? (
            <EmptyState
              icon={<PackageOpen size={44} />}
              title="এই শর্তে কোনো পণ্য নেই"
              description="ফিল্টার বদলে আবার চেষ্টা করুন, কিংবা আমাদের পুরো সংগ্রহ ঘুরে দেখুন।"
              action={
                <LinkButton href="/products" variant="primary">
                  সব পণ্য দেখুন
                </LinkButton>
              }
            />
          ) : (
            <>
              <Suspense
                fallback={
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <ProductCardSkeleton key={i} />
                    ))}
                  </div>
                }
              >
                <ProductGrid products={result.items} columns={3} priorityCount={3} />
              </Suspense>

              <Pagination
                page={result.page}
                totalPages={result.totalPages}
                basePath="/products"
                params={plainParams}
              />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
