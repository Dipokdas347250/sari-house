import { Suspense } from 'react'
import { Header } from '@/components/shop/Header'
import { Footer } from '@/components/shop/Footer'
import { CartDrawer } from '@/components/shop/CartDrawer'
import { FloatingContact } from '@/components/shop/FloatingContact'
import { getCategories } from '@/lib/products'
import { getSettings } from '@/lib/settings'

export default async function ShopLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [categories, settings] = await Promise.all([getCategories(), getSettings()])

  const navCategories = categories.map((c) => ({
    name: c.name,
    slug: c.slug,
    count: c._count.products,
  }))

  return (
    <div className="flex min-h-screen flex-col">
      <Suspense fallback={<div className="h-16 border-b border-brand-100 bg-cream-50" />}>
        <Header
          categories={navCategories}
          phone={settings.phone}
          announcement={settings.announcement}
          siteName={settings.siteName}
        />
      </Suspense>

      <main className="flex-1">{children}</main>

      <Footer settings={settings} categories={navCategories} />

      <CartDrawer freeDeliveryAbove={Number(settings.freeDeliveryAbove) || 0} />
      <FloatingContact whatsapp={settings.whatsapp} phone={settings.phone} />
    </div>
  )
}
