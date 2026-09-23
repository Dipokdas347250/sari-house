import type { Metadata } from 'next'
import { PackageSearch, Search, AlertCircle } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { OrderDetails, type OrderView } from '@/components/shop/OrderDetails'
import { normalizePhone } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'অর্ডার ট্র্যাক করুন',
  description: 'অর্ডার নম্বর আর মোবাইল নম্বর দিয়ে আপনার অর্ডারের সর্বশেষ অবস্থা জানুন।',
}

type SearchParams = Record<string, string | string[] | undefined>
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)

export default async function TrackPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const sp = await searchParams
  const orderNo = one(sp.order)?.trim()
  const phone = one(sp.phone)?.trim()

  let order: OrderView | null = null
  let notFound = false

  if (orderNo && phone) {
    const found = await prisma.order.findFirst({
      where: {
        orderNo: orderNo.toUpperCase(),
        phone: normalizePhone(phone),
      },
      include: { items: true },
    })

    if (found) {
      order = {
        ...found,
        createdAt: found.createdAt.toISOString(),
        items: found.items.map((i) => ({
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
    } else {
      notFound = true
    }
  }

  return (
    <div className="container-x py-8 sm:py-12">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8 text-center">
          <span className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-brand-50 text-brand-700">
            <PackageSearch size={26} />
          </span>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-brand-900 sm:text-3xl">
            অর্ডার ট্র্যাক করুন
          </h1>
          <p className="mt-2 text-sm text-muted">
            অর্ডার নম্বর আর যে মোবাইল নম্বর দিয়ে অর্ডার করেছিলেন, দুটো দিলেই অবস্থা দেখা যাবে।
          </p>
        </header>

        <form
          method="get"
          className="no-print rounded-2xl border border-brand-100 bg-white p-5 sm:p-6"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="tr-order" className="mb-1.5 block text-sm font-medium text-ink">
                অর্ডার নম্বর
              </label>
              <input
                id="tr-order"
                name="order"
                required
                defaultValue={orderNo ?? ''}
                placeholder="যেমন: SG-260922-4821"
                className="w-full rounded-xl border border-brand-200 px-4 py-2.5 text-sm uppercase outline-none focus:border-brand-500"
              />
            </div>
            <div>
              <label htmlFor="tr-phone" className="mb-1.5 block text-sm font-medium text-ink">
                মোবাইল নম্বর
              </label>
              <input
                id="tr-phone"
                name="phone"
                required
                inputMode="tel"
                defaultValue={phone ?? ''}
                placeholder="01XXXXXXXXX"
                className="w-full rounded-xl border border-brand-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-brand-700 py-3 font-semibold text-white transition-colors hover:bg-brand-800"
          >
            <Search size={18} />
            অর্ডার খুঁজুন
          </button>
        </form>

        {notFound && (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-5">
            <AlertCircle size={20} className="mt-0.5 shrink-0 text-rose-600" />
            <div>
              <p className="font-semibold text-rose-900">অর্ডারটি খুঁজে পাওয়া গেল না</p>
              <p className="mt-1 text-sm text-rose-800">
                অর্ডার নম্বর ও মোবাইল নম্বর দুটোই ঠিক আছে কি না দেখে নিন। সমস্যা হলে আমাদের
                ফোন করুন।
              </p>
            </div>
          </div>
        )}
      </div>

      {order && (
        <div className="mt-10">
          <OrderDetails order={order} />
        </div>
      )}
    </div>
  )
}
