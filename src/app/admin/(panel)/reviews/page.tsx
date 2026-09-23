import Link from 'next/link'
import { Check, EyeOff, Trash2, Star, MessageSquareQuote } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { ActionButton, ConfirmAction } from '@/components/admin/ActionButton'
import { setReviewApproval, deleteReview } from '@/actions/admin'
import { Stars } from '@/components/ui/Stars'
import { EmptyState } from '@/components/ui/kit'
import { toBn, formatDateTime, cn } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export const metadata = { title: 'রিভিউ' }

type SearchParams = Record<string, string | string[] | undefined>
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const sp = await searchParams
  const filter = one(sp.filter) ?? 'pending'

  const where =
    filter === 'approved'
      ? { isApproved: true }
      : filter === 'pending'
        ? { isApproved: false }
        : {}

  const [reviews, pendingCount, approvedCount] = await Promise.all([
    prisma.review.findMany({
      where,
      include: { product: { select: { name: true, slug: true } } },
      orderBy: { createdAt: 'desc' },
      take: 60,
    }),
    prisma.review.count({ where: { isApproved: false } }),
    prisma.review.count({ where: { isApproved: true } }),
  ])

  const tabs = [
    { key: 'pending', label: `অপেক্ষমাণ (${toBn(pendingCount)})` },
    { key: 'approved', label: `প্রকাশিত (${toBn(approvedCount)})` },
    { key: 'all', label: 'সব' },
  ]

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={`/admin/reviews?filter=${t.key}`}
            className={cn(
              'rounded-full px-4 py-2 text-sm font-medium transition-colors',
              filter === t.key ? 'bg-brand-700 text-white' : 'bg-white text-ink hover:bg-cream-50'
            )}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {reviews.length === 0 ? (
        <EmptyState
          icon={<MessageSquareQuote size={44} />}
          title="কোনো রিভিউ নেই"
          description={
            filter === 'pending'
              ? 'নতুন কোনো মতামত যাচাইয়ের অপেক্ষায় নেই।'
              : 'এই তালিকায় কিছু পাওয়া যায়নি।'
          }
        />
      ) : (
        <ul className="space-y-3">
          {reviews.map((r) => (
            <li
              key={r.id}
              className={cn(
                'rounded-2xl border bg-white p-5',
                r.isApproved ? 'border-brand-100' : 'border-amber-200 bg-amber-50/40'
              )}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-50 font-semibold text-brand-700">
                    {r.customerName.trim().charAt(0)}
                  </span>
                  <div>
                    <p className="font-semibold text-ink">{r.customerName}</p>
                    <p className="text-xs text-muted">{formatDateTime(r.createdAt)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Stars rating={r.rating} showCount={false} />
                  <span
                    className={cn(
                      'rounded-full px-2.5 py-0.5 text-[0.65rem] font-semibold',
                      r.isApproved
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-amber-100 text-amber-900'
                    )}
                  >
                    {r.isApproved ? 'প্রকাশিত' : 'অপেক্ষমাণ'}
                  </span>
                </div>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-ink">{r.comment}</p>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-brand-50 pt-3">
                <Link
                  href={`/products/${r.product.slug}`}
                  target="_blank"
                  className="flex items-center gap-1.5 text-xs text-muted hover:text-brand-700"
                >
                  <Star size={12} />
                  {r.product.name}
                </Link>

                <div className="flex items-center gap-2">
                  <ActionButton
                    action={setReviewApproval.bind(null, r.id, !r.isApproved)}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors',
                      r.isApproved
                        ? 'bg-cream-200 text-ink hover:bg-cream-300'
                        : 'bg-emerald-600 text-white hover:bg-emerald-700'
                    )}
                  >
                    {r.isApproved ? (
                      <>
                        <EyeOff size={13} />
                        লুকিয়ে ফেলুন
                      </>
                    ) : (
                      <>
                        <Check size={13} />
                        প্রকাশ করুন
                      </>
                    )}
                  </ActionButton>

                  <ConfirmAction
                    action={deleteReview.bind(null, r.id)}
                    ariaLabel="রিভিউ মুছে ফেলুন"
                    confirmTitle="রিভিউটি মুছে ফেলবেন?"
                    confirmText="মুছে ফেললে এটি আর ফিরে পাওয়া যাবে না।"
                    className="grid h-8 w-8 place-items-center rounded-full text-rose-600 hover:bg-rose-50"
                  >
                    <Trash2 size={15} />
                  </ConfirmAction>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
