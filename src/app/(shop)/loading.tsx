import { ProductCardSkeleton } from '@/components/ui/kit'

export default function Loading() {
  return (
    <div className="container-x py-10">
      <div className="skeleton mb-3 h-8 w-56 rounded-lg" />
      <div className="skeleton mb-8 h-4 w-40 rounded" />

      <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}
