'use client'

import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react'
import { SmartImage } from '@/components/ui/SmartImage'
import { cn } from '@/lib/utils'

export type Slide = {
  id: string
  title: string
  subtitle: string
  image: string
  link: string
  buttonText: string
}

const INTERVAL = 6000

export function HeroSlider({ slides }: { slides: Slide[] }) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const touchStart = useRef<number | null>(null)

  const count = slides.length

  const go = useCallback(
    (next: number) => setIndex(((next % count) + count) % count),
    [count]
  )

  useEffect(() => {
    if (paused || count <= 1) return
    const t = setInterval(() => setIndex((i) => (i + 1) % count), INTERVAL)
    return () => clearInterval(t)
  }, [paused, count])

  if (count === 0) return null

  return (
    <section
      className="relative overflow-hidden bg-brand-950"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => {
        touchStart.current = e.touches[0].clientX
        setPaused(true)
      }}
      onTouchEnd={(e) => {
        if (touchStart.current == null) return
        const delta = e.changedTouches[0].clientX - touchStart.current
        if (Math.abs(delta) > 50) go(index + (delta < 0 ? 1 : -1))
        touchStart.current = null
        setPaused(false)
      }}
      aria-roledescription="স্লাইডার"
      aria-label="বিশেষ অফার"
    >
      <div className="relative h-[70vh] min-h-[26rem] w-full sm:h-[32rem] lg:h-[36rem]">
        {slides.map((slide, i) => (
          <div
            key={slide.id}
            className={cn(
              'absolute inset-0 transition-opacity duration-700',
              i === index ? 'z-10 opacity-100' : 'z-0 opacity-0'
            )}
            aria-hidden={i !== index}
          >
            <SmartImage
              src={slide.image}
              alt=""
              fill
              priority={i === 0}
              sizes="100vw"
              className={cn(
                'object-cover transition-transform duration-[7000ms] ease-out',
                i === index ? 'scale-105' : 'scale-100'
              )}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-brand-950/85 via-brand-950/55 to-transparent" />

            <div className="relative flex h-full items-center">
              <div className="container-x">
                <div
                  className={cn(
                    'max-w-xl',
                    i === index && 'animate-fade-up'
                  )}
                >
                  <p className="mb-3 inline-block rounded-full bg-gold-500/20 px-3 py-1 text-xs font-semibold tracking-wide text-gold-300">
                    শাড়িঘরে স্বাগতম
                  </p>
                  <h1 className="font-[family-name:var(--font-display)] text-3xl leading-snug font-bold text-white text-balance-bn sm:text-4xl lg:text-5xl">
                    {slide.title}
                  </h1>
                  <p className="mt-4 max-w-md text-sm text-cream-200/90 sm:text-base">
                    {slide.subtitle}
                  </p>
                  <Link
                    href={slide.link}
                    className="mt-7 inline-flex items-center gap-2 rounded-full bg-gold-500 px-6 py-3 font-semibold text-brand-950 transition-transform hover:scale-105 active:scale-95"
                  >
                    {slide.buttonText}
                    <ArrowLeft size={18} className="rotate-180" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {count > 1 && (
        <>
          <button
            type="button"
            onClick={() => go(index - 1)}
            aria-label="আগের স্লাইড"
            className="absolute top-1/2 left-3 z-20 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/15 text-white backdrop-blur transition-colors hover:bg-white/30 sm:grid"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            type="button"
            onClick={() => go(index + 1)}
            aria-label="পরের স্লাইড"
            className="absolute top-1/2 right-3 z-20 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/15 text-white backdrop-blur transition-colors hover:bg-white/30 sm:grid"
          >
            <ChevronRight size={22} />
          </button>

          <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 gap-2">
            {slides.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => go(i)}
                aria-label={`স্লাইড ${i + 1} দেখুন`}
                aria-current={i === index}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-300',
                  i === index ? 'w-8 bg-gold-400' : 'w-3 bg-white/50 hover:bg-white/80'
                )}
              />
            ))}
          </div>
        </>
      )}
    </section>
  )
}
