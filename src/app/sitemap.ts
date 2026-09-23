import type { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

const BASE = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(
  /\/$/,
  ''
)

const POLICIES = ['delivery', 'return', 'privacy', 'terms']

/** সার্চ ইঞ্জিনের জন্য সাইটম্যাপ — পণ্য, ক্যাটাগরি ও স্থায়ী পাতাগুলো */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
    }),
    prisma.category.findMany({
      where: { isActive: true },
      select: { slug: true },
      orderBy: { sortOrder: 'asc' },
    }),
  ])

  const newest = products[0]?.updatedAt ?? new Date()

  return [
    {
      url: `${BASE}/`,
      lastModified: newest,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${BASE}/products`,
      lastModified: newest,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    ...categories.map((c) => ({
      url: `${BASE}/category/${c.slug}`,
      lastModified: newest,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    ...products.map((p) => ({
      url: `${BASE}/products/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
    {
      url: `${BASE}/about`,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE}/contact`,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE}/track`,
      changeFrequency: 'yearly',
      priority: 0.4,
    },
    ...POLICIES.map((slug) => ({
      url: `${BASE}/policy/${slug}`,
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    })),
  ]
}
