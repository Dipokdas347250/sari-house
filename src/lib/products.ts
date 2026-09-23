import { prisma } from '@/lib/prisma'
import { parseJsonArray } from '@/lib/utils'

export type ProductColor = { name: string; hex: string }

export type ProductSummary = {
  id: string
  name: string
  slug: string
  price: number
  comparePrice: number | null
  images: string[]
  sizes: string[]
  colors: ProductColor[]
  stock: number
  fabric: string | null
  shortDesc: string
  isFeatured: boolean
  soldCount: number
  categoryName: string
  categorySlug: string
  rating: number
  reviewCount: number
  createdAt: string
}

export type ProductDetail = ProductSummary & {
  description: string
  sku: string | null
  categoryId: string
}

type RawProduct = {
  id: string
  name: string
  slug: string
  description: string
  shortDesc: string
  price: number
  comparePrice: number | null
  sku: string | null
  stock: number
  images: string
  sizes: string
  colors: string
  fabric: string | null
  isFeatured: boolean
  soldCount: number
  createdAt: Date
  categoryId: string
  category: { name: string; slug: string }
}

function shape(p: RawProduct, rating = 0, reviewCount = 0): ProductDetail {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    shortDesc: p.shortDesc,
    price: p.price,
    comparePrice: p.comparePrice,
    sku: p.sku,
    stock: p.stock,
    images: parseJsonArray<string>(p.images),
    sizes: parseJsonArray<string>(p.sizes),
    colors: parseJsonArray<ProductColor>(p.colors),
    fabric: p.fabric,
    isFeatured: p.isFeatured,
    soldCount: p.soldCount,
    categoryId: p.categoryId,
    categoryName: p.category.name,
    categorySlug: p.category.slug,
    rating,
    reviewCount,
    createdAt: p.createdAt.toISOString(),
  }
}

/** অনুমোদিত রিভিউ থেকে গড় রেটিং বের করা */
async function ratingsFor(productIds: string[]) {
  if (productIds.length === 0) return new Map<string, { avg: number; count: number }>()
  const grouped = await prisma.review.groupBy({
    by: ['productId'],
    where: { productId: { in: productIds }, isApproved: true },
    _avg: { rating: true },
    _count: { _all: true },
  })
  return new Map(
    grouped.map((g) => [
      g.productId,
      { avg: g._avg.rating ?? 0, count: g._count._all },
    ])
  )
}

const include = { category: { select: { name: true, slug: true } } } as const

export type ProductQuery = {
  category?: string
  search?: string
  minPrice?: number
  maxPrice?: number
  sort?: string
  page?: number
  perPage?: number
  featured?: boolean
  inStock?: boolean
  size?: string
}

function orderFor(sort?: string) {
  switch (sort) {
    case 'price-asc':
      return { price: 'asc' as const }
    case 'price-desc':
      return { price: 'desc' as const }
    case 'popular':
      return { soldCount: 'desc' as const }
    case 'name':
      return { name: 'asc' as const }
    default:
      return { createdAt: 'desc' as const }
  }
}

export async function getProducts(query: ProductQuery = {}) {
  const perPage = query.perPage ?? 12
  const page = Math.max(1, query.page ?? 1)

  const where: Record<string, unknown> = { isActive: true }
  if (query.category) where.category = { slug: query.category }
  if (query.featured) where.isFeatured = true
  if (query.inStock) where.stock = { gt: 0 }
  if (query.search) {
    where.OR = [
      { name: { contains: query.search } },
      { shortDesc: { contains: query.search } },
      { description: { contains: query.search } },
      { fabric: { contains: query.search } },
    ]
  }
  if (query.minPrice != null || query.maxPrice != null) {
    where.price = {
      ...(query.minPrice != null ? { gte: query.minPrice } : {}),
      ...(query.maxPrice != null ? { lte: query.maxPrice } : {}),
    }
  }
  if (query.size) where.sizes = { contains: query.size }

  const [rows, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include,
      orderBy: orderFor(query.sort),
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.product.count({ where }),
  ])

  const ratings = await ratingsFor(rows.map((r) => r.id))
  const items: ProductSummary[] = rows.map((r) => {
    const stat = ratings.get(r.id)
    return shape(r as RawProduct, stat?.avg ?? 0, stat?.count ?? 0)
  })

  return {
    items,
    total,
    page,
    perPage,
    totalPages: Math.max(1, Math.ceil(total / perPage)),
  }
}

export async function getProductBySlug(slug: string): Promise<ProductDetail | null> {
  const row = await prisma.product.findFirst({
    where: { slug, isActive: true },
    include,
  })
  if (!row) return null
  const ratings = await ratingsFor([row.id])
  const stat = ratings.get(row.id)
  return shape(row as RawProduct, stat?.avg ?? 0, stat?.count ?? 0)
}

export async function getRelatedProducts(
  categoryId: string,
  excludeId: string,
  take = 4
): Promise<ProductSummary[]> {
  const rows = await prisma.product.findMany({
    where: { categoryId, isActive: true, id: { not: excludeId } },
    include,
    orderBy: { soldCount: 'desc' },
    take,
  })
  const ratings = await ratingsFor(rows.map((r) => r.id))
  return rows.map((r) => {
    const stat = ratings.get(r.id)
    return shape(r as RawProduct, stat?.avg ?? 0, stat?.count ?? 0)
  })
}

export async function getCategories() {
  return prisma.category.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    include: { _count: { select: { products: { where: { isActive: true } } } } },
  })
}

export async function getCategoryBySlug(slug: string) {
  return prisma.category.findFirst({ where: { slug, isActive: true } })
}

/** ফিল্টারের জন্য দামের সর্বনিম্ন ও সর্বোচ্চ সীমা */
export async function getPriceRange() {
  const agg = await prisma.product.aggregate({
    where: { isActive: true },
    _min: { price: true },
    _max: { price: true },
  })
  return {
    min: agg._min.price ?? 0,
    max: agg._max.price ?? 10000,
  }
}

export async function getApprovedReviews(productId: string) {
  return prisma.review.findMany({
    where: { productId, isApproved: true },
    orderBy: { createdAt: 'desc' },
  })
}
