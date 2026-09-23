'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Loader2, Save, X, Plus, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { saveProduct, type ProductInput } from '@/actions/admin'
import { ImageUploader } from '@/components/admin/ImageUploader'
import { makeSlug, cn } from '@/lib/utils'

export type ProductFormValues = {
  id?: string
  name: string
  slug: string
  categoryId: string
  price: string
  comparePrice: string
  stock: string
  sku: string
  fabric: string
  shortDesc: string
  description: string
  images: string[]
  sizes: string[]
  colors: { name: string; hex: string }[]
  isFeatured: boolean
  isActive: boolean
}

const SIZE_SUGGESTIONS = [
  'ফ্রি সাইজ',
  '১২ হাত',
  '১৩ হাত',
  'আনস্টিচড',
  'এস',
  'এম',
  'এল',
  'এক্সএল',
  'ডাবল এক্সএল',
]

const COLOR_SUGGESTIONS = [
  { name: 'লাল', hex: '#c1121f' },
  { name: 'মেরুন', hex: '#7a1029' },
  { name: 'গাঢ় নীল', hex: '#1d3557' },
  { name: 'সবুজ', hex: '#2a9d8f' },
  { name: 'হলুদ', hex: '#e9c46a' },
  { name: 'কালো', hex: '#22223b' },
  { name: 'অফ হোয়াইট', hex: '#f3ede3' },
  { name: 'গোলাপি', hex: '#e5989b' },
  { name: 'বেগুনি', hex: '#6a4c93' },
  { name: 'কমলা', hex: '#f4a261' },
  { name: 'ফিরোজা', hex: '#219ebc' },
  { name: 'সোনালি', hex: '#d29820' },
]

