import type { Metadata } from 'next'
import { CheckoutForm } from '@/components/shop/CheckoutForm'
import { getSettings } from '@/lib/settings'

export const metadata: Metadata = {
  title: 'চেকআউট',
  robots: { index: false, follow: false },
}

export default async function CheckoutPage() {
  const settings = await getSettings()

  return (
    <div className="container-x py-8 sm:py-10">
      <header className="mb-7">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-brand-900 sm:text-3xl">
          অর্ডার সম্পন্ন করুন
        </h1>
        <p className="mt-1.5 text-sm text-muted">
          তথ্যগুলো ঠিকঠাক দিন — আমরা এই ঠিকানাতেই পণ্য পৌঁছে দেব।
        </p>
      </header>

      <CheckoutForm
        deliveryInside={Number(settings.deliveryInsideDhaka) || 0}
        deliveryOutside={Number(settings.deliveryOutsideDhaka) || 0}
        freeDeliveryAbove={Number(settings.freeDeliveryAbove) || 0}
        bkashNumber={settings.bkashNumber}
        nagadNumber={settings.nagadNumber}
      />
    </div>
  )
}
