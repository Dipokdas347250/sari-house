import Link from 'next/link'
import { Check, Truck, Phone, MapPin, CreditCard, Package } from 'lucide-react'
import { SmartImage } from '@/components/ui/SmartImage'
import { ORDER_STATUS, ORDER_STATUS_FLOW, PAYMENT_METHODS, type OrderStatus } from '@/lib/constants'
import { formatTaka, formatDateTime, toBn, cn } from '@/lib/utils'
import { PrintButton } from '@/components/shop/PrintButton'

export type OrderItemView = {
  id: string
  productName: string
  productSlug: string
  productImage: string
  price: number
  quantity: number
  size: string | null
  color: string | null
}

export type OrderView = {
  orderNo: string
  customerName: string
  phone: string
  altPhone: string | null
  email: string | null
  division: string
  district: string
  address: string
  note: string | null
  subtotal: number
  discount: number
  deliveryCharge: number
  total: number
  couponCode: string | null
  paymentMethod: string
  paymentStatus: string
  senderNumber: string | null
  transactionId: string | null
  status: string
  createdAt: string
  items: OrderItemView[]
}

export function OrderDetails({ order }: { order: OrderView }) {
  const status = (order.status as OrderStatus) ?? 'pending'
  const info = ORDER_STATUS[status] ?? ORDER_STATUS.pending
  const cancelled = status === 'cancelled'
  const currentStep = ORDER_STATUS_FLOW.indexOf(status)

  return (
    <div className="space-y-6">
      {/* অবস্থা */}
      <section className="rounded-2xl border border-brand-100 bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-muted">অর্ডার নম্বর</p>
            <p className="font-[family-name:var(--font-display)] text-xl font-bold text-brand-900">
              {order.orderNo}
            </p>
            <p className="mt-1 text-xs text-muted">{formatDateTime(order.createdAt)}</p>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={cn(
                'rounded-full border px-3.5 py-1.5 text-sm font-semibold',
                info.color
              )}
            >
              {info.label}
            </span>
            <PrintButton />
          </div>
        </div>

        <p className="mt-4 text-sm text-ink">{info.description}</p>

        {/* ধাপের রেখা */}
        {!cancelled && (
          <ol className="mt-7 flex items-start">
            {ORDER_STATUS_FLOW.map((step, i) => {
              const done = i <= currentStep
              return (
                <li key={step} className="relative flex flex-1 flex-col items-center">
                  {i > 0 && (
                    <span
                      className={cn(
                        'absolute top-4 right-1/2 left-[-50%] h-0.5',
                        i <= currentStep ? 'bg-brand-600' : 'bg-cream-300'
                      )}
                      aria-hidden
                    />
                  )}
                  <span
                    className={cn(
                      'relative z-10 grid h-8 w-8 place-items-center rounded-full border-2 text-xs font-bold',
                      done
                        ? 'border-brand-600 bg-brand-600 text-white'
                        : 'border-cream-300 bg-white text-muted'
                    )}
                  >
                    {done ? <Check size={15} /> : toBn(i + 1)}
                  </span>
                  <span
                    className={cn(
                      'mt-2 text-center text-[0.68rem] leading-tight sm:text-xs',
                      done ? 'font-semibold text-brand-800' : 'text-muted'
                    )}
                  >
                    {ORDER_STATUS[step].label}
                  </span>
                </li>
              )
            })}
          </ol>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        {/* পণ্য */}
        <section className="rounded-2xl border border-brand-100 bg-white p-5 sm:p-6">
          <h2 className="mb-4 flex items-center gap-2 font-[family-name:var(--font-display)] text-lg font-semibold text-brand-900">
            <Package size={19} />
            অর্ডার করা পণ্য
          </h2>

          <ul className="divide-y divide-brand-100">
            {order.items.map((item) => (
              <li key={item.id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                <Link
                  href={`/products/${item.productSlug}`}
                  className="relative h-24 w-19 shrink-0 overflow-hidden rounded-xl bg-cream-100"
                >
                  <SmartImage
                    src={item.productImage || '/seed/fabric-jamdani-diamond.svg'}
                    alt={item.productName}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </Link>

                <div className="min-w-0 flex-1">
                  <Link
                    href={`/products/${item.productSlug}`}
                    className="line-clamp-2 font-semibold text-ink hover:text-brand-700"
                  >
                    {item.productName}
                  </Link>
                  {(item.size || item.color) && (
                    <p className="mt-1 text-xs text-muted">
                      {[item.size, item.color].filter(Boolean).join(' • ')}
                    </p>
                  )}
                  <p className="mt-1.5 text-sm text-muted">
                    {formatTaka(item.price)} × {toBn(item.quantity)} টি
                  </p>
                </div>

                <p className="shrink-0 font-bold text-brand-800">
                  {formatTaka(item.price * item.quantity)}
                </p>
              </li>
            ))}
          </ul>

          <dl className="mt-5 space-y-2.5 border-t border-brand-100 pt-5 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">পণ্যের দাম</dt>
              <dd className="font-medium text-ink">{formatTaka(order.subtotal)}</dd>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <dt>
                  কুপন ছাড়{order.couponCode ? ` (${order.couponCode})` : ''}
                </dt>
                <dd className="font-medium">− {formatTaka(order.discount)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-muted">ডেলিভারি চার্জ</dt>
              <dd className="font-medium text-ink">
                {order.deliveryCharge === 0 ? (
                  <span className="text-emerald-700">ফ্রি</span>
                ) : (
                  formatTaka(order.deliveryCharge)
                )}
              </dd>
            </div>
            <div className="flex items-baseline justify-between border-t border-brand-100 pt-3">
              <dt className="font-semibold text-ink">সর্বমোট</dt>
              <dd className="text-xl font-bold text-brand-800">{formatTaka(order.total)}</dd>
            </div>
          </dl>
        </section>

        {/* ঠিকানা ও পেমেন্ট */}
        <aside className="space-y-4">
          <div className="rounded-2xl border border-brand-100 bg-white p-5">
            <h2 className="mb-3 flex items-center gap-2 font-semibold text-brand-900">
              <MapPin size={17} />
              ডেলিভারির ঠিকানা
            </h2>
            <address className="space-y-1 text-sm not-italic text-ink">
              <p className="font-semibold">{order.customerName}</p>
              <p className="text-muted">{order.address}</p>
              <p className="text-muted">
                {order.district}, {order.division}
              </p>
              <p className="flex items-center gap-1.5 pt-1">
                <Phone size={14} className="text-brand-600" />
                <a href={`tel:${order.phone}`} className="hover:text-brand-700">
                  {order.phone}
                </a>
                {order.altPhone && (
                  <>
                    <span className="text-muted">/</span>
                    <a href={`tel:${order.altPhone}`} className="hover:text-brand-700">
                      {order.altPhone}
                    </a>
                  </>
                )}
              </p>
            </address>

            {order.note && (
              <p className="mt-3 rounded-xl bg-cream-100 p-3 text-xs text-ink">
                <strong>নির্দেশনা:</strong> {order.note}
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-brand-100 bg-white p-5">
            <h2 className="mb-3 flex items-center gap-2 font-semibold text-brand-900">
              <CreditCard size={17} />
              পেমেন্ট
            </h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">ধরন</dt>
                <dd className="font-medium text-ink">
                  {PAYMENT_METHODS[order.paymentMethod as keyof typeof PAYMENT_METHODS]?.label ??
                    order.paymentMethod}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">অবস্থা</dt>
                <dd
                  className={cn(
                    'font-medium',
                    order.paymentStatus === 'paid' ? 'text-emerald-700' : 'text-amber-700'
                  )}
                >
                  {order.paymentStatus === 'paid' ? 'পরিশোধিত' : 'বাকি'}
                </dd>
              </div>
              {order.transactionId && (
                <div className="flex justify-between gap-2">
                  <dt className="text-muted">ট্রানজেকশন</dt>
                  <dd className="text-right font-medium break-all text-ink">
                    {order.transactionId}
                  </dd>
                </div>
              )}
              {order.senderNumber && (
                <div className="flex justify-between">
                  <dt className="text-muted">প্রেরকের নম্বর</dt>
                  <dd className="font-medium text-ink">{order.senderNumber}</dd>
                </div>
              )}
            </dl>
          </div>

          <div className="no-print flex items-start gap-2.5 rounded-2xl bg-cream-100 p-4 text-xs text-ink">
            <Truck size={16} className="mt-0.5 shrink-0 text-brand-600" />
            <span>
              অর্ডার নম্বরটি লিখে রাখুন। যেকোনো প্রয়োজনে এই নম্বর বলে আমাদের সাথে যোগাযোগ
              করতে পারেন।
            </span>
          </div>
        </aside>
      </div>
    </div>
  )
}
