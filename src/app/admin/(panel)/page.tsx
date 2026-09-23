import Link from 'next/link'
import {
  ShoppingCart,
  Banknote,
  Package,
  Clock,
  AlertTriangle,
  ArrowLeft,
  Users,
} from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { StatTile } from '@/components/admin/StatTile'
import { SalesChart, type SalesPoint } from '@/components/admin/SalesChart'
import { SmartImage } from '@/components/ui/SmartImage'
import { ORDER_STATUS, ORDER_STATUS_FLOW, type OrderStatus } from '@/lib/constants'
import { formatTaka, toBn, formatDate, parseJsonArray, cn } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export const metadata = { title: 'ড্যাশবোর্ড' }

const DAY = 86400000

/** শতকরা পরিবর্তন; আগের সময়ে শূন্য থাকলে null */
function changePercent(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null
  return ((current - previous) / previous) * 100
}

export default async function AdminDashboard() {
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const weekAgo = new Date(startOfToday.getTime() - 6 * DAY)
  const twoWeeksAgo = new Date(startOfToday.getTime() - 13 * DAY)

  const [
    totalOrders,
    pendingOrders,
    deliveredAgg,
    productCount,
    lowStock,
    customers,
    thisWeekOrders,
    lastWeekOrders,
    thisWeekRevenue,
    lastWeekRevenue,
    recentOrders,
    statusCounts,
    topProducts,
    chartOrders,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: 'pending' } }),
    prisma.order.aggregate({
      where: { status: { not: 'cancelled' } },
      _sum: { total: true },
    }),
    prisma.product.count({ where: { isActive: true } }),
    prisma.product.findMany({
      where: { isActive: true, stock: { lte: 5 } },
      orderBy: { stock: 'asc' },
      take: 6,
      select: { id: true, name: true, slug: true, stock: true, images: true },
    }),
    prisma.order.findMany({ distinct: ['phone'], select: { phone: true } }),
    prisma.order.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.order.count({
      where: { createdAt: { gte: twoWeeksAgo, lt: weekAgo } },
    }),
    prisma.order.aggregate({
      where: { createdAt: { gte: weekAgo }, status: { not: 'cancelled' } },
      _sum: { total: true },
    }),
    prisma.order.aggregate({
      where: {
        createdAt: { gte: twoWeeksAgo, lt: weekAgo },
        status: { not: 'cancelled' },
      },
      _sum: { total: true },
    }),
    prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 6,
      include: { items: { select: { id: true } } },
    }),
    prisma.order.groupBy({ by: ['status'], _count: { _all: true } }),
    prisma.product.findMany({
      where: { soldCount: { gt: 0 } },
      orderBy: { soldCount: 'desc' },
      take: 5,
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        soldCount: true,
        stock: true,
        images: true,
      },
    }),
    prisma.order.findMany({
      where: { createdAt: { gte: twoWeeksAgo }, status: { not: 'cancelled' } },
      select: { createdAt: true, total: true },
    }),
  ])

  // ১৪ দিনের সিরিজ তৈরি
  const buckets = new Map<string, { amount: number; orders: number }>()
  for (let i = 13; i >= 0; i--) {
    const d = new Date(startOfToday.getTime() - i * DAY)
    buckets.set(d.toISOString().slice(0, 10), { amount: 0, orders: 0 })
  }
  for (const o of chartOrders) {
    const key = new Date(
      o.createdAt.getFullYear(),
      o.createdAt.getMonth(),
      o.createdAt.getDate()
    )
      .toISOString()
      .slice(0, 10)
    const bucket = buckets.get(key)
    if (bucket) {
      bucket.amount += o.total
      bucket.orders += 1
    }
  }
  const series: SalesPoint[] = [...buckets.entries()].map(([date, v]) => ({
    date,
    amount: v.amount,
    orders: v.orders,
  }))

  const statusMap = new Map(statusCounts.map((s) => [s.status, s._count._all]))
  const maxStatus = Math.max(...statusCounts.map((s) => s._count._all), 1)
  const allStatuses: OrderStatus[] = [...ORDER_STATUS_FLOW, 'cancelled']

  return (
    <div className="space-y-6">
      {/* মূল সংখ্যাগুলো */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label="মোট বিক্রি"
          value={formatTaka(deliveredAgg._sum.total ?? 0)}
          delta={changePercent(
            thisWeekRevenue._sum.total ?? 0,
            lastWeekRevenue._sum.total ?? 0
          )}
          icon={<Banknote size={18} />}
        />
        <StatTile
          label="মোট অর্ডার"
          value={`${toBn(totalOrders)} টি`}
          delta={changePercent(thisWeekOrders, lastWeekOrders)}
          icon={<ShoppingCart size={18} />}
          href="/admin/orders"
        />
        <StatTile
          label="অপেক্ষমাণ অর্ডার"
          value={`${toBn(pendingOrders)} টি`}
          upIsGood={false}
          icon={<Clock size={18} />}
          href="/admin/orders?status=pending"
        />
        <StatTile
          label="ক্রেতা"
          value={`${toBn(customers.length)} জন`}
          icon={<Users size={18} />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <SalesChart data={series} />

        {/* অর্ডারের অবস্থা — মাত্রা বোঝাতে এক রঙের মিটার */}
        <section className="rounded-2xl border border-brand-100 bg-white p-5">
          <h2 className="mb-4 font-[family-name:var(--font-display)] text-base font-semibold text-brand-900">
            অর্ডারের অবস্থা
          </h2>

          <ul className="space-y-3">
            {allStatuses.map((s) => {
              const count = statusMap.get(s) ?? 0
              return (
                <li key={s}>
                  <Link
                    href={`/admin/orders?status=${s}`}
                    className="group block rounded-lg px-1 py-0.5 hover:bg-cream-50"
                  >
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-ink group-hover:text-brand-800">
                        {ORDER_STATUS[s].label}
                      </span>
                      <span className="font-semibold text-ink tabular-nums">
                        {toBn(count)}
                      </span>
                    </div>
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-brand-50">
                      <div
                        className={cn(
                          'h-full rounded-full',
                          s === 'cancelled' ? 'bg-brand-300' : 'bg-brand-700'
                        )}
                        style={{ width: `${(count / maxStatus) * 100}%` }}
                      />
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* সাম্প্রতিক অর্ডার */}
        <section className="rounded-2xl border border-brand-100 bg-white">
          <header className="flex items-center justify-between border-b border-brand-100 px-5 py-4">
            <h2 className="font-[family-name:var(--font-display)] text-base font-semibold text-brand-900">
              সাম্প্রতিক অর্ডার
            </h2>
            <Link
              href="/admin/orders"
              className="flex items-center gap-1 text-sm font-medium text-brand-700 hover:text-brand-800"
            >
              সব দেখুন
              <ArrowLeft size={14} className="rotate-180" />
            </Link>
          </header>

          {recentOrders.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-muted">
              এখনো কোনো অর্ডার আসেনি।
            </p>
          ) : (
            <ul className="divide-y divide-brand-50">
              {recentOrders.map((o) => {
                const info = ORDER_STATUS[o.status as OrderStatus] ?? ORDER_STATUS.pending
                return (
                  <li key={o.id}>
                    <Link
                      href={`/admin/orders/${o.id}`}
                      className="flex items-center gap-3 px-5 py-3.5 hover:bg-cream-50"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-ink">
                          {o.customerName}
                        </p>
                        <p className="text-xs text-muted">
                          {o.orderNo} · {toBn(o.items.length)} টি পণ্য ·{' '}
                          {formatDate(o.createdAt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-brand-800 tabular-nums">
                          {formatTaka(o.total)}
                        </p>
                        <span
                          className={cn(
                            'mt-0.5 inline-block rounded-full border px-2 py-0.5 text-[0.65rem] font-semibold',
                            info.color
                          )}
                        >
                          {info.label}
                        </span>
                      </div>
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </section>

        {/* সবচেয়ে বেশি বিক্রি */}
        <section className="rounded-2xl border border-brand-100 bg-white">
          <header className="flex items-center justify-between border-b border-brand-100 px-5 py-4">
            <h2 className="font-[family-name:var(--font-display)] text-base font-semibold text-brand-900">
              সবচেয়ে বেশি বিক্রি
            </h2>
            <Link
              href="/admin/products"
              className="flex items-center gap-1 text-sm font-medium text-brand-700 hover:text-brand-800"
            >
              সব পণ্য ({toBn(productCount)})
              <ArrowLeft size={14} className="rotate-180" />
            </Link>
          </header>

          {topProducts.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-muted">
              এখনো কোনো পণ্য বিক্রি হয়নি।
            </p>
          ) : (
            <ul className="divide-y divide-brand-50">
              {topProducts.map((p, i) => (
                <li key={p.id} className="flex items-center gap-3 px-5 py-3">
                  <span className="w-5 text-sm font-bold text-brand-300 tabular-nums">
                    {toBn(i + 1)}
                  </span>
                  <div className="relative h-12 w-10 shrink-0 overflow-hidden rounded-lg bg-cream-100">
                    <SmartImage
                      src={parseJsonArray<string>(p.images)[0] ?? '/seed/cat-tant.svg'}
                      alt=""
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">{p.name}</p>
                    <p className="text-xs text-muted">
                      {formatTaka(p.price)} · স্টক {toBn(p.stock)}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-semibold text-brand-800 tabular-nums">
                    {toBn(p.soldCount)} টি
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* স্টক কমে গেছে */}
      {lowStock.length > 0 && (
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <h2 className="mb-1 flex items-center gap-2 font-[family-name:var(--font-display)] text-base font-semibold text-amber-900">
            <AlertTriangle size={18} />
            স্টক প্রায় শেষ
          </h2>
          <p className="mb-4 text-xs text-amber-800">
            এই পণ্যগুলোর স্টক ৫ বা তার কম — নতুন মাল তোলার কথা ভাবুন।
          </p>

          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {lowStock.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/admin/products/${p.id}`}
                  className="flex items-center gap-3 rounded-xl bg-white px-3 py-2.5 hover:bg-amber-100/50"
                >
                  <Package size={16} className="shrink-0 text-amber-700" />
                  <span className="min-w-0 flex-1 truncate text-sm text-ink">{p.name}</span>
                  <span
                    className={cn(
                      'shrink-0 rounded-full px-2 py-0.5 text-xs font-bold tabular-nums',
                      p.stock === 0
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-900'
                    )}
                  >
                    {toBn(p.stock)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
