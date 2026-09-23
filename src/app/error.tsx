'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, RotateCcw, Home } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('অপ্রত্যাশিত সমস্যা:', error)
  }, [error])

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <span className="mb-5 grid h-16 w-16 place-items-center rounded-full bg-rose-50 text-rose-600">
        <AlertTriangle size={30} />
      </span>

      <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-brand-900">
        কিছু একটা ভুল হয়েছে
      </h1>
      <p className="mt-3 max-w-md text-sm text-muted">
        সমস্যাটি আমাদের দিক থেকে হয়ে থাকতে পারে। একবার আবার চেষ্টা করে দেখুন — না হলে
        আমাদের ফোন করুন।
      </p>

      {error.digest && (
        <p className="mt-2 text-xs text-muted">সমস্যার কোড: {error.digest}</p>
      )}

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-2 rounded-full bg-brand-700 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-800"
        >
          <RotateCcw size={17} />
          আবার চেষ্টা করুন
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-brand-200 px-6 py-3 text-sm font-semibold text-brand-800 transition-colors hover:bg-brand-50"
        >
          <Home size={17} />
          হোমে ফিরুন
        </Link>
      </div>
    </div>
  )
}
