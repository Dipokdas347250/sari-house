'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Expand, X } from 'lucide-react'
import { SmartImage, NO_IMAGE } from '@/components/ui/SmartImage'
import { cn, toBn } from '@/lib/utils'

export function ProductGallery({
  images,
  alt,
  badge,
}: {
  images: string[]
  alt: string
  badge?: string
}) {
  const list = images.length > 0 ? images : [NO_IMAGE]
  const [index, setIndex] = useState(0)
  const [zoom, setZoom] = useState(false)

  const go = (next: number) => setIndex(((next % list.length) + list.length) % list.length)

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row-reverse sm:gap-4">
        {/* বড় ছবি */}
        <div className="relative flex-1">
          <div className="relative aspect-3/4 overflow-hidden rounded-2xl bg-cream-100">
            <SmartImage
              key={list[index]}
              src={list[index]}
              alt={`${alt} — ছবি ${toBn(index + 1)}`}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="animate-fade-up object-cover"
            />

            {badge && (
              <span className="absolute top-4 left-4 rounded-full bg-brand-700 px-3 py-1 text-xs font-semibold text-white">
                {badge}
              </span>
            )}

            <button
              type="button"
              onClick={() => setZoom(true)}
              aria-label="ছবি বড় করে দেখুন"
              className="absolute right-4 bottom-4 grid h-10 w-10 place-items-center rounded-full bg-white/90 text-brand-800 shadow-sm backdrop-blur transition-colors hover:bg-white"
            >
              <Expand size={17} />
            </button>

            {list.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => go(index - 1)}
                  aria-label="আগের ছবি"
                  className="absolute top-1/2 left-3 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-white/85 text-brand-800 backdrop-blur transition-colors hover:bg-white"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => go(index + 1)}
                  aria-label="পরের ছবি"
                  className="absolute top-1/2 right-3 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-white/85 text-brand-800 backdrop-blur transition-colors hover:bg-white"
                >
                  <ChevronRight size={18} />
                </button>
              </>
            )}
          </div>
        </div>

        {/* থাম্বনেইল */}
        {list.length > 1 && (
          <div className="no-scrollbar flex gap-3 overflow-x-auto sm:w-20 sm:flex-col sm:overflow-y-auto">
            {list.map((src, i) => (
              <button
                key={src + i}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`ছবি ${toBn(i + 1)} দেখুন`}
                aria-current={i === index}
                className={cn(
                  'relative aspect-3/4 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition-colors sm:w-full',
                  i === index ? 'border-brand-700' : 'border-transparent hover:border-brand-300'
                )}
              >
                <SmartImage
                  src={src}
                  alt=""
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* পূর্ণ পর্দায় ছবি */}
      {zoom && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-brand-950/90 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="ছবি বড় করে দেখা"
          onClick={() => setZoom(false)}
        >
          <button
            type="button"
            onClick={() => setZoom(false)}
            aria-label="বন্ধ করুন"
            className="absolute top-5 right-5 grid h-11 w-11 place-items-center rounded-full bg-white/15 text-white hover:bg-white/25"
          >
            <X size={22} />
          </button>

          <div
            className="relative h-full max-h-[85vh] w-full max-w-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <SmartImage
              src={list[index]}
              alt={alt}
              fill
              sizes="100vw"
              className="object-contain"
            />
          </div>

          {list.length > 1 && (
            <div className="absolute bottom-6 flex gap-2" onClick={(e) => e.stopPropagation()}>
              {list.map((s, i) => (
                <button
                  key={s + i}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`ছবি ${toBn(i + 1)}`}
                  className={cn(
                    'h-2 rounded-full transition-all',
                    i === index ? 'w-7 bg-gold-400' : 'w-2 bg-white/50'
                  )}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  )
}
