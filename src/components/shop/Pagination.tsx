import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn, toBn } from '@/lib/utils'

export function Pagination({
  page,
  totalPages,
  basePath,
  params,
}: {
  page: number
  totalPages: number
  basePath: string
  params: Record<string, string | undefined>
}) {
  if (totalPages <= 1) return null

  const href = (p: number) => {
    const sp = new URLSearchParams()
    for (const [k, v] of Object.entries(params)) {
      if (v && k !== 'page') sp.set(k, v)
    }
    if (p > 1) sp.set('page', String(p))
    const qs = sp.toString()
    return qs ? `${basePath}?${qs}` : basePath
  }

  // বর্তমান পাতার আশেপাশের নম্বরগুলো
  const pages: (number | '…')[] = []
  const window = 1
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - page) <= window) {
      pages.push(i)
    } else if (pages[pages.length - 1] !== '…') {
      pages.push('…')
    }
  }

  const linkClass =
    'grid h-10 min-w-10 place-items-center rounded-full px-3 text-sm font-medium transition-colors'

  return (
    <nav className="mt-10 flex items-center justify-center gap-1.5" aria-label="পাতা নির্বাচন">
      {page > 1 ? (
        <Link href={href(page - 1)} className={cn(linkClass, 'border border-brand-200 text-brand-800 hover:bg-brand-50')} aria-label="আগের পাতা">
          <ChevronLeft size={18} />
        </Link>
      ) : (
        <span className={cn(linkClass, 'border border-brand-100 text-brand-200')} aria-hidden>
          <ChevronLeft size={18} />
        </span>
      )}

      {pages.map((p, i) =>
        p === '…' ? (
          <span key={`gap-${i}`} className="px-1 text-muted">
            …
          </span>
        ) : (
          <Link
            key={p}
            href={href(p)}
            aria-current={p === page ? 'page' : undefined}
            className={cn(
              linkClass,
              p === page
                ? 'bg-brand-700 text-white'
                : 'border border-brand-200 text-brand-800 hover:bg-brand-50'
            )}
          >
            {toBn(p)}
          </Link>
        )
      )}

      {page < totalPages ? (
        <Link href={href(page + 1)} className={cn(linkClass, 'border border-brand-200 text-brand-800 hover:bg-brand-50')} aria-label="পরের পাতা">
          <ChevronRight size={18} />
        </Link>
      ) : (
        <span className={cn(linkClass, 'border border-brand-100 text-brand-200')} aria-hidden>
          <ChevronRight size={18} />
        </span>
      )}
    </nav>
  )
}
