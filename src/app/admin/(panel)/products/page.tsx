import Link from 'next/link'
import { Plus, Search, Package, Pencil, Trash2, Eye, EyeOff, Star } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { SmartImage } from '@/components/ui/SmartImage'
import { ActionButton, ConfirmAction } from '@/components/admin/ActionButton'
import { StockEditor } from '@/components/admin/StockEditor'
import { deleteProduct, toggleProductField } from '@/actions/admin'
import { Pagination } from '@/components/shop/Pagination'
import { EmptyState, LinkButton } from '@/components/ui/kit'
import { formatTaka, toBn, parseJsonArray, cn } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export const metadata = { title: 'পণ্য' }

type SearchParams = Record<string, string | string[] | undefined>
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)

const PER_PAGE = 15

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const sp = await searchParams
  const search = one(sp.q)?.trim()
  const categoryId = one(sp.category)
  const status = one(sp.status)
  const page = Math.max(1, Number(one(sp.page) ?? 1) || 1)

  const where: Record<string, unknown> = {}
  if (search) where.OR = [{ name: { contains: search } }, { sku: { contains: search } }]
  if (categoryId) where.categoryId = categoryId
  if (status === 'active') where.isActive = true
  if (status === 'hidden') where.isActive = false
  if (status === 'low') where.stock = { lte: 5 }
  if (status === 'out') where.stock = 0

  const [products, total, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
    }),
    prisma.product.count({ where }),
    prisma.category.findMany({ orderBy: { sortOrder: 'asc' } }),
  ])

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE))

  return (
    <div className="space-y-5">
      {/* উপরের সারি */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">
          মোট <strong className="text-ink">{toBn(total)}</strong> টি পণ্য
        </p>
        <LinkButton href="/admin/products/new" variant="primary" size="md">
          <Plus size={17} />
          নতুন পণ্য
        </LinkButton>
      </div>

      {/* খোঁজা ও ছাঁকনি */}
      <form
        method="get"
        className="grid gap-3 rounded-2xl border border-brand-100 bg-white p-4 sm:grid-cols-[1fr_auto_auto_auto]"
      >
        <div className="relative">
          <Search size={16} className="absolute top-1/2 left-3 -translate-y-1/2 text-muted" />
          <input
            name="q"
            defaultValue={search ?? ''}
            placeholder="পণ্যের নাম বা কোড লিখুন"
            aria-label="পণ্য খুঁজুন"
            className="w-full rounded-xl border border-brand-200 py-2.5 pr-3 pl-9 text-sm outline-none focus:border-brand-500"
          />
        </div>

        <select
          name="category"
          defaultValue={categoryId ?? ''}
          aria-label="ক্যাটাগরি"
          className="rounded-xl border border-brand-200 px-3 py-2.5 text-sm outline-none focus:border-brand-500"
        >
          <option value="">সব ক্যাটাগরি</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          name="status"
          defaultValue={status ?? ''}
          aria-label="অবস্থা"
          className="rounded-xl border border-brand-200 px-3 py-2.5 text-sm outline-none focus:border-brand-500"
        >
          <option value="">সব অবস্থা</option>
          <option value="active">প্রকাশিত</option>
          <option value="hidden">লুকানো</option>
          <option value="low">স্টক কম (৫ বা কম)</option>
          <option value="out">স্টক শেষ</option>
        </select>

        <button
          type="submit"
          className="rounded-xl bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-800"
        >
          দেখুন
        </button>
      </form>

      {/* তালিকা */}
      {products.length === 0 ? (
        <EmptyState
          icon={<Package size={44} />}
          title="কোনো পণ্য পাওয়া যায়নি"
          description="ছাঁকনি বদলে দেখুন, কিংবা নতুন একটি পণ্য যোগ করুন।"
          action={
            <LinkButton href="/admin/products/new" variant="primary">
              <Plus size={16} />
              নতুন পণ্য যোগ করুন
            </LinkButton>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-brand-100 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[58rem] text-sm">
              <thead>
                <tr className="border-b border-brand-100 bg-cream-50 text-left text-xs text-muted">
                  <th scope="col" className="px-4 py-3 font-medium">পণ্য</th>
                  <th scope="col" className="px-4 py-3 font-medium">ক্যাটাগরি</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">দাম</th>
                  <th scope="col" className="px-4 py-3 text-center font-medium">স্টক</th>
                  <th scope="col" className="px-4 py-3 text-center font-medium">বিক্রি</th>
                  <th scope="col" className="px-4 py-3 text-center font-medium">দেখা হয়েছে</th>
                  <th scope="col" className="px-4 py-3 text-center font-medium">অবস্থা</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">কাজ</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-brand-50">
                {products.map((p) => {
                  const cover = parseJsonArray<string>(p.images)[0]
                  return (
                    <tr key={p.id} className="hover:bg-cream-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative h-14 w-11 shrink-0 overflow-hidden rounded-lg bg-cream-100">
                            <SmartImage
                              src={cover ?? '/seed/cat-tant.svg'}
                              alt=""
                              fill
                              sizes="44px"
                              className="object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <Link
                              href={`/admin/products/${p.id}`}
                              className="line-clamp-2 font-medium text-ink hover:text-brand-700"
                            >
                              {p.name}
                            </Link>
                            {p.sku && (
                              <p className="text-xs text-muted">{p.sku}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3 text-muted">{p.category.name}</td>

                      <td className="px-4 py-3 text-right">
                        <span className="font-semibold text-ink tabular-nums">
                          {formatTaka(p.price)}
                        </span>
                        {p.comparePrice && (
                          <span className="block text-xs text-muted line-through tabular-nums">
                            {formatTaka(p.comparePrice)}
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <StockEditor id={p.id} stock={p.stock} />
                      </td>

                      <td className="px-4 py-3 text-center text-muted tabular-nums">
                        {toBn(p.soldCount)}
                      </td>

                      <td className="px-4 py-3 text-center text-muted tabular-nums">
                        {toBn(p.viewCount)}
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <ActionButton
                            action={toggleProductField.bind(null, p.id, 'isActive')}
                            title={p.isActive ? 'লুকিয়ে ফেলুন' : 'প্রকাশ করুন'}
                            ariaLabel={p.isActive ? 'লুকিয়ে ফেলুন' : 'প্রকাশ করুন'}
                            className={cn(
                              'grid h-8 w-8 place-items-center rounded-full transition-colors',
                              p.isActive
                                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                : 'bg-cream-200 text-muted hover:bg-cream-300'
                            )}
                          >
                            {p.isActive ? <Eye size={15} /> : <EyeOff size={15} />}
                          </ActionButton>

                          <ActionButton
                            action={toggleProductField.bind(null, p.id, 'isFeatured')}
                            title={p.isFeatured ? 'বাছাই থেকে সরান' : 'বাছাই করা হিসেবে রাখুন'}
                            ariaLabel={p.isFeatured ? 'বাছাই থেকে সরান' : 'বাছাই করা হিসেবে রাখুন'}
                            className={cn(
                              'grid h-8 w-8 place-items-center rounded-full transition-colors',
                              p.isFeatured
                                ? 'bg-gold-100 text-gold-700 hover:bg-gold-200'
                                : 'bg-cream-200 text-muted hover:bg-cream-300'
                            )}
                          >
                            <Star size={15} className={p.isFeatured ? 'fill-gold-500' : ''} />
                          </ActionButton>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/products/${p.slug}`}
                            target="_blank"
                            title="দোকানে দেখুন"
                            aria-label="দোকানে দেখুন"
                            className="grid h-8 w-8 place-items-center rounded-full text-brand-700 hover:bg-brand-50"
                          >
                            <Eye size={15} />
                          </Link>
                          <Link
                            href={`/admin/products/${p.id}`}
                            title="সম্পাদনা"
                            aria-label="সম্পাদনা করুন"
                            className="grid h-8 w-8 place-items-center rounded-full text-brand-700 hover:bg-brand-50"
                          >
                            <Pencil size={15} />
                          </Link>
                          <ConfirmAction
                            action={deleteProduct.bind(null, p.id)}
                            title="মুছে ফেলুন"
                            ariaLabel="মুছে ফেলুন"
                            confirmTitle="পণ্যটি মুছে ফেলবেন?"
                            confirmText={`"${p.name}" মুছে ফেললে এর সব রিভিউও চলে যাবে। পুরোনো অর্ডারের তথ্য থেকে যাবে।`}
                            className="grid h-8 w-8 place-items-center rounded-full text-rose-600 hover:bg-rose-50"
                          >
                            <Trash2 size={15} />
                          </ConfirmAction>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Pagination
        page={page}
        totalPages={totalPages}
        basePath="/admin/products"
        params={{ q: search, category: categoryId, status }}
      />
    </div>
  )
}
