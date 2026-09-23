import { prisma } from '@/lib/prisma'
import { ProductForm, type ProductFormValues } from '@/components/admin/ProductForm'

export const dynamic = 'force-dynamic'

export const metadata = { title: 'নতুন পণ্য' }

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: 'asc' },
    select: { id: true, name: true },
  })

  // খালি ফর্ম — ক্লায়েন্ট মডিউল থেকে মান আমদানি করা যায় না, তাই এখানেই তৈরি
  const initial: ProductFormValues = {
    name: '',
    slug: '',
    categoryId: categories[0]?.id ?? '',
    price: '',
    comparePrice: '',
    stock: '0',
    sku: '',
    fabric: '',
    shortDesc: '',
    description: '',
    images: [],
    sizes: [],
    colors: [],
    isFeatured: false,
    isActive: true,
  }

  return (
    <div>
      <header className="mb-5">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-brand-900">
          নতুন পণ্য যোগ করুন
        </h2>
        <p className="mt-1 text-sm text-muted">
          তারকা চিহ্নিত ঘরগুলো অবশ্যই পূরণ করতে হবে।
        </p>
      </header>

      <ProductForm initial={initial} categories={categories} />
    </div>
  )
}
