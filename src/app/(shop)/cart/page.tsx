import type { Metadata } from 'next'
import { CartView } from '@/components/shop/CartView'
import { getSettings } from '@/lib/settings'

export const metadata: Metadata = {
  title: 'আপনার কার্ট',
  robots: { index: false, follow: true },
}

export default async function CartPage() {
  const settings = await getSettings()

  return (
    <div className="container-x py-8 sm:py-10">
      <h1 className="mb-7 font-[family-name:var(--font-display)] text-2xl font-bold text-brand-900 sm:text-3xl">
        আপনার কার্ট
      </h1>

      <CartView
        deliveryInside={Number(settings.deliveryInsideDhaka) || 0}
        deliveryOutside={Number(settings.deliveryOutsideDhaka) || 0}
        freeDeliveryAbove={Number(settings.freeDeliveryAbove) || 0}
      />
    </div>
  )
}
