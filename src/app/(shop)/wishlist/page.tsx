import type { Metadata } from 'next'
import { WishlistView } from '@/components/shop/WishlistView'

export const metadata: Metadata = {
  title: 'পছন্দের তালিকা',
  robots: { index: false, follow: true },
}

export default function WishlistPage() {
  return (
    <div className="container-x py-8 sm:py-10">
      <h1 className="mb-2 font-[family-name:var(--font-display)] text-2xl font-bold text-brand-900 sm:text-3xl">
        পছন্দের তালিকা
      </h1>
      <p className="mb-7 text-sm text-muted">
        এই তালিকা শুধু আপনার এই ব্রাউজারে সংরক্ষিত থাকে।
      </p>

      <WishlistView />
    </div>
  )
}
