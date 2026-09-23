import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, MessageCircle, Phone } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { getSettings } from '@/lib/settings'
import { OrderDetails, type OrderView } from '@/components/shop/OrderDetails'
import { OrderStatusSelect, PaymentToggle } from '@/components/admin/OrderStatusSelect'
import { formatTaka } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export const metadata = { title: 'অর্ডারের বিস্তারিত' }

export default async function AdminOrderPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [order, settings] = await Promise.all([
    prisma.order.findUnique({ where: { id }, include: { items: true } }),
    getSettings(),
  ])

  if (!order) notFound()

  const view: OrderView = {
    ...order,
    createdAt: order.createdAt.toISOString(),
    items: order.items.map((i) => ({
      id: i.id,
      productName: i.productName,
      productSlug: i.productSlug,
      productImage: i.productImage,
      price: i.price,
      quantity: i.quantity,
      size: i.size,
      color: i.color,
    })),
  }

  const waText = encodeURIComponent(
    `আসসালামু আলাইকুম ${order.customerName}, ${settings.siteName} থেকে বলছি। আপনার অর্ডার ${order.orderNo} (মোট ${formatTaka(order.total)}) নিয়ে কথা বলতে চাই।`
  )

  return (
    <div className="space-y-5">
      {/* উপরের কাজের সারি */}
      <div className="no-print flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-brand-100 bg-white p-4">
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-800 hover:text-brand-600"
        >
          <ArrowLeft size={16} />
          অর্ডারের তালিকা
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          <a
            href={`tel:${order.phone}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 px-3.5 py-1.5 text-sm font-medium text-brand-800 hover:bg-brand-50"
          >
            <Phone size={15} />
            ফোন করুন
          </a>
          <a
            href={`https://wa.me/88${order.phone}?text=${waText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 px-3.5 py-1.5 text-sm font-medium text-brand-800 hover:bg-brand-50"
          >
            <MessageCircle size={15} />
            হোয়াটসঅ্যাপ
          </a>

          <PaymentToggle id={order.id} paymentStatus={order.paymentStatus} />
          <OrderStatusSelect id={order.id} status={order.status} size="md" />
        </div>
      </div>

      <OrderDetails order={view} />
    </div>
  )
}
