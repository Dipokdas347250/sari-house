'use client'

import { useActionState, useRef, useState } from 'react'
import { useFormStatus } from 'react-dom'
import { Star, Loader2, PenLine } from 'lucide-react'
import { toast } from 'sonner'
import { submitReview } from '@/actions/shop'
import { Stars } from '@/components/ui/Stars'
import { cn, toBn, formatDate } from '@/lib/utils'

export type ReviewItem = {
  id: string
  customerName: string
  rating: number
  comment: string
  createdAt: string
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-700 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-800 disabled:opacity-60"
    >
      {pending ? <Loader2 size={16} className="animate-spin" /> : <PenLine size={16} />}
      মতামত পাঠান
    </button>
  )
}

export function ReviewSection({
  productId,
  reviews,
  rating,
}: {
  productId: string
  reviews: ReviewItem[]
  rating: number
}) {
  const [stars, setStars] = useState(5)
  const [showForm, setShowForm] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  const [state, action] = useActionState(
    async (prev: Awaited<ReturnType<typeof submitReview>> | null, formData: FormData) => {
      const res = await submitReview(prev, formData)
      if (res.ok) {
        toast.success(res.message)
        formRef.current?.reset()
        setStars(5)
        setShowForm(false)
      } else {
        toast.error(res.message)
      }
      return res
    },
    null
  )

  // রেটিং অনুযায়ী কয়টি করে রিভিউ
  const buckets = [5, 4, 3, 2, 1].map((n) => ({
    n,
    count: reviews.filter((r) => r.rating === n).length,
  }))

  return (
    <div className="grid gap-10 lg:grid-cols-[20rem_1fr]">
      {/* সারাংশ */}
      <div>
        <div className="rounded-2xl border border-brand-100 bg-white p-6 text-center">
          <div className="font-[family-name:var(--font-display)] text-5xl font-bold text-brand-800">
            {toBn(rating.toFixed(1))}
          </div>
          <div className="mt-2 flex justify-center">
            <Stars rating={rating} showCount={false} size={18} />
          </div>
          <p className="mt-2 text-sm text-muted">
            {reviews.length > 0
              ? `${toBn(reviews.length)} জনের মতামত`
              : 'এখনো কোনো মতামত আসেনি'}
          </p>

          <div className="mt-5 space-y-1.5">
            {buckets.map((b) => {
              const pct = reviews.length ? (b.count / reviews.length) * 100 : 0
              return (
                <div key={b.n} className="flex items-center gap-2 text-xs">
                  <span className="flex w-8 items-center justify-end gap-0.5 text-muted">
                    {toBn(b.n)}
                    <Star size={11} className="fill-gold-400 text-gold-400" />
                  </span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-cream-200">
                    <div
                      className="h-full rounded-full bg-gold-400"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-6 text-muted">{toBn(b.count)}</span>
                </div>
              )
            })}
          </div>

          <button
            type="button"
            onClick={() => setShowForm((v) => !v)}
            className="mt-6 w-full rounded-full border border-brand-700 py-2.5 text-sm font-semibold text-brand-800 transition-colors hover:bg-brand-50"
          >
            {showForm ? 'ফর্ম বন্ধ করুন' : 'আপনার মতামত লিখুন'}
          </button>
        </div>
      </div>

      {/* তালিকা ও ফর্ম */}
      <div>
        {showForm && (
          <form
            ref={formRef}
            action={action}
            className="mb-8 animate-fade-up rounded-2xl border border-brand-100 bg-white p-6"
          >
            <h3 className="mb-4 font-[family-name:var(--font-display)] text-lg font-semibold text-brand-900">
              পণ্যটি কেমন লাগল?
            </h3>

            <input type="hidden" name="productId" value={productId} />
            <input type="hidden" name="rating" value={stars} />

            <div className="mb-4">
              <span className="mb-2 block text-sm font-medium text-ink">আপনার রেটিং</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setStars(n)}
                    aria-label={`${toBn(n)} তারকা`}
                    aria-pressed={stars === n}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      size={26}
                      className={cn(
                        n <= stars
                          ? 'fill-gold-400 text-gold-400'
                          : 'fill-transparent text-cream-300'
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="rv-name" className="mb-1.5 block text-sm font-medium text-ink">
                আপনার নাম
              </label>
              <input
                id="rv-name"
                name="customerName"
                required
                placeholder="যেমন: নাজনীন আক্তার"
                className="w-full rounded-xl border border-brand-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500"
              />
              {state && !state.ok && state.fieldErrors?.customerName && (
                <p className="mt-1 text-xs text-rose-600">{state.fieldErrors.customerName}</p>
              )}
            </div>

            <div className="mb-5">
              <label htmlFor="rv-comment" className="mb-1.5 block text-sm font-medium text-ink">
                আপনার মন্তব্য
              </label>
              <textarea
                id="rv-comment"
                name="comment"
                required
                rows={4}
                placeholder="কাপড়ের মান, রঙ, ডেলিভারি — যা মনে হয়েছে লিখুন"
                className="w-full resize-y rounded-xl border border-brand-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500"
              />
              {state && !state.ok && state.fieldErrors?.comment && (
                <p className="mt-1 text-xs text-rose-600">{state.fieldErrors.comment}</p>
              )}
            </div>

            <SubmitButton />
            <p className="mt-3 text-xs text-muted">
              মতামতটি যাচাই করার পর সাইটে প্রকাশ করা হবে।
            </p>
          </form>
        )}

        {reviews.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-brand-200 bg-cream-50 p-10 text-center">
            <p className="text-sm text-muted">
              এই পণ্যটি নিয়ে এখনো কেউ কিছু লেখেননি। আপনিই প্রথম হোন!
            </p>
          </div>
        ) : (
          <ul className="space-y-4">
            {reviews.map((r) => (
              <li key={r.id} className="rounded-2xl border border-brand-100 bg-white p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-brand-50 font-semibold text-brand-700">
                      {r.customerName.trim().charAt(0)}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-ink">{r.customerName}</p>
                      <p className="text-xs text-muted">{formatDate(r.createdAt)}</p>
                    </div>
                  </div>
                  <Stars rating={r.rating} showCount={false} />
                </div>
                <p className="mt-3 text-sm leading-relaxed text-ink">{r.comment}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
