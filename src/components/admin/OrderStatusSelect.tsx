'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { updateOrderStatus, updatePaymentStatus } from '@/actions/admin'
import { ORDER_STATUS, ORDER_STATUS_FLOW, type OrderStatus } from '@/lib/constants'
import { cn } from '@/lib/utils'

const ALL: OrderStatus[] = [...ORDER_STATUS_FLOW, 'cancelled']

export function OrderStatusSelect({
  id,
  status,
  size = 'sm',
}: {
  id: string
  status: string
  size?: 'sm' | 'md'
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const info = ORDER_STATUS[status as OrderStatus] ?? ORDER_STATUS.pending

  return (
    <div className="relative inline-flex items-center">
      <select
        value={status}
        disabled={isPending}
        aria-label="অর্ডারের অবস্থা বদলান"
        onChange={(e) => {
          const next = e.target.value
          startTransition(async () => {
            const res = await updateOrderStatus(id, next)
            toast[res.ok ? 'success' : 'error'](res.message)
            if (res.ok) router.refresh()
          })
        }}
        className={cn(
          'cursor-pointer appearance-none rounded-full border pr-7 pl-3 font-semibold outline-none disabled:opacity-60',
          size === 'sm' ? 'py-1 text-xs' : 'py-2 text-sm',
          info.color
        )}
      >
        {ALL.map((s) => (
          <option key={s} value={s}>
            {ORDER_STATUS[s].label}
          </option>
        ))}
      </select>

      <span className="pointer-events-none absolute right-2.5">
        {isPending ? (
          <Loader2 size={12} className="animate-spin" />
        ) : (
          <svg width="9" height="6" viewBox="0 0 9 6" fill="none" aria-hidden>
            <path d="M1 1L4.5 4.5L8 1" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        )}
      </span>
    </div>
  )
}

export function PaymentToggle({
  id,
  paymentStatus,
}: {
  id: string
  paymentStatus: string
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const paid = paymentStatus === 'paid'

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          const res = await updatePaymentStatus(id, paid ? 'unpaid' : 'paid')
          toast[res.ok ? 'success' : 'error'](res.message)
          if (res.ok) router.refresh()
        })
      }
      title="চাপ দিয়ে বদলান"
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-colors disabled:opacity-60',
        paid
          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
          : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
      )}
    >
      {isPending && <Loader2 size={11} className="animate-spin" />}
      {paid ? 'পরিশোধিত' : 'বাকি'}
    </button>
  )
}
