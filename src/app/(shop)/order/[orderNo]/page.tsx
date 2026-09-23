import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { CheckCircle2, ArrowLeft } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { OrderDetails, type OrderView } from '@/components/shop/OrderDetails'
import { getSettings } from '@/lib/settings'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'অর্ডারের বিস্তারিত',
  robots: { index: false, follow: false },
}

export default async function OrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ orderNo: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const [{ orderNo }, sp] = await Promise.all([params, searchParams])

  const [order, settings] = await Promise.all([
    prisma.order.findUnique({
      where: { orderNo: decodeURIComponent(orderNo).toUpperCase() },
      include: { items: true },
    }),
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

  // চেকআউট থেকে এলে ?placed=1 থাকে — তখনই অভিনন্দনের বার্তা দেখানো হয়
  const isNew = sp.placed === '1'

  return (
    <div className="container-x py-8 sm:py-10">
      {isNew && (
        <div className="no-print mb-7 animate-fade-up rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center sm:p-8">
          <CheckCircle2 size={48} className="mx-auto mb-3 text-emerald-600" />
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-emerald-900 sm:text-3xl">
            ধন্যবাদ! আপনার অর্ডার আমরা পেয়েছি
          </h1>
          <p className="mx-auto mt-2 max-w-xl text-sm text-emerald-800">
            কিছুক্ষণের মধ্যেই আমাদের একজন প্রতিনিধি{' '}
            <strong>{settings.phone}</strong> নম্বর থেকে ফোন করে অর্ডারটি নিশ্চিত করবেন।
          </p>
        </div>
      )}

      {!isNew && (
        <h1 className="mb-6 font-[family-name:var(--font-display)] text-2xl font-bold text-brand-900 sm:text-3xl">
          অর্ডারের বিস্তারিত
        </h1>
      )}

      <OrderDetails order={view} />

      <div className="no-print mt-8 flex flex-wrap gap-3">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 rounded-full bg-brand-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-800"
        >
          <ArrowLeft size={16} />
          আরও কেনাকাটা করুন
        </Link>
        <Link
          href="/track"
          className="inline-flex items-center gap-2 rounded-full border border-brand-200 px-6 py-2.5 text-sm font-semibold text-brand-800 hover:bg-brand-50"
        >
          অন্য অর্ডার ট্র্যাক করুন
        </Link>
      </div>
    </div>
  )
}
