'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { Plus, Pencil, Trash2, X, Loader2, Save, Ticket, Copy } from 'lucide-react'
import { toast } from 'sonner'
import { saveCoupon, deleteCoupon } from '@/actions/admin'
import { ConfirmAction } from '@/components/admin/ActionButton'
import { EmptyState } from '@/components/ui/kit'
import { formatTaka, toBn, formatDate, cn } from '@/lib/utils'

export type CouponRow = {
  id: string
  code: string
  type: string
  value: number
  minOrder: number
  maxDiscount: number | null
  usageLimit: number | null
  usedCount: number
  expiresAt: string | null
  isActive: boolean
}

type FormState = {
  id?: string
  code: string
  type: 'percent' | 'fixed'
  value: string
  minOrder: string
  maxDiscount: string
  usageLimit: string
  expiresAt: string
  isActive: boolean
}

const empty: FormState = {
  code: '',
  type: 'percent',
  value: '',
  minOrder: '0',
  maxDiscount: '',
  usageLimit: '',
  expiresAt: '',
  isActive: true,
}

export function CouponManager({ coupons }: { coupons: CouponRow[] }) {
  const router = useRouter()
  const [form, setForm] = useState<FormState | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isPending, startTransition] = useTransition()

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form) return

    startTransition(async () => {
      const res = await saveCoupon({
        id: form.id,
        code: form.code,
        type: form.type,
        value: form.value,
        minOrder: form.minOrder || 0,
        maxDiscount: form.maxDiscount || 0,
        usageLimit: form.usageLimit || 0,
        expiresAt: form.expiresAt || null,
        isActive: form.isActive,
      })

      if (res.ok) {
        toast.success(res.message)
        setForm(null)
        router.refresh()
      } else {
        setErrors(res.fieldErrors ?? {})
        toast.error(res.message)
      }
    })
  }

  const field =
    'w-full rounded-xl border border-brand-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-500'

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">
          মোট <strong className="text-ink">{toBn(coupons.length)}</strong> টি কুপন
        </p>
        <button
          type="button"
          onClick={() => {
            setErrors({})
            setForm({ ...empty })
          }}
          className="inline-flex items-center gap-2 rounded-full bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-800"
        >
          <Plus size={17} />
          নতুন কুপন
        </button>
      </div>

      {coupons.length === 0 ? (
        <EmptyState
          icon={<Ticket size={44} />}
          title="কোনো কুপন নেই"
          description="ছাড় দিতে চাইলে একটি কুপন কোড তৈরি করুন।"
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {coupons.map((c) => {
            const expired = c.expiresAt && new Date(c.expiresAt) < new Date()
            const exhausted = c.usageLimit != null && c.usedCount >= c.usageLimit
            const live = c.isActive && !expired && !exhausted

            return (
              <li
                key={c.id}
                className={cn(
                  'rounded-2xl border bg-white p-5',
                  live ? 'border-brand-100' : 'border-cream-300 opacity-75'
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-[family-name:var(--font-display)] text-lg font-bold tracking-wide text-brand-800">
                      {c.code}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard?.writeText(c.code)
                        toast.success('কোড কপি হয়েছে')
                      }}
                      aria-label="কোড কপি করুন"
                      className="grid h-7 w-7 place-items-center rounded-full text-muted hover:bg-brand-50 hover:text-brand-700"
                    >
                      <Copy size={13} />
                    </button>
                  </div>

                  <span
                    className={cn(
                      'shrink-0 rounded-full px-2.5 py-0.5 text-[0.65rem] font-semibold',
                      live
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-cream-200 text-muted'
                    )}
                  >
                    {!c.isActive
                      ? 'বন্ধ'
                      : expired
                        ? 'মেয়াদ শেষ'
                        : exhausted
                          ? 'সীমা শেষ'
                          : 'চালু'}
                  </span>
                </div>

                <p className="mt-2 text-xl font-bold text-ink">
                  {c.type === 'percent' ? `${toBn(c.value)}% ছাড়` : `${formatTaka(c.value)} ছাড়`}
                </p>

                <dl className="mt-3 space-y-1 text-xs text-muted">
                  <div className="flex justify-between">
                    <dt>সর্বনিম্ন অর্ডার</dt>
                    <dd className="text-ink">{formatTaka(c.minOrder)}</dd>
                  </div>
                  {c.maxDiscount != null && (
                    <div className="flex justify-between">
                      <dt>সর্বোচ্চ ছাড়</dt>
                      <dd className="text-ink">{formatTaka(c.maxDiscount)}</dd>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <dt>ব্যবহার</dt>
                    <dd className="text-ink">
                      {toBn(c.usedCount)}
                      {c.usageLimit != null ? ` / ${toBn(c.usageLimit)}` : ' বার'}
                    </dd>
                  </div>
                  {c.expiresAt && (
                    <div className="flex justify-between">
                      <dt>মেয়াদ</dt>
                      <dd className="text-ink">{formatDate(c.expiresAt)}</dd>
                    </div>
                  )}
                </dl>

                <div className="mt-4 flex items-center gap-1 border-t border-brand-50 pt-3">
                  <button
                    type="button"
                    onClick={() => {
                      setErrors({})
                      setForm({
                        id: c.id,
                        code: c.code,
                        type: c.type as 'percent' | 'fixed',
                        value: String(c.value),
                        minOrder: String(c.minOrder),
                        maxDiscount: c.maxDiscount ? String(c.maxDiscount) : '',
                        usageLimit: c.usageLimit ? String(c.usageLimit) : '',
                        expiresAt: c.expiresAt ? c.expiresAt.slice(0, 10) : '',
                        isActive: c.isActive,
                      })
                    }}
                    aria-label={`${c.code} সম্পাদনা করুন`}
                    className="grid h-8 w-8 place-items-center rounded-full text-brand-700 hover:bg-brand-50"
                  >
                    <Pencil size={15} />
                  </button>
                  <ConfirmAction
                    action={deleteCoupon.bind(null, c.id)}
                    ariaLabel={`${c.code} মুছে ফেলুন`}
                    confirmTitle="কুপনটি মুছে ফেলবেন?"
                    confirmText={`"${c.code}" মুছে ফেললে কেউ আর এটি ব্যবহার করতে পারবে না।`}
                    className="grid h-8 w-8 place-items-center rounded-full text-rose-600 hover:bg-rose-50"
                  >
                    <Trash2 size={15} />
                  </ConfirmAction>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {form && (
        <div
          className="fixed inset-0 z-[70] grid place-items-center overflow-y-auto bg-brand-950/50 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => !isPending && setForm(null)}
        >
          <form
            onSubmit={submit}
            onClick={(e) => e.stopPropagation()}
            className="my-8 w-full max-w-lg rounded-2xl bg-cream-50 p-6 shadow-2xl"
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-brand-900">
                {form.id ? 'কুপন সম্পাদনা' : 'নতুন কুপন'}
              </h2>
              <button
                type="button"
                onClick={() => setForm(null)}
                aria-label="বন্ধ করুন"
                className="grid h-9 w-9 place-items-center rounded-full text-ink hover:bg-brand-50"
              >
                <X size={19} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="cp-code" className="mb-1.5 block text-sm font-medium text-ink">
                  কুপন কোড <span className="text-rose-600">*</span>
                </label>
                <input
                  id="cp-code"
                  value={form.code}
                  onChange={(e) =>
                    setForm((f) => (f ? { ...f, code: e.target.value.toUpperCase() } : f))
                  }
                  placeholder="EID25"
                  className={cn(field, 'uppercase', errors.code && 'border-rose-400')}
                />
                {errors.code && <p className="mt-1 text-xs text-rose-600">{errors.code}</p>}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="cp-type" className="mb-1.5 block text-sm font-medium text-ink">
                    ছাড়ের ধরন
                  </label>
                  <select
                    id="cp-type"
                    value={form.type}
                    onChange={(e) =>
                      setForm((f) =>
                        f ? { ...f, type: e.target.value as 'percent' | 'fixed' } : f
                      )
                    }
                    className={field}
                  >
                    <option value="percent">শতকরা (%)</option>
                    <option value="fixed">নির্দিষ্ট টাকা (৳)</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="cp-value" className="mb-1.5 block text-sm font-medium text-ink">
                    মান <span className="text-rose-600">*</span>
                  </label>
                  <input
                    id="cp-value"
                    type="number"
                    min={1}
                    value={form.value}
                    onChange={(e) => setForm((f) => (f ? { ...f, value: e.target.value } : f))}
                    placeholder={form.type === 'percent' ? '১৫' : '২০০'}
                    className={cn(field, errors.value && 'border-rose-400')}
                  />
                  {errors.value && <p className="mt-1 text-xs text-rose-600">{errors.value}</p>}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="cp-min" className="mb-1.5 block text-sm font-medium text-ink">
                    সর্বনিম্ন অর্ডার (৳)
                  </label>
                  <input
                    id="cp-min"
                    type="number"
                    min={0}
                    value={form.minOrder}
                    onChange={(e) =>
                      setForm((f) => (f ? { ...f, minOrder: e.target.value } : f))
                    }
                    className={field}
                  />
                </div>

                <div>
                  <label htmlFor="cp-max" className="mb-1.5 block text-sm font-medium text-ink">
                    সর্বোচ্চ ছাড় (৳)
                  </label>
                  <input
                    id="cp-max"
                    type="number"
                    min={0}
                    value={form.maxDiscount}
                    onChange={(e) =>
                      setForm((f) => (f ? { ...f, maxDiscount: e.target.value } : f))
                    }
                    placeholder="সীমা নেই"
                    className={field}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="cp-limit" className="mb-1.5 block text-sm font-medium text-ink">
                    ব্যবহারের সীমা
                  </label>
                  <input
                    id="cp-limit"
                    type="number"
                    min={0}
                    value={form.usageLimit}
                    onChange={(e) =>
                      setForm((f) => (f ? { ...f, usageLimit: e.target.value } : f))
                    }
                    placeholder="সীমা নেই"
                    className={field}
                  />
                </div>

                <div>
                  <label htmlFor="cp-exp" className="mb-1.5 block text-sm font-medium text-ink">
                    মেয়াদ শেষ
                  </label>
                  <input
                    id="cp-exp"
                    type="date"
                    value={form.expiresAt}
                    onChange={(e) =>
                      setForm((f) => (f ? { ...f, expiresAt: e.target.value } : f))
                    }
                    className={field}
                  />
                </div>
              </div>

              <label className="flex cursor-pointer items-center gap-2.5 text-sm text-ink">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) =>
                    setForm((f) => (f ? { ...f, isActive: e.target.checked } : f))
                  }
                  className="h-4 w-4 accent-brand-700"
                />
                কুপনটি চালু রাখুন
              </label>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setForm(null)}
                disabled={isPending}
                className="flex-1 rounded-full border border-brand-200 py-2.5 text-sm font-semibold text-ink hover:bg-white disabled:opacity-50"
              >
                বাতিল
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-brand-700 py-2.5 text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-50"
              >
                {isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                সংরক্ষণ
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
