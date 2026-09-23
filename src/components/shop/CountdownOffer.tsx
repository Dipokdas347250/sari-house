'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Timer } from 'lucide-react'
import { toBn } from '@/lib/utils'
import { useHydrated } from '@/lib/use-hydrated'

/** প্রতি সপ্তাহের শুক্রবার রাত ১২টা পর্যন্ত অফারের ঘড়ি */
function nextDeadline(): number {
  const now = new Date()
  const d = new Date(now)
  const daysUntilFriday = (5 - now.getDay() + 7) % 7 || 7
  d.setDate(now.getDate() + daysUntilFriday)
  d.setHours(23, 59, 59, 999)
  return d.getTime()
}

function split(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000))
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  }
}

export function CountdownOffer({ couponCode }: { couponCode: string }) {
  const [target] = useState(nextDeadline)
  const [left, setLeft] = useState(() => split(target - Date.now()))
  const hydrated = useHydrated()

  useEffect(() => {
    const t = setInterval(() => setLeft(split(target - Date.now())), 1000)
    return () => clearInterval(t)
  }, [target])

  const boxes = [
    { value: left.days, label: 'দিন' },
    { value: left.hours, label: 'ঘণ্টা' },
    { value: left.minutes, label: 'মিনিট' },
    { value: left.seconds, label: 'সেকেন্ড' },
  ]

  return (
    <section className="container-x">
      <div className="weave-bg relative overflow-hidden rounded-3xl bg-brand-900 px-6 py-10 text-center sm:px-10 sm:py-12">
        <div className="relative">
          <p className="inline-flex items-center gap-2 rounded-full bg-gold-500/20 px-4 py-1.5 text-xs font-semibold text-gold-300">
            <Timer size={15} />
            সপ্তাহের বিশেষ অফার
          </p>

          <h2 className="mt-4 font-[family-name:var(--font-display)] text-2xl font-bold text-white text-balance-bn sm:text-3xl">
            কুপন কোড <span className="text-gold-400">{couponCode}</span> ব্যবহার করে ছাড় নিন
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm text-cream-200/85">
            চেকআউটের সময় কুপন কোডটি লিখলেই ছাড় যোগ হয়ে যাবে। অফার শেষ হতে বাকি —
          </p>

          <div className="mt-7 flex justify-center gap-2.5 sm:gap-4">
            {boxes.map((b) => (
              <div
                key={b.label}
                className="min-w-[4.2rem] rounded-2xl bg-white/10 px-3 py-3 backdrop-blur sm:min-w-[5rem]"
              >
                <div className="font-[family-name:var(--font-display)] text-2xl font-bold text-white tabular-nums sm:text-3xl">
                  {hydrated ? toBn(String(b.value).padStart(2, '0')) : '০০'}
                </div>
                <div className="mt-0.5 text-[0.68rem] text-cream-300/80">{b.label}</div>
              </div>
            ))}
          </div>

          <Link
            href="/products"
            className="mt-8 inline-flex items-center rounded-full bg-gold-500 px-7 py-3 font-semibold text-brand-950 transition-transform hover:scale-105 active:scale-95"
          >
            অফার লুফে নিন
          </Link>
        </div>
      </div>
    </section>
  )
}
