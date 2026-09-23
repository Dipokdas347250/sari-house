import Link from 'next/link'
import { Search, ShoppingCart, Eye, Trash2, Phone } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { OrderStatusSelect, PaymentToggle } from '@/components/admin/OrderStatusSelect'
import { ConfirmAction } from '@/components/admin/ActionButton'
import { deleteOrder } from '@/actions/admin'
import { Pagination } from '@/components/shop/Pagination'
import { EmptyState } from '@/components/ui/kit'
import { ORDER_STATUS, ORDER_STATUS_FLOW, PAYMENT_METHODS, type OrderStatus } from '@/lib/constants'
import { formatTaka, toBn, formatDate, normalizePhone, cn } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export const metadata = { title: 'অর্ডার' }

type SearchParams = Record<string, string | string[] | undefined>
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)

const PER_PAGE = 20
const ALL_STATUSES: OrderStatus[] = [...ORDER_STATUS_FLOW, 'cancelled']

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const sp = await searchParams
  const search = one(sp.q)?.trim()
  const status = one(sp.status)
  const page = Math.max(1, Number(one(sp.page) ?? 1) || 1)

  const where: Record<string, unknown> = {}
  if (status && ALL_STATUSES.includes(status as OrderStatus)) where.status = status
  if (search) {
    where.OR = [
      { orderNo: { contains: search.toUpperCase() } },
      { customerName: { contains: search } },
      { phone: { contains: normalizePhone(search) || search } },
    ]
  }

  const [orders, total, counts] = await Promise.all([
    prisma.order.findMany({
      where,
      include: { items: { select: { id: true, quantity: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
    }),
    prisma.order.count({ where }),
    prisma.order.groupBy({ by: ['status'], _count: { _all: true } }),
  ])

  const countMap = new Map(counts.map((c) => [c.status, c._count._all]))
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE))

  return (
    <div className="space-y-5">
      {/* অবস্থা অনুযায়ী ট্যাব */}
      <div className="no-scrollbar -mx-4 overflow-x-auto px-4 lg:mx-0 lg:px-0">
        <div className="flex w-max gap-2">
          <Link
            href="/admin/orders"
            className={cn(
              'rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors',
              !status ? 'bg-brand-700 text-white' : 'bg-white text-ink hover:bg-cream-50'
            )}
          >
            সব ({toBn([...countMap.values()].reduce((a, b) => a + b, 0))})
          </Link>
          {ALL_STATUSES.map((s) => (
            <Link
              key={s}
              href={`/admin/orders?status=${s}`}
              className={cn(
                'rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors',
                status === s ? 'bg-brand-700 text-white' : 'bg-white text-ink hover:bg-cream-50'
              )}
            >
              {ORDER_STATUS[s].label} ({toBn(countMap.get(s) ?? 0)})
            </Link>
          ))}
        </div>
      </div>

      {/* খোঁজা */}
      <form method="get" className="flex gap-3 rounded-2xl border border-brand-100 bg-white p-4">
        {status && <input type="hidden" name="status" value={status} />}
        <div className="relative flex-1">
          <Search size={16} className="absolute top-1/2 left-3 -translate-y-1/2 text-muted" />
          <input
            name="q"
            defaultValue={search ?? ''}
            placeholder="অর্ডার নম্বর, ক্রেতার নাম বা ফোন নম্বর"
            aria-label="অর্ডার খুঁজুন"
            className="w-full rounded-xl border border-brand-200 py-2.5 pr-3 pl-9 text-sm outline-none focus:border-brand-500"
          />
        </div>
        <button
          type="submit"
          className="rounded-xl bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-800"
        >
          খুঁজুন
        </button>
      </form>

      {orders.length === 0 ? (
        <EmptyState
          icon={<ShoppingCart size={44} />}
          title="কোনো অর্ডার নেই"
          description="এই শর্তে কোনো অর্ডার পাওয়া যায়নি।"
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-brand-100 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[58rem] text-sm">
              <thead>
                <tr className="border-b border-brand-100 bg-cream-50 text-left text-xs text-muted">
                  <th scope="col" className="px-4 py-3 font-medium">অর্ডার</th>
                  <th scope="col" className="px-4 py-3 font-medium">ক্রেতা</th>
                  <th scope="col" className="px-4 py-3 font-medium">ঠিকানা</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">মোট</th>
                  <th scope="col" className="px-4 py-3 font-medium">পেমেন্ট</th>
                  <th scope="col" className="px-4 py-3 font-medium">অবস্থা</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">কাজ</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-brand-50">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-cream-50">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/orders/${o.id}`}
                        className="font-semibold text-brand-800 hover:underline"
                      >
                        {o.orderNo}
                      </Link>
                      <p className="text-xs text-muted">
                        {formatDate(o.createdAt)} ·{' '}
                        {toBn(o.items.reduce((s, i) => s + i.quantity, 0))} টি পণ্য
                      </p>
                    </td>

                    <td className="px-4 py-3">
                      <p className="font-medium text-ink">{o.customerName}</p>
                      <a
                        href={`tel:${o.phone}`}
                        className="flex items-center gap-1 text-xs text-muted hover:text-brand-700"
                      >
                        <Phone size={11} />
                        {o.phone}
                      </a>
                    </td>

                    <td className="px-4 py-3 text-muted">
                      {o.district}
                      <span className="block text-xs">{o.division}</span>
                    </td>

                    <td className="px-4 py-3 text-right font-semibold text-ink tabular-nums">
                      {formatTaka(o.total)}
                    </td>

                    <td className="px-4 py-3">
                      <p className="mb-1 text-xs text-muted">
                        {PAYMENT_METHODS[o.paymentMethod as keyof typeof PAYMENT_METHODS]
                          ?.short ?? o.paymentMethod}
                      </p>
                      <PaymentToggle id={o.id} paymentStatus={o.paymentStatus} />
                    </td>

                    <td className="px-4 py-3">
                      <OrderStatusSelect id={o.id} status={o.status} />
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/orders/${o.id}`}
                          title="বিস্তারিত"
                          aria-label="বিস্তারিত দেখুন"
                          className="grid h-8 w-8 place-items-center rounded-full text-brand-700 hover:bg-brand-50"
                        >
                          <Eye size={15} />
                        </Link>
                        <ConfirmAction
                          action={deleteOrder.bind(null, o.id)}
                          title="মুছে ফেলুন"
                          ariaLabel="অর্ডার মুছে ফেলুন"
                          confirmTitle="অর্ডারটি মুছে ফেলবেন?"
                          confirmText={`${o.orderNo} মুছে ফেললে এর সব তথ্য চলে যাবে। স্টক ফেরত আসবে না — দরকার হলে আগে "বাতিল" করে নিন।`}
                          className="grid h-8 w-8 place-items-center rounded-full text-rose-600 hover:bg-rose-50"
                        >
                          <Trash2 size={15} />
                        </ConfirmAction>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Pagination
        page={page}
        totalPages={totalPages}
        basePath="/admin/orders"
        params={{ q: search, status }}
      />
    </div>
  )
}
