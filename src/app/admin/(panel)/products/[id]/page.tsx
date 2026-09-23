import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ExternalLink } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { ProductForm } from '@/components/admin/ProductForm'
import { parseJsonArray } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export const metadata = { title: 'পণ্য সম্পাদনা' }

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id } }),
    prisma.category.findMany({
      orderBy: { sortOrder: 'asc' },
      select: { id: true, name: true },
    }),
  ])

  if (!product) notFound()

  return (
    <div>
      <header className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-brand-900">
            পণ্য সম্পাদনা
          </h2>
          <p className="mt-1 text-sm text-muted">{product.name}</p>
        </div>

        <Link
          href={`/products/${product.slug}`}
          target="_blank"
          className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 px-4 py-2 text-sm font-medium text-brand-800 hover:bg-brand-50"
        >
          <ExternalLink size={15} />
          দোকানে দেখুন
        </Link>
      </header>

      <ProductForm
        initial={{
          id: product.id,
          name: product.name,
          slug: product.slug,
          categoryId: product.categoryId,
          price: String(product.price),
          comparePrice: product.comparePrice ? String(product.comparePrice) : '',
          stock: String(product.stock),
          sku: product.sku ?? '',
          fabric: product.fabric ?? '',
          shortDesc: product.shortDesc,
          description: product.description,
          images: parseJsonArray<string>(product.images),
          sizes: parseJsonArray<string>(product.sizes),
          colors: parseJsonArray<{ name: string; hex: string }>(product.colors),
          isFeatured: product.isFeatured,
          isActive: product.isActive,
        }}
        categories={categories}
      />
    </div>
  )
}
