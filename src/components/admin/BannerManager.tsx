'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { Plus, Pencil, Trash2, X, Loader2, Save, Images } from 'lucide-react'
import { toast } from 'sonner'
import { saveBanner, deleteBanner } from '@/actions/admin'
import { ImageUploader } from '@/components/admin/ImageUploader'
import { ConfirmAction } from '@/components/admin/ActionButton'
import { SmartImage } from '@/components/ui/SmartImage'
import { EmptyState } from '@/components/ui/kit'
import { toBn, cn } from '@/lib/utils'

export type BannerRow = {
  id: string
  title: string
  subtitle: string
  image: string
  link: string
  buttonText: string
  sortOrder: number
  isActive: boolean
}

type FormState = {
  id?: string
  title: string
  subtitle: string
  image: string
  link: string
  buttonText: string
  sortOrder: string
  isActive: boolean
}

const empty: FormState = {
  title: '',
  subtitle: '',
  image: '',
  link: '/products',
  buttonText: 'কিনতে চাই',
  sortOrder: '0',
  isActive: true,
}

export function BannerManager({ banners }: { banners: BannerRow[] }) {
  const router = useRouter()
  const [form, setForm] = useState<FormState | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isPending, startTransition] = useTransition()

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form) return

    startTransition(async () => {
      const res = await saveBanner({ ...form })
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
          হোমপেজের স্লাইডারে <strong className="text-ink">{toBn(banners.length)}</strong> টি
          ব্যানার
        </p>
        <button
          type="button"
          onClick={() => {
            setErrors({})
            setForm({ ...empty, sortOrder: String(banners.length + 1) })
          }}
          className="inline-flex items-center gap-2 rounded-full bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-800"
        >
          <Plus size={17} />
          নতুন ব্যানার
        </button>
      </div>

      {banners.length === 0 ? (
        <EmptyState
          icon={<Images size={44} />}
          title="কোনো ব্যানার নেই"
          description="হোমপেজের উপরে স্লাইডার দেখাতে অন্তত একটি ব্যানার যোগ করুন।"
        />
      ) : (
        <ul className="space-y-4">
          {banners.map((b) => (
            <li
              key={b.id}
              className={cn(
                'overflow-hidden rounded-2xl border bg-white',
                b.isActive ? 'border-brand-100' : 'border-cream-300 opacity-75'
              )}
            >
              <div className="flex flex-col sm:flex-row">
                <div className="relative aspect-16/9 w-full shrink-0 bg-cream-100 sm:aspect-auto sm:h-36 sm:w-56">
                  <SmartImage
                    src={b.image}
                    alt=""
                    fill
                    sizes="224px"
                    className="object-cover"
                  />
                </div>

                <div className="flex flex-1 flex-col p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-ink">{b.title}</h3>
                      {b.subtitle && (
                        <p className="mt-0.5 line-clamp-2 text-sm text-muted">{b.subtitle}</p>
                      )}
                    </div>
                    <span
                      className={cn(
                        'shrink-0 rounded-full px-2.5 py-0.5 text-[0.65rem] font-semibold',
                        b.isActive
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-cream-200 text-muted'
                      )}
                    >
                      {b.isActive ? 'চালু' : 'বন্ধ'}
                    </span>
                  </div>

                  <p className="mt-2 text-xs text-muted">
                    বোতাম: {b.buttonText} → {b.link} · ক্রম {toBn(b.sortOrder)}
                  </p>

                  <div className="mt-auto flex items-center gap-1 pt-3">
                    <button
                      type="button"
                      onClick={() => {
                        setErrors({})
                        setForm({
                          id: b.id,
                          title: b.title,
                          subtitle: b.subtitle,
                          image: b.image,
                          link: b.link,
                          buttonText: b.buttonText,
                          sortOrder: String(b.sortOrder),
                          isActive: b.isActive,
                        })
                      }}
                      aria-label="ব্যানার সম্পাদনা করুন"
                      className="grid h-8 w-8 place-items-center rounded-full text-brand-700 hover:bg-brand-50"
                    >
                      <Pencil size={15} />
                    </button>
                    <ConfirmAction
                      action={deleteBanner.bind(null, b.id)}
                      ariaLabel="ব্যানার মুছে ফেলুন"
                      confirmTitle="ব্যানারটি মুছে ফেলবেন?"
                      confirmText={`"${b.title}" হোমপেজ থেকে সরে যাবে।`}
                      className="grid h-8 w-8 place-items-center rounded-full text-rose-600 hover:bg-rose-50"
                    >
                      <Trash2 size={15} />
                    </ConfirmAction>
                  </div>
                </div>
              </div>
            </li>
          ))}
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
                {form.id ? 'ব্যানার সম্পাদনা' : 'নতুন ব্যানার'}
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
                <label htmlFor="bn-title" className="mb-1.5 block text-sm font-medium text-ink">
                  শিরোনাম <span className="text-rose-600">*</span>
                </label>
                <input
                  id="bn-title"
                  value={form.title}
                  onChange={(e) => setForm((f) => (f ? { ...f, title: e.target.value } : f))}
                  placeholder="বিয়ের মৌসুমের নতুন সংগ্রহ"
                  className={cn(field, errors.title && 'border-rose-400')}
                />
                {errors.title && <p className="mt-1 text-xs text-rose-600">{errors.title}</p>}
              </div>

              <div>
                <label htmlFor="bn-sub" className="mb-1.5 block text-sm font-medium text-ink">
                  উপশিরোনাম
                </label>
                <input
                  id="bn-sub"
                  value={form.subtitle}
                  onChange={(e) => setForm((f) => (f ? { ...f, subtitle: e.target.value } : f))}
                  placeholder="৩০% পর্যন্ত ছাড় — সীমিত সময়ের জন্য"
                  className={field}
                />
              </div>

              <ImageUploader
                images={form.image ? [form.image] : []}
                onChange={(imgs) => setForm((f) => (f ? { ...f, image: imgs[0] ?? '' } : f))}
                single
                label="ব্যানারের ছবি"
                hint="চওড়া ছবি (যেমন ১৬০০×৯০০) সবচেয়ে ভালো দেখায়।"
              />
              {errors.image && <p className="-mt-2 text-xs text-rose-600">{errors.image}</p>}

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="bn-btn" className="mb-1.5 block text-sm font-medium text-ink">
                    বোতামের লেখা
                  </label>
                  <input
                    id="bn-btn"
                    value={form.buttonText}
                    onChange={(e) =>
                      setForm((f) => (f ? { ...f, buttonText: e.target.value } : f))
                    }
                    className={field}
                  />
                </div>
                <div>
                  <label htmlFor="bn-link" className="mb-1.5 block text-sm font-medium text-ink">
                    বোতামের ঠিকানা
                  </label>
                  <input
                    id="bn-link"
                    value={form.link}
                    onChange={(e) => setForm((f) => (f ? { ...f, link: e.target.value } : f))}
                    placeholder="/category/katan"
                    className={field}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="bn-order" className="mb-1.5 block text-sm font-medium text-ink">
                    ক্রম
                  </label>
                  <input
                    id="bn-order"
                    type="number"
                    value={form.sortOrder}
                    onChange={(e) =>
                      setForm((f) => (f ? { ...f, sortOrder: e.target.value } : f))
                    }
                    className={field}
                  />
                </div>
                <label className="flex cursor-pointer items-center gap-2.5 pt-7 text-sm text-ink">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) =>
                      setForm((f) => (f ? { ...f, isActive: e.target.checked } : f))
                    }
                    className="h-4 w-4 accent-brand-700"
                  />
                  হোমপেজে দেখান
                </label>
              </div>
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
