'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { Loader2, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import type { AdminResult } from '@/actions/admin'
import { cn } from '@/lib/utils'

/** সার্ভার অ্যাকশন চালানোর সাধারণ বোতাম — লোডিং ও টোস্ট নিজেই সামলায় */
export function ActionButton({
  action,
  children,
  className,
  title,
  ariaLabel,
  refresh = true,
}: {
  action: () => Promise<AdminResult>
  children: React.ReactNode
  className?: string
  title?: string
  ariaLabel?: string
  refresh?: boolean
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  return (
    <button
      type="button"
      title={title}
      aria-label={ariaLabel}
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          const res = await action()
          toast[res.ok ? 'success' : 'error'](res.message)
          if (res.ok && refresh) router.refresh()
        })
      }
      className={cn('disabled:opacity-50', className)}
    >
      {isPending ? <Loader2 size={15} className="animate-spin" /> : children}
    </button>
  )
}

/** মুছে ফেলার আগে নিশ্চিত হওয়ার জন্য */
export function ConfirmAction({
  action,
  children,
  className,
  title,
  ariaLabel,
  confirmTitle = 'নিশ্চিত?',
  confirmText = 'এটি মুছে ফেললে আর ফিরে পাওয়া যাবে না।',
  confirmLabel = 'হ্যাঁ, মুছে ফেলুন',
  onDone,
}: {
  action: () => Promise<AdminResult>
  children: React.ReactNode
  className?: string
  title?: string
  ariaLabel?: string
  confirmTitle?: string
  confirmText?: string
  confirmLabel?: string
  onDone?: () => void
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  return (
    <>
      <button
        type="button"
        title={title}
        aria-label={ariaLabel}
        onClick={() => setOpen(true)}
        className={className}
      >
        {children}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[70] grid place-items-center bg-brand-950/50 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => !isPending && setOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="mb-4 grid h-12 w-12 place-items-center rounded-full bg-rose-50 text-rose-600">
              <AlertTriangle size={22} />
            </span>

            <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-brand-900">
              {confirmTitle}
            </h2>
            <p className="mt-2 text-sm text-muted">{confirmText}</p>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={isPending}
                className="flex-1 rounded-full border border-brand-200 py-2.5 text-sm font-semibold text-ink hover:bg-cream-50 disabled:opacity-50"
              >
                থাক
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={() =>
                  startTransition(async () => {
                    const res = await action()
                    toast[res.ok ? 'success' : 'error'](res.message)
                    if (res.ok) {
                      setOpen(false)
                      router.refresh()
                      onDone?.()
                    }
                  })
                }
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-rose-600 py-2.5 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
              >
                {isPending && <Loader2 size={15} className="animate-spin" />}
                {confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
