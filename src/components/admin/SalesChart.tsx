'use client'

import { useId, useState } from 'react'
import { Table2 } from 'lucide-react'
import { formatTaka, toBn, cn } from '@/lib/utils'

export type SalesPoint = {
  /** ISO তারিখ */
  date: string
  /** ঐ দিনের বিক্রির মোট টাকা */
  amount: number
  /** ঐ দিনের অর্ডার সংখ্যা */
  orders: number
}

/** অক্ষের জন্য পরিষ্কার সংখ্যা — ০, ৫০০০, ১০০০০ … */
function niceMax(value: number): number {
  if (value <= 0) return 1000
  const magnitude = 10 ** Math.floor(Math.log10(value))
  for (const step of [1, 2, 2.5, 5, 10]) {
    const candidate = step * magnitude
    if (candidate >= value) return candidate
  }
  return 10 * magnitude
}

const BN_MONTHS_SHORT = [
  'জানু', 'ফেব', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলা', 'আগ', 'সেপ্ট', 'অক্টো', 'নভে', 'ডিসে',
]

function shortDate(iso: string) {
  const d = new Date(iso)
  return `${toBn(d.getDate())} ${BN_MONTHS_SHORT[d.getMonth()]}`
}

/**
 * দৈনিক বিক্রির কলাম চার্ট।
 * একটিই সিরিজ, তাই এক রঙ — আলাদা লেজেন্ডের দরকার নেই, শিরোনামই বলে দেয় কী দেখানো হচ্ছে।
 */
export function SalesChart({
  data,
  title = 'গত ১৪ দিনের বিক্রি',
}: {
  data: SalesPoint[]
  title?: string
}) {
  const [hover, setHover] = useState<number | null>(null)
  const [showTable, setShowTable] = useState(false)
  const tableId = useId()

  const max = niceMax(Math.max(...data.map((d) => d.amount), 0))
  const ticks = [0, max / 2, max]
  const total = data.reduce((sum, d) => sum + d.amount, 0)
  const totalOrders = data.reduce((sum, d) => sum + d.orders, 0)

  // সবচেয়ে বেশি বিক্রির দিনটিতে সরাসরি লেবেল বসে
  const peakIndex = data.reduce(
    (best, d, i) => (d.amount > (data[best]?.amount ?? -1) ? i : best),
    0
  )

  return (
    <section className="rounded-2xl border border-brand-100 bg-white p-5">
      <header className="mb-1 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-base font-semibold text-brand-900">
            {title}
          </h2>
          <p className="mt-0.5 text-xs text-muted">
            মোট {formatTaka(total)} · {toBn(totalOrders)} টি অর্ডার
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowTable((v) => !v)}
          aria-expanded={showTable}
          aria-controls={tableId}
          className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 px-3 py-1.5 text-xs font-medium text-brand-800 transition-colors hover:bg-brand-50"
        >
          <Table2 size={14} />
          {showTable ? 'চার্ট দেখুন' : 'সারণি দেখুন'}
        </button>
      </header>

      {showTable ? (
        <div id={tableId} className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <caption className="sr-only">দৈনিক বিক্রির তালিকা</caption>
            <thead>
              <tr className="border-b border-brand-100 text-left text-xs text-muted">
                <th scope="col" className="py-2 font-medium">তারিখ</th>
                <th scope="col" className="py-2 text-right font-medium">অর্ডার</th>
                <th scope="col" className="py-2 text-right font-medium">বিক্রি</th>
              </tr>
            </thead>
            <tbody>
              {data.map((d) => (
                <tr key={d.date} className="border-b border-brand-50 last:border-0">
                  <td className="py-2 text-ink">{shortDate(d.date)}</td>
                  <td className="py-2 text-right text-ink tabular-nums">
                    {toBn(d.orders)}
                  </td>
                  <td className="py-2 text-right font-medium text-ink tabular-nums">
                    {formatTaka(d.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="mt-5">
          <div className="flex gap-3">
            {/* y অক্ষ */}
            <div className="relative h-48 w-14 shrink-0">
              {ticks.map((t) => (
                <span
                  key={t}
                  className="absolute right-0 -translate-y-1/2 text-[0.68rem] text-muted tabular-nums"
                  style={{ bottom: `${(t / max) * 100}%` }}
                >
                  {toBn(Math.round(t).toLocaleString('en-IN'))}
                </span>
              ))}
            </div>

            {/* প্লট */}
            <div className="relative h-48 flex-1">
              {/* গ্রিডলাইন — হালকা, ১px, সলিড */}
              {ticks.map((t) => (
                <span
                  key={t}
                  aria-hidden
                  className="absolute inset-x-0 h-px bg-cream-300"
                  style={{ bottom: `${(t / max) * 100}%` }}
                />
              ))}

              <ul className="absolute inset-0 flex items-end gap-0.5">
                {data.map((d, i) => {
                  const heightPct = max > 0 ? (d.amount / max) * 100 : 0
                  return (
                    <li
                      key={d.date}
                      className="relative flex h-full flex-1 items-end justify-center"
                    >
                      {/* হিট টার্গেট বারের চেয়ে বড় */}
                      <button
                        type="button"
                        onMouseEnter={() => setHover(i)}
                        onMouseLeave={() => setHover(null)}
                        onFocus={() => setHover(i)}
                        onBlur={() => setHover(null)}
                        aria-label={`${shortDate(d.date)} — ${formatTaka(d.amount)}, ${toBn(d.orders)} টি অর্ডার`}
                        className="flex h-full w-full items-end justify-center"
                      >
                        <span
                          className={cn(
                            'w-full max-w-6 rounded-t-[4px] transition-colors',
                            hover === i ? 'bg-brand-500' : 'bg-brand-700',
                            d.amount === 0 && 'bg-cream-300'
                          )}
                          style={{
                            height: `${Math.max(heightPct, d.amount > 0 ? 2 : 1)}%`,
                          }}
                        />
                      </button>

                      {/* সর্বোচ্চ দিনের সরাসরি লেবেল */}
                      {i === peakIndex && d.amount > 0 && hover === null && (
                        <span
                          className="pointer-events-none absolute left-1/2 -translate-x-1/2 rounded-md bg-cream-100 px-1.5 py-0.5 text-[0.65rem] font-semibold whitespace-nowrap text-brand-900"
                          style={{ bottom: `calc(${heightPct}% + 6px)` }}
                        >
                          {formatTaka(d.amount)}
                        </span>
                      )}

                      {/* টুলটিপ */}
                      {hover === i && (
                        <div
                          role="tooltip"
                          className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 rounded-xl bg-brand-950 px-3 py-2 text-center whitespace-nowrap text-white shadow-lg"
                        >
                          <p className="text-sm font-semibold tabular-nums">
                            {formatTaka(d.amount)}
                          </p>
                          <p className="text-[0.68rem] text-cream-300/80">
                            {shortDate(d.date)} · {toBn(d.orders)} টি অর্ডার
                          </p>
                        </div>
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>

          {/* x অক্ষ — শুরু, মাঝ ও শেষ */}
          <div className="mt-2 flex gap-3">
            <span className="w-14 shrink-0" />
            <div className="flex flex-1 justify-between text-[0.68rem] text-muted">
              <span>{data[0] && shortDate(data[0].date)}</span>
              <span className="hidden sm:inline">
                {data[Math.floor(data.length / 2)] &&
                  shortDate(data[Math.floor(data.length / 2)].date)}
              </span>
              <span>{data.at(-1) && shortDate(data.at(-1)!.date)}</span>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
