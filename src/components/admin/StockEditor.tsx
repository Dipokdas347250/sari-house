'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { Check, Loader2, Pencil } from 'lucide-react'
import { toast } from 'sonner'
import { updateStock } from '@/actions/admin'
import { cn, toBn, fromBn } from '@/lib/utils'

/** তালিকা থেকেই স্টক বদলানোর ছোট ইনপুট */
export function StockEditor({ id, stock }: { id: string; stock: number }) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(String(stock))
  const [isPending, startTransition] = useTransition()

  function save() {
    const next = Number(fromBn(value))
    if (!Number.isInteger(next) || next < 0) {
      toast.error('স্টক একটি পূর্ণ সংখ্যা হতে হবে।')
      return
    }
    if (next === stock) {
      setEditing(false)
      return
    }

    startTransition(async () => {
      const res = await updateStock(id, next)
      toast[res.ok ? 'success' : 'error'](res.message)
      if (res.ok) {
        setEditing(false)
        router.refresh()
      }
    })
  }

  if (editing) {
    return (
      <div className="flex items-center justify-center gap-1">
        <input
          type="number"
          min={0}
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') save()
            if (e.key === 'Escape') {
              setValue(String(stock))
              setEditing(false)
            }
          }}
          aria-label="নতুন স্টক"
          className="w-16 rounded-lg border border-brand-300 px-2 py-1 text-center text-sm outline-none focus:border-brand-500"
        />
        <button
          type="button"
          onClick={save}
          disabled={isPending}
          aria-label="সংরক্ষণ করুন"
          className="grid h-7 w-7 place-items-center rounded-full bg-brand-700 text-white hover:bg-brand-800 disabled:opacity-60"
        >
          {isPending ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
        </button>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      title="স্টক বদলান"
      className={cn(
        'mx-auto flex items-center gap-1.5 rounded-full px-2.5 py-1 text-sm font-semibold tabular-nums transition-colors',
        stock === 0
          ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
          : stock <= 5
            ? 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            : 'bg-cream-100 text-ink hover:bg-cream-200'
      )}
    >
      {toBn(stock)}
      <Pencil size={11} className="opacity-50" />
    </button>
  )
}
