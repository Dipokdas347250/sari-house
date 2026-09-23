'use client'

import { useRef, useState } from 'react'
import { Upload, X, Loader2, ImagePlus, Star } from 'lucide-react'
import { toast } from 'sonner'
import { SmartImage } from '@/components/ui/SmartImage'
import { cn, toBn } from '@/lib/utils'

export function ImageUploader({
  images,
  onChange,
  max = 6,
  label = 'পণ্যের ছবি',
  hint = 'প্রথম ছবিটিই কভার হিসেবে দেখানো হবে। JPG, PNG বা WEBP, সর্বোচ্চ ৫ মেগাবাইট।',
  single = false,
}: {
  images: string[]
  onChange: (images: string[]) => void
  max?: number
  label?: string
  hint?: string
  single?: boolean
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  const limit = single ? 1 : max

  async function upload(files: FileList | File[]) {
    const list = Array.from(files)
    if (list.length === 0) return

    const room = limit - images.length
    if (room <= 0) {
      toast.error(`সর্বোচ্চ ${toBn(limit)} টি ছবি দেওয়া যাবে।`)
      return
    }

    const formData = new FormData()
    for (const file of list.slice(0, room)) formData.append('files', file)

    setBusy(true)
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = (await res.json()) as { ok: boolean; urls?: string[]; message?: string }
      if (!data.ok || !data.urls) {
        toast.error(data.message ?? 'ছবি আপলোড করা যায়নি।')
        return
      }
      onChange(single ? data.urls.slice(0, 1) : [...images, ...data.urls])
      toast.success(`${toBn(data.urls.length)} টি ছবি যোগ হয়েছে`)
    } catch {
      toast.error('ছবি আপলোডে সমস্যা হয়েছে।')
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  function removeAt(index: number) {
    onChange(images.filter((_, i) => i !== index))
  }

  function makeCover(index: number) {
    if (index === 0) return
    const next = [...images]
    const [picked] = next.splice(index, 1)
    onChange([picked, ...next])
    toast.success('কভার ছবি বদলানো হয়েছে')
  }

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-ink">{label}</label>

      {images.length > 0 && (
        <ul
          className={cn(
            'mb-3 grid gap-3',
            single ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-3 sm:grid-cols-4'
          )}
        >
          {images.map((src, i) => (
            <li
              key={src + i}
              className="group relative aspect-3/4 overflow-hidden rounded-xl border border-brand-100 bg-cream-100"
            >
              <SmartImage
                src={src}
                alt=""
                fill
                sizes="160px"
                className="object-cover"
              />

              {!single && i === 0 && (
                <span className="absolute top-1.5 left-1.5 rounded-full bg-brand-700 px-2 py-0.5 text-[0.6rem] font-semibold text-white">
                  কভার
                </span>
              )}

              <div className="absolute inset-x-0 bottom-0 flex justify-center gap-1 bg-gradient-to-t from-brand-950/70 to-transparent p-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                {!single && i !== 0 && (
                  <button
                    type="button"
                    onClick={() => makeCover(i)}
                    aria-label="কভার হিসেবে রাখুন"
                    title="কভার হিসেবে রাখুন"
                    className="grid h-7 w-7 place-items-center rounded-full bg-white/90 text-brand-800 hover:bg-white"
                  >
                    <Star size={13} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeAt(i)}
                  aria-label="ছবিটি সরান"
                  title="সরান"
                  className="grid h-7 w-7 place-items-center rounded-full bg-white/90 text-rose-600 hover:bg-white"
                >
                  <X size={13} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {images.length < limit && (
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragOver(false)
            if (e.dataTransfer.files.length) upload(e.dataTransfer.files)
          }}
          className={cn(
            'rounded-xl border-2 border-dashed p-6 text-center transition-colors',
            dragOver ? 'border-brand-500 bg-brand-50' : 'border-brand-200 bg-white'
          )}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            multiple={!single}
            onChange={(e) => e.target.files && upload(e.target.files)}
            className="hidden"
            id="image-input"
          />

          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-full bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-800 disabled:opacity-60"
          >
            {busy ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                আপলোড হচ্ছে...
              </>
            ) : (
              <>
                <Upload size={16} />
                ছবি বেছে নিন
              </>
            )}
          </button>

          <p className="mt-2.5 flex items-center justify-center gap-1.5 text-xs text-muted">
            <ImagePlus size={13} />
            টেনে এনেও ছাড়তে পারেন
          </p>
        </div>
      )}

      <p className="mt-2 text-xs text-muted">{hint}</p>
    </div>
  )
}