export function ProductForm({
  initial,
  categories,
}: {
  initial: ProductFormValues
  categories: { id: string; name: string }[]
}) {
  const router = useRouter()
  const [form, setForm] = useState(initial)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isPending, startTransition] = useTransition()

  const [sizeDraft, setSizeDraft] = useState('')
  const [colorDraft, setColorDraft] = useState({ name: '', hex: '#c1121f' })

  function set<K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) {
    setForm((f) => ({ ...f, [key]: value }))
    setErrors((e) => {
      if (!e[key as string]) return e
      const next = { ...e }
      delete next[key as string]
      return next
    })
  }

  function addSize(value: string) {
    const v = value.trim()
    if (!v || form.sizes.includes(v)) return
    set('sizes', [...form.sizes, v])
    setSizeDraft('')
  }

  function addColor() {
    const name = colorDraft.name.trim()
    if (!name || form.colors.some((c) => c.name === name)) return
    set('colors', [...form.colors, { name, hex: colorDraft.hex }])
    setColorDraft({ name: '', hex: '#c1121f' })
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()

    const payload: ProductInput = {
      id: form.id,
      name: form.name,
      slug: form.slug || makeSlug(form.name),
      categoryId: form.categoryId,
      price: form.price,
      comparePrice: form.comparePrice || 0,
      stock: form.stock,
      sku: form.sku,
      fabric: form.fabric,
      shortDesc: form.shortDesc,
      description: form.description,
      images: form.images,
      sizes: form.sizes,
      colors: form.colors,
      isFeatured: form.isFeatured,
      isActive: form.isActive,
    }

    startTransition(async () => {
      const res = await saveProduct(payload)
      if (res.ok) {
        toast.success(res.message)
        router.push('/admin/products')
        router.refresh()
      } else {
        setErrors(res.fieldErrors ?? {})
        toast.error(res.message)
      }
    })
  }

  const inputClass = (field: string) =>
    cn(
      'w-full rounded-xl border bg-white px-4 py-2.5 text-sm outline-none transition-colors',
      errors[field] ? 'border-rose-400' : 'border-brand-200 focus:border-brand-500'
    )

  return (
    <form onSubmit={submit} className="grid gap-5 lg:grid-cols-[1fr_20rem]">
      {/* বাঁ পাশ */}
      <div className="space-y-5">
        <section className="rounded-2xl border border-brand-100 bg-white p-5">
          <h2 className="mb-4 font-[family-name:var(--font-display)] text-base font-semibold text-brand-900">
            মূল তথ্য
          </h2>

          <div className="space-y-4">
            <div>
              <label htmlFor="pf-name" className="mb-1.5 block text-sm font-medium text-ink">
                পণ্যের নাম <span className="text-rose-600">*</span>
              </label>
              <input
                id="pf-name"
                value={form.name}
                onChange={(e) => {
                  set('name', e.target.value)
                  if (!form.id) set('slug', makeSlug(e.target.value))
                }}
                placeholder="যেমন: ঢাকাই জামদানি — হীরা নকশা"
                className={inputClass('name')}
              />
              {errors.name && <p className="mt-1 text-xs text-rose-600">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="pf-slug" className="mb-1.5 block text-sm font-medium text-ink">
                ঠিকানা (URL)
              </label>
              <input
                id="pf-slug"
                value={form.slug}
                onChange={(e) => set('slug', e.target.value)}
                placeholder="dhakai-jamdani"
                className={inputClass('slug')}
              />
              <p className="mt-1 text-xs text-muted">
                খালি রাখলে নাম থেকে নিজে থেকেই তৈরি হবে।
              </p>
            </div>

            <div>
              <label htmlFor="pf-short" className="mb-1.5 block text-sm font-medium text-ink">
                সংক্ষিপ্ত বর্ণনা
              </label>
              <input
                id="pf-short"
                value={form.shortDesc}
                onChange={(e) => set('shortDesc', e.target.value)}
                placeholder="এক লাইনে পণ্যটির পরিচয়"
                maxLength={300}
                className={inputClass('shortDesc')}
              />
            </div>

            <div>
              <label htmlFor="pf-desc" className="mb-1.5 block text-sm font-medium text-ink">
                বিস্তারিত বর্ণনা
              </label>
              <textarea
                id="pf-desc"
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                rows={8}
                placeholder="কাপড়, বুনন, মাপ, ধোয়ার নিয়ম — যা যা ক্রেতার জানা দরকার।&#10;&#10;নতুন অনুচ্ছেদের জন্য দুইবার এন্টার চাপুন।"
                className={cn(inputClass('description'), 'resize-y leading-relaxed')}
              />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-brand-100 bg-white p-5">
          <h2 className="mb-4 font-[family-name:var(--font-display)] text-base font-semibold text-brand-900">
            ছবি
          </h2>
          <ImageUploader images={form.images} onChange={(v) => set('images', v)} max={6} />
        </section>

        <section className="rounded-2xl border border-brand-100 bg-white p-5">
          <h2 className="mb-4 font-[family-name:var(--font-display)] text-base font-semibold text-brand-900">
            সাইজ ও রঙ
          </h2>

          {/* সাইজ */}
          <div className="mb-6">
            <label className="mb-1.5 block text-sm font-medium text-ink">সাইজ</label>

            {form.sizes.length > 0 && (
              <ul className="mb-2.5 flex flex-wrap gap-2">
                {form.sizes.map((s) => (
                  <li
                    key={s}
                    className="flex items-center gap-1.5 rounded-full bg-cream-100 py-1.5 pr-1.5 pl-3 text-sm text-ink"
                  >
                    {s}
                    <button
                      type="button"
                      onClick={() => set('sizes', form.sizes.filter((x) => x !== s))}
                      aria-label={`${s} সরান`}
                      className="grid h-5 w-5 place-items-center rounded-full text-muted hover:bg-rose-100 hover:text-rose-600"
                    >
                      <X size={12} />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <div className="flex gap-2">
              <input
                value={sizeDraft}
                onChange={(e) => setSizeDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addSize(sizeDraft)
                  }
                }}
                placeholder="সাইজ লিখে এন্টার চাপুন"
                aria-label="নতুন সাইজ"
                className="flex-1 rounded-xl border border-brand-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500"
              />
              <button
                type="button"
                onClick={() => addSize(sizeDraft)}
                className="grid h-11 w-11 place-items-center rounded-xl bg-brand-700 text-white hover:bg-brand-800"
                aria-label="সাইজ যোগ করুন"
              >
                <Plus size={17} />
              </button>
            </div>

            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {SIZE_SUGGESTIONS.filter((s) => !form.sizes.includes(s)).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => addSize(s)}
                  className="rounded-full border border-brand-200 px-2.5 py-1 text-xs text-muted hover:border-brand-400 hover:text-brand-800"
                >
                  + {s}
                </button>
              ))}
            </div>
          </div>

          {/* রঙ */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">রঙ</label>

            {form.colors.length > 0 && (
              <ul className="mb-2.5 flex flex-wrap gap-2">
                {form.colors.map((c) => (
                  <li
                    key={c.name}
                    className="flex items-center gap-2 rounded-full bg-cream-100 py-1.5 pr-1.5 pl-2 text-sm text-ink"
                  >
                    <span
                      className="h-5 w-5 rounded-full ring-1 ring-black/10"
                      style={{ backgroundColor: c.hex }}
                    />
                    {c.name}
                    <button
                      type="button"
                      onClick={() => set('colors', form.colors.filter((x) => x.name !== c.name))}
                      aria-label={`${c.name} সরান`}
                      className="grid h-5 w-5 place-items-center rounded-full text-muted hover:bg-rose-100 hover:text-rose-600"
                    >
                      <X size={12} />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <div className="flex gap-2">
              <input
                type="color"
                value={colorDraft.hex}
                onChange={(e) => setColorDraft((d) => ({ ...d, hex: e.target.value }))}
                aria-label="রঙ বাছুন"
                className="h-11 w-14 shrink-0 cursor-pointer rounded-xl border border-brand-200 bg-white p-1"
              />
              <input
                value={colorDraft.name}
                onChange={(e) => setColorDraft((d) => ({ ...d, name: e.target.value }))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addColor()
                  }
                }}
                placeholder="রঙের নাম, যেমন: টকটকে লাল"
                aria-label="রঙের নাম"
                className="flex-1 rounded-xl border border-brand-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500"
              />
              <button
                type="button"
                onClick={addColor}
                className="grid h-11 w-11 place-items-center rounded-xl bg-brand-700 text-white hover:bg-brand-800"
                aria-label="রঙ যোগ করুন"
              >
                <Plus size={17} />
              </button>
            </div>

            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {COLOR_SUGGESTIONS.filter(
                (c) => !form.colors.some((x) => x.name === c.name)
              ).map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => set('colors', [...form.colors, c])}
                  className="flex items-center gap-1.5 rounded-full border border-brand-200 py-1 pr-2.5 pl-1.5 text-xs text-muted hover:border-brand-400 hover:text-brand-800"
                >
                  <span
                    className="h-3.5 w-3.5 rounded-full ring-1 ring-black/10"
                    style={{ backgroundColor: c.hex }}
                  />
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* ডান পাশ */}
      <aside className="space-y-5">
        <section className="rounded-2xl border border-brand-100 bg-white p-5">
          <h2 className="mb-4 font-[family-name:var(--font-display)] text-base font-semibold text-brand-900">
            দাম ও স্টক
          </h2>

          <div className="space-y-4">
            <div>
              <label htmlFor="pf-price" className="mb-1.5 block text-sm font-medium text-ink">
                বিক্রয়মূল্য (৳) <span className="text-rose-600">*</span>
              </label>
              <input
                id="pf-price"
                type="number"
                min={1}
                value={form.price}
                onChange={(e) => set('price', e.target.value)}
                placeholder="2200"
                className={inputClass('price')}
              />
              {errors.price && <p className="mt-1 text-xs text-rose-600">{errors.price}</p>}
            </div>

            <div>
              <label
                htmlFor="pf-compare"
                className="mb-1.5 block text-sm font-medium text-ink"
              >
                কাটা দাম (৳)
              </label>
              <input
                id="pf-compare"
                type="number"
                min={0}
                value={form.comparePrice}
                onChange={(e) => set('comparePrice', e.target.value)}
                placeholder="2800"
                className={inputClass('comparePrice')}
              />
              {errors.comparePrice ? (
                <p className="mt-1 text-xs text-rose-600">{errors.comparePrice}</p>
              ) : (
                <p className="mt-1 text-xs text-muted">
                  বিক্রয়মূল্যের চেয়ে বেশি দিলে ছাড়ের ব্যাজ দেখাবে।
                </p>
              )}
            </div>

            <div>
              <label htmlFor="pf-stock" className="mb-1.5 block text-sm font-medium text-ink">
                স্টক <span className="text-rose-600">*</span>
              </label>
              <input
                id="pf-stock"
                type="number"
                min={0}
                value={form.stock}
                onChange={(e) => set('stock', e.target.value)}
                className={inputClass('stock')}
              />
              {errors.stock && <p className="mt-1 text-xs text-rose-600">{errors.stock}</p>}
            </div>

            <div>
              <label htmlFor="pf-sku" className="mb-1.5 block text-sm font-medium text-ink">
                পণ্যের কোড (SKU)
              </label>
              <input
                id="pf-sku"
                value={form.sku}
                onChange={(e) => set('sku', e.target.value)}
                placeholder="SG-0001"
                className={inputClass('sku')}
              />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-brand-100 bg-white p-5">
          <h2 className="mb-4 font-[family-name:var(--font-display)] text-base font-semibold text-brand-900">
            শ্রেণি ও অবস্থা
          </h2>

          <div className="space-y-4">
            <div>
              <label htmlFor="pf-cat" className="mb-1.5 block text-sm font-medium text-ink">
                ক্যাটাগরি <span className="text-rose-600">*</span>
              </label>
              <select
                id="pf-cat"
                value={form.categoryId}
                onChange={(e) => set('categoryId', e.target.value)}
                className={inputClass('categoryId')}
              >
                <option value="">বেছে নিন</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <p className="mt-1 text-xs text-rose-600">{errors.categoryId}</p>
              )}
            </div>

            <div>
              <label htmlFor="pf-fabric" className="mb-1.5 block text-sm font-medium text-ink">
                কাপড়
              </label>
              <input
                id="pf-fabric"
                value={form.fabric}
                onChange={(e) => set('fabric', e.target.value)}
                placeholder="যেমন: খাঁটি সুতি"
                className={inputClass('fabric')}
              />
            </div>

            <label className="flex cursor-pointer items-center gap-2.5 text-sm text-ink">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => set('isActive', e.target.checked)}
                className="h-4 w-4 accent-brand-700"
              />
              দোকানে প্রকাশ করুন
            </label>

            <label className="flex cursor-pointer items-center gap-2.5 text-sm text-ink">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(e) => set('isFeatured', e.target.checked)}
                className="h-4 w-4 accent-brand-700"
              />
              হোমপেজে বাছাই করা হিসেবে দেখান
            </label>
          </div>
        </section>

        <div className="sticky bottom-4 space-y-2 rounded-2xl border border-brand-100 bg-white p-4">
          <button
            type="submit"
            disabled={isPending}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-brand-700 py-3 font-semibold text-white transition-colors hover:bg-brand-800 disabled:opacity-60"
          >
            {isPending ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Save size={18} />
            )}
            {form.id ? 'পরিবর্তন সংরক্ষণ করুন' : 'পণ্যটি যোগ করুন'}
          </button>

          <Link
            href="/admin/products"
            className="flex w-full items-center justify-center gap-2 rounded-full border border-brand-200 py-2.5 text-sm font-semibold text-ink hover:bg-cream-50"
          >
            <ArrowLeft size={16} />
            তালিকায় ফিরুন
          </Link>
        </div>
      </aside>
    </form>
  )
}
