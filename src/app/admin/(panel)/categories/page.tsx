import { prisma } from '@/lib/prisma'
import { CategoryManager } from '@/components/admin/CategoryManager'

export const dynamic = 'force-dynamic'

export const metadata = { title: 'ক্যাটাগরি' }

export default async function AdminCategoriesPage() {
  const rows = await prisma.category.findMany({
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    include: { _count: { select: { products: true } } },
  })

  return (
    <CategoryManager
      categories={rows.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description,
        image: c.image,
        sortOrder: c.sortOrder,
        isActive: c.isActive,
        productCount: c._count.products,
      }))}
    />
  )
}
