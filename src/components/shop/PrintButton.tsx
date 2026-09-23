'use client'

import { Printer } from 'lucide-react'

export function PrintButton({ label = 'প্রিন্ট' }: { label?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="no-print inline-flex items-center gap-1.5 rounded-full border border-brand-200 px-3.5 py-1.5 text-sm font-medium text-brand-800 transition-colors hover:bg-brand-50"
    >
      <Printer size={15} />
      {label}
    </button>
  )
}
