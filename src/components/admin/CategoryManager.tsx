'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { Plus, Pencil, Trash2, X, Loader2, Save, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import { saveCategory, deleteCategory } from '@/actions/admin'
import { ImageUploader } from '@/components/admin/ImageUploader'
import { ConfirmAction } from '@/components/admin/ActionButton'
import { SmartImage } from '@/components/ui/SmartImage'
import { EmptyState } from '@/components/ui/kit'
import { makeSlug, toBn, cn } from '@/lib/utils'

export type CategoryRow = {
  id: string
  name: string
  slug: string
  description: string | null
  image: string | null
  sortOrder: number
  isActive: boolean
  productCount: number
}

type FormState = {
  id?: string
  name: string
  slug: string
  description: string
  image: string
  sortOrder: string
  isActive: boolean
}

const empty: FormState = {
  name: '',
  slug: '',
  description: '',
  image: '',
  sortOrder: '0',
  isActive: true,
}

export function CategoryManager({ categories }: { categories: CategoryRow[] }) {
  const router = useRouter()
  const [form, setForm] = useState<FormState | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isPending, startTransition] = useTransition()

  function openNew() {
    setErrors({})
    setForm({ ...empty, sortOrder: String(categories.length + 1) })
  }

  function openEdit(c: CategoryRow) {
    setErrors({})
    setForm({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description ?? '',
      image: c.image ?? '',
      sortOrder: String(c.sortOrder),
      isActive: c.isActive,
    })
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form) return

    startTransition(async () => {
      const res = await saveCategory({
        id: form.id,
        name: form.name,
        slug: form.slug || makeSlug(form.name),
        description: form.description,
        image: form.image,
        sortOrder: form.sortOrder,
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

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">
          মোট <strong className="text-ink">{toBn(categories.length)}</strong> টি ক্যাটাগরি
        </p>
        <button
          type="button"
          onClick={openNew}
          className="inline-flex items-center gap-2 rounded-full bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-800"
        >
          <Plus size={17} />
          নতুন ক্যাটাগরি
        </button>
      </div>

      {categories.length === 0 ? (
        <EmptyState
          title="কোনো ক্যাটাগরি নেই"
          description="পণ্য যোগ করার আগে অন্তত একটি ক্যাটাগরি তৈরি করুন।"
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {categories.map((c) => (
            <li
              key={c.id}
              className="flex gap-4 rounded-2xl border border-brand-100 bg-white p-4"
            >
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-cream-100">
                <SmartImage
                  src={c.image ?? '/seed/cat-tant.svg'}
                  alt=""
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </div>

              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="truncate font-semibold text-ink">{c.name}</h3>
                    <p className="truncate text-xs text-muted">/{c.slug}</p>
                  </div>
                  <span
                    className={cn(
                      'shrink-0 rounded-full px-2 py-0.5 text-[0.65rem] font-semibold',
                      c.isActive
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-cream-200 text-muted'
                    )}
                  >
                    {c.isActive ? <Eye size={11} /> : <EyeOff size={11} />}
                  </span>
                </div>

                <p className="mt-1 text-xs text-muted">
                  {toBn(c.productCount)} টি পণ্য · ক্রম {toBn(c.sortOrder)}
                </p>

                <div className="mt-auto flex items-center gap-1 pt-2">
                  <button
                    type="button"
                    onClick={() => openEdit(c)}
                    aria-label={`${c.name} সম্পাদনা করুন`}
                    className="grid h-8 w-8 place-items-center rounded-full text-brand-700 hover:bg-brand-50"
                  >
                    <Pencil size={15} />
                  </button>
                  <ConfirmAction
                    action={deleteCategory.bind(null, c.id)}
                    ariaLabel={`${c.name} মুছে ফেলুন`}
                    confirmTitle="ক্যাটাগরি মুছে ফেলবেন?"
                    confirmText={`"${c.name}" মুছে ফেলার আগে এর সব পণ্য অন্য ক্যাটাগরিতে সরিয়ে নিতে হবে।`}
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

      {/* ফর্ম */}
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
                {form.id ? 'ক্যাটাগরি সম্পাদনা' : 'নতুন ক্যাটাগরি'}
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
                <label htmlFor="cf-name" className="mb-1.5 block text-sm font-medium text-ink">
                  নাম <span className="text-rose-600">*</span>
                </label>
                <input
                  id="cf-name"
                  value={form.name}
                  onChange={(e) => {
                    const name = e.target.value
                    setForm((f) =>
                      f ? { ...f, name, slug: f.id ? f.slug : makeSlug(name) } : f
                    )
                  }}
                  placeholder="যেমন: জামদানি শাড়ি"
                  className={cn(
                    'w-full rounded-xl border bg-white px-4 py-2.5 text-sm outline-none',
                    errors.name ? 'border-rose-400' : 'border-brand-200 focus:border-brand-500'
                  )}
                />
                {errors.name && <p className="mt-1 text-xs text-rose-600">{errors.name}</p>}
              </div>

              <div className="grid gap-4 sm:grid-cols-[1fr_7rem]">
                <div>
                  <label htmlFor="cf-slug" className="mb-1.5 block text-sm font-medium text-ink">
                    ঠিকানা (URL)
                  </label>
                  <input
                    id="cf-slug"
                    value={form.slug}
                    onChange={(e) => setForm((f) => (f ? { ...f, slug: e.target.value } : f))}
                    placeholder="jamdani"
                    className="w-full rounded-xl border border-brand-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label htmlFor="cf-order" className="mb-1.5 block text-sm font-medium text-ink">
                    ক্রম
                  </label>
                  <input
                    id="cf-order"
                    type="number"
                    value={form.sortOrder}
                    onChange={(e) =>
                      setForm((f) => (f ? { ...f, sortOrder: e.target.value } : f))
                    }
                    className="w-full rounded-xl border border-brand-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="cf-desc" className="mb-1.5 block text-sm font-medium text-ink">
                  বর্ণনা
                </label>
                <textarea
                  id="cf-desc"
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => (f ? { ...f, description: e.target.value } : f))
                  }
                  rows={3}
                  placeholder="ক্যাটাগরির পাতায় দেখানো হবে"
                  className="w-full resize-y rounded-xl border border-brand-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-500"
                />
              </div>

              <ImageUploader
                images={form.image ? [form.image] : []}
                onChange={(imgs) => setForm((f) => (f ? { ...f, image: imgs[0] ?? '' } : f))}
                single
                label="ক্যাটাগরির ছবি"
                hint="বর্গাকার ছবি সবচেয়ে ভালো দেখায়।"
              />

              <label className="flex cursor-pointer items-center gap-2.5 text-sm text-ink">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) =>
                    setForm((f) => (f ? { ...f, isActive: e.target.checked } : f))
                  }
                  className="h-4 w-4 accent-brand-700"
                />
                দোকানে দেখান
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
                {isPending ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                সংরক্ষণ
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
