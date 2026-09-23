import type { MetadataRoute } from 'next'

const BASE = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(
  /\/$/,
  ''
)

/** ক্রলারদের নির্দেশনা — দোকান খোলা, অ্যাডমিন এলাকা বন্ধ */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/api', '/checkout', '/cart', '/wishlist', '/order/'],
    },
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  }
}
