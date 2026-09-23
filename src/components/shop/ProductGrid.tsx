import { ProductCard } from '@/components/shop/ProductCard'
import type { ProductSummary } from '@/lib/products'
import { cn } from '@/lib/utils'

export function ProductGrid({
  products,
  columns = 4,
  priorityCount = 0,
  className,
}: {
  products: ProductSummary[]
  columns?: 3 | 4
  priorityCount?: number
  className?: string
}) {
  return (
    <div
      className={cn(
        'grid grid-cols-2 gap-4 sm:gap-5',
        columns === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3',
        'md:grid-cols-3',
        className
      )}
    >
      {products.map((p, i) => (
        <ProductCard key={p.id} product={p} priority={i < priorityCount} />
      ))}
    </div>
  )
}
