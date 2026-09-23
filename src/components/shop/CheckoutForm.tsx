'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo, useState, useTransition } from 'react'
import {
  Loader2,
  ShoppingBag,
  Ticket,
  Check,
  X,
  Truck,
  BadgeCheck,
  Info,
} from 'lucide-react'
import { toast } from 'sonner'
import { useCart, cartSubtotal } from '@/store/cart'
import { placeOrder, checkCoupon } from '@/actions/shop'
import { SmartImage } from '@/components/ui/SmartImage'
import { EmptyState, LinkButton } from '@/components/ui/kit'
import { DIVISIONS, DIVISION_NAMES, PAYMENT_METHODS } from '@/lib/constants'
import { formatTaka, toBn, cn } from '@/lib/utils'
import { useHydrated } from '@/lib/use-hydrated'

type PaymentKey = keyof typeof PAYMENT_METHODS

export function CheckoutForm({
  deliveryInside,
  deliveryOutside,
  freeDeliveryAbove,
  bkashNumber,
  nagadNumber,
}: {
  deliveryInside: number
  deliveryOutside: number
  freeDeliveryAbove: number
  bkashNumber: string
  nagadNumber: string
}) {
  const router = useRouter()
  const { items, clear } = useCart()
  const hydrated = useHydrated()
  const [isPending, startTransition] = useTransition()

  const [form, setForm] = useState({
    customerName: '',
    phone: '',
    altPhone: '',
    email: '',
    division: '',
    district: '',
    address: '',
    note: '',
    senderNumber: '',
    transactionId: '',
  })
  const [payment, setPayment] = useState<PaymentKey>('cod')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [couponInput, setCouponInput] = useState('')
  const [coupon, setCoupon] = useState<{ code: string; discount: number; label: string } | null>(
    null
  )
  const [couponBusy, setCouponBusy] = useState(false)

  const subtotal = cartSubtotal(items)
  const discount = coupon?.discount ?? 0

  const deliveryCharge = useMemo(() => {
    if (!form.district) return null
    if (freeDeliveryAbove > 0 && subtotal - discount >= freeDeliveryAbove) return 0
    return form.district === 'ঢাকা' ? deliveryInside : deliveryOutside
  }, [form.district, subtotal, discount, freeDeliveryAbove, deliveryInside, deliveryOutside])

  const total = subtotal - discount + (deliveryCharge ?? 0)

  const districts = form.division ? (DIVISIONS[form.division] ?? []) : []

  function set(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
    setErrors((e) => {
      if (!e[field]) return e
      const next = { ...e }
      delete next[field]
      return next
    })
  }

  async function applyCoupon() {
    if (!couponInput.trim()) return
    setCouponBusy(true)
    const res = await checkCoupon(couponInput, subtotal)
    setCouponBusy(false)
    if (res.ok && res.data) {
      setCoupon(res.data)
      toast.success(res.message, { description: res.data.label })
    } else {
      setCoupon(null)
      toast.error(res.message)
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (items.length === 0) return

    startTransition(async () => {
      const res = await placeOrder({
        ...form,
        paymentMethod: payment,
        couponCode: coupon?.code ?? '',
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          size: i.size,
          color: i.color,
        })),
      })

      if (!res.ok) {
        setErrors(res.fieldErrors ?? {})
        toast.error(res.message)
        // প্রথম ভুল ফিল্ডে নিয়ে যাওয়া
        const firstKey = Object.keys(res.fieldErrors ?? {})[0]
        if (firstKey) {
          document.getElementById(`ck-${firstKey}`)?.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          })
        }
        return
      }

      clear()
      toast.success('অর্ডার সফল হয়েছে!')
      router.push(`/order/${res.data?.orderNo ?? ''}?placed=1`)
    })
  }

  if (!hydrated) {
    return <div className="skeleton h-96 rounded-2xl" />
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={<ShoppingBag size={48} />}
        title="কার্টে কিছু নেই"
        description="অর্ডার করার আগে কিছু পণ্য কার্টে যোগ করুন।"
        action={
          <LinkButton href="/products" variant="primary" size="lg">
            পণ্য দেখুন
          </LinkButton>
        }
      />
    )
  }

  const inputClass = (field: string) =>
    cn(
      'w-full rounded-xl border bg-white px-4 py-2.5 text-sm outline-none transition-colors',
      errors[field]
        ? 'border-rose-400 focus:border-rose-500'
        : 'border-brand-200 focus:border-brand-500'
    )

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1fr_23rem]">
      {/* ------------------ বাঁ পাশ: তথ্য ------------------ */}
      <div className="space-y-6">
        {/* ঠিকানা */}
        <section className="rounded-2xl border border-brand-100 bg-white p-5 sm:p-6">
          <h2 className="mb-5 flex items-center gap-2 font-[family-name:var(--font-display)] text-lg font-semibold text-brand-900">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-brand-700 text-sm text-white">
              ১
            </span>
            ডেলিভারির তথ্য
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="ck-customerName" className="mb-1.5 block text-sm font-medium text-ink">
                আপনার পুরো নাম <span className="text-rose-600">*</span>
              </label>
              <input
                id="ck-customerName"
                value={form.customerName}
                onChange={(e) => set('customerName', e.target.value)}
                placeholder="যেমন: রুমানা আক্তার"
                autoComplete="name"
                className={inputClass('customerName')}
              />
              {errors.customerName && (
                <p className="mt-1 text-xs text-rose-600">{errors.customerName}</p>
              )}
            </div>

            <div>
              <label htmlFor="ck-phone" className="mb-1.5 block text-sm font-medium text-ink">
                মোবাইল নম্বর <span className="text-rose-600">*</span>
              </label>
              <input
                id="ck-phone"
                value={form.phone}
                onChange={(e) => set('phone', e.target.value)}
                placeholder="01XXXXXXXXX"
                inputMode="tel"
                autoComplete="tel"
                className={inputClass('phone')}
              />
              {errors.phone && <p className="mt-1 text-xs text-rose-600">{errors.phone}</p>}
            </div>

            <div>
              <label htmlFor="ck-altPhone" className="mb-1.5 block text-sm font-medium text-ink">
                বিকল্প নম্বর <span className="text-muted">(ঐচ্ছিক)</span>
              </label>
              <input
                id="ck-altPhone"
                value={form.altPhone}
                onChange={(e) => set('altPhone', e.target.value)}
                placeholder="01XXXXXXXXX"
                inputMode="tel"
                className={inputClass('altPhone')}
              />
            </div>

            <div>
              <label htmlFor="ck-division" className="mb-1.5 block text-sm font-medium text-ink">
                বিভাগ <span className="text-rose-600">*</span>
              </label>
              <select
                id="ck-division"
                value={form.division}
                onChange={(e) => {
                  set('division', e.target.value)
                  set('district', '')
                }}
                className={inputClass('division')}
              >
                <option value="">বিভাগ নির্বাচন করুন</option>
                {DIVISION_NAMES.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              {errors.division && <p className="mt-1 text-xs text-rose-600">{errors.division}</p>}
            </div>

            <div>
              <label htmlFor="ck-district" className="mb-1.5 block text-sm font-medium text-ink">
                জেলা <span className="text-rose-600">*</span>
              </label>
              <select
                id="ck-district"
                value={form.district}
                onChange={(e) => set('district', e.target.value)}
                disabled={!form.division}
                className={cn(inputClass('district'), !form.division && 'opacity-60')}
              >
                <option value="">
                  {form.division ? 'জেলা নির্বাচন করুন' : 'আগে বিভাগ বাছুন'}
                </option>
                {districts.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              {errors.district && <p className="mt-1 text-xs text-rose-600">{errors.district}</p>}
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="ck-address" className="mb-1.5 block text-sm font-medium text-ink">
                বিস্তারিত ঠিকানা <span className="text-rose-600">*</span>
              </label>
              <textarea
                id="ck-address"
                value={form.address}
                onChange={(e) => set('address', e.target.value)}
                rows={3}
                placeholder="বাড়ি/ফ্ল্যাট নম্বর, রোড, এলাকা, থানা"
                className={cn(inputClass('address'), 'resize-y')}
              />
              {errors.address && <p className="mt-1 text-xs text-rose-600">{errors.address}</p>}
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="ck-email" className="mb-1.5 block text-sm font-medium text-ink">
                ইমেইল <span className="text-muted">(ঐচ্ছিক)</span>
              </label>
              <input
                id="ck-email"
                type="email"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                className={inputClass('email')}
              />
              {errors.email && <p className="mt-1 text-xs text-rose-600">{errors.email}</p>}
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="ck-note" className="mb-1.5 block text-sm font-medium text-ink">
                বিশেষ নির্দেশনা <span className="text-muted">(ঐচ্ছিক)</span>
              </label>
              <textarea
                id="ck-note"
                value={form.note}
                onChange={(e) => set('note', e.target.value)}
                rows={2}
                placeholder="যেমন: বিকেলের পর ফোন দেবেন"
                className={cn(inputClass('note'), 'resize-y')}
              />
            </div>
          </div>
        </section>

        {/* পেমেন্ট */}
        <section className="rounded-2xl border border-brand-100 bg-white p-5 sm:p-6">
          <h2 className="mb-5 flex items-center gap-2 font-[family-name:var(--font-display)] text-lg font-semibold text-brand-900">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-brand-700 text-sm text-white">
              ২
            </span>
            পেমেন্টের ধরন
          </h2>

          <div className="space-y-3">
            {(Object.keys(PAYMENT_METHODS) as PaymentKey[]).map((key) => (
              <label
                key={key}
                className={cn(
                  'flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-colors',
                  payment === key
                    ? 'border-brand-600 bg-brand-50'
                    : 'border-brand-200 hover:border-brand-300'
                )}
              >
                <input
                  type="radio"
                  name="payment"
                  value={key}
                  checked={payment === key}
                  onChange={() => setPayment(key)}
                  className="h-4 w-4 accent-brand-700"
                />
                <span className="flex-1">
                  <span className="block text-sm font-semibold text-ink">
                    {PAYMENT_METHODS[key].label}
                  </span>
                  <span className="block text-xs text-muted">
                    {key === 'cod'
                      ? 'পণ্য হাতে পেয়ে টাকা পরিশোধ করুন'
                      : `${PAYMENT_METHODS[key].short} এ সেন্ড মানি করে নিচে তথ্য দিন`}
                  </span>
                </span>
                {payment === key && <Check size={18} className="text-brand-700" />}
              </label>
            ))}
          </div>

          {payment !== 'cod' && (
            <div className="mt-5 animate-fade-up rounded-xl bg-cream-100 p-4">
              <p className="flex items-start gap-2 text-sm text-ink">
                <Info size={16} className="mt-0.5 shrink-0 text-brand-600" />
                <span>
                  নিচের নম্বরে <strong>{formatTaka(total)}</strong> সেন্ড মানি করুন —{' '}
                  <strong className="text-brand-800">
                    {payment === 'bkash' ? bkashNumber : nagadNumber}
                  </strong>{' '}
                  ({PAYMENT_METHODS[payment].short} পার্সোনাল)। তারপর নিচের ঘরদুটি পূরণ করুন।
                </span>
              </p>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="ck-senderNumber"
                    className="mb-1.5 block text-sm font-medium text-ink"
                  >
                    যে নম্বর থেকে পাঠিয়েছেন <span className="text-rose-600">*</span>
                  </label>
                  <input
                    id="ck-senderNumber"
                    value={form.senderNumber}
                    onChange={(e) => set('senderNumber', e.target.value)}
                    placeholder="01XXXXXXXXX"
                    inputMode="tel"
                    className={inputClass('senderNumber')}
                  />
                  {errors.senderNumber && (
                    <p className="mt-1 text-xs text-rose-600">{errors.senderNumber}</p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="ck-transactionId"
                    className="mb-1.5 block text-sm font-medium text-ink"
                  >
                    ট্রানজেকশন আইডি <span className="text-rose-600">*</span>
                  </label>
                  <input
                    id="ck-transactionId"
                    value={form.transactionId}
                    onChange={(e) => set('transactionId', e.target.value)}
                    placeholder="যেমন: 9F3K2LM7Q"
                    className={inputClass('transactionId')}
                  />
                  {errors.transactionId && (
                    <p className="mt-1 text-xs text-rose-600">{errors.transactionId}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* ------------------ ডান পাশ: সারাংশ ------------------ */}
      <aside>
        <div className="sticky top-28 space-y-4">
          <div className="rounded-2xl border border-brand-100 bg-white p-5">
            <h2 className="mb-4 font-[family-name:var(--font-display)] text-lg font-semibold text-brand-900">
              আপনার অর্ডার
            </h2>

            <ul className="mb-4 max-h-64 space-y-3 overflow-y-auto">
              {items.map((item) => (
                <li key={item.key} className="flex gap-3">
                  <div className="relative h-16 w-13 shrink-0 overflow-hidden rounded-lg bg-cream-100">
                    <SmartImage
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                    <span className="absolute -top-1 -right-1 grid h-5 min-w-5 place-items-center rounded-full bg-brand-700 px-1 text-[0.62rem] font-bold text-white">
                      {toBn(item.quantity)}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-xs font-medium text-ink">{item.name}</p>
                    {(item.size || item.color) && (
                      <p className="text-[0.68rem] text-muted">
                        {[item.size, item.color].filter(Boolean).join(' • ')}
                      </p>
                    )}
                  </div>
                  <p className="shrink-0 text-xs font-semibold text-brand-800">
                    {formatTaka(item.price * item.quantity)}
                  </p>
                </li>
              ))}
            </ul>

            {/* কুপন */}
            <div className="border-t border-brand-100 pt-4">
              {coupon ? (
                <div className="flex items-center justify-between rounded-xl bg-emerald-50 px-3 py-2.5">
                  <span className="flex items-center gap-2 text-sm font-medium text-emerald-800">
                    <BadgeCheck size={16} />
                    {coupon.code} — {coupon.label}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setCoupon(null)
                      setCouponInput('')
                    }}
                    aria-label="কুপন সরান"
                    className="grid h-7 w-7 place-items-center rounded-full text-emerald-800 hover:bg-emerald-100"
                  >
                    <X size={15} />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Ticket
                      size={15}
                      className="absolute top-1/2 left-3 -translate-y-1/2 text-muted"
                    />
                    <input
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      placeholder="কুপন কোড"
                      aria-label="কুপন কোড"
                      className="w-full rounded-xl border border-brand-200 py-2.5 pr-3 pl-9 text-sm uppercase outline-none focus:border-brand-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={applyCoupon}
                    disabled={couponBusy || !couponInput.trim()}
                    className="rounded-xl bg-brand-700 px-4 text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-50"
                  >
                    {couponBusy ? <Loader2 size={15} className="animate-spin" /> : 'প্রয়োগ'}
                  </button>
                </div>
              )}
            </div>

            {/* হিসাব */}
            <dl className="mt-4 space-y-2.5 border-t border-brand-100 pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">পণ্যের দাম</dt>
                <dd className="font-medium text-ink">{formatTaka(subtotal)}</dd>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <dt>কুপন ছাড়</dt>
                  <dd className="font-medium">− {formatTaka(discount)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-muted">ডেলিভারি চার্জ</dt>
                <dd className="font-medium text-ink">
                  {deliveryCharge === null ? (
                    <span className="text-xs text-muted">জেলা বাছলে দেখা যাবে</span>
                  ) : deliveryCharge === 0 ? (
                    <span className="text-emerald-700">ফ্রি</span>
                  ) : (
                    formatTaka(deliveryCharge)
                  )}
                </dd>
              </div>
            </dl>

            <div className="mt-4 flex items-baseline justify-between border-t border-brand-100 pt-4">
              <span className="font-semibold text-ink">সর্বমোট</span>
              <span className="text-2xl font-bold text-brand-800">{formatTaka(total)}</span>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-brand-700 py-3.5 font-semibold text-white transition-colors hover:bg-brand-800 disabled:opacity-60"
            >
              {isPending ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  অপেক্ষা করুন...
                </>
              ) : (
                <>
                  <Check size={18} />
                  অর্ডার নিশ্চিত করুন
                </>
              )}
            </button>

            <p className="mt-3 text-center text-xs text-muted">
              অর্ডার করলে আমাদের{' '}
              <Link href="/policy/terms" className="underline hover:text-brand-700">
                শর্তাবলি
              </Link>{' '}
              মেনে নিচ্ছেন বলে ধরা হবে।
            </p>
          </div>

          <div className="flex items-start gap-2.5 rounded-2xl bg-cream-100 p-4 text-xs text-ink">
            <Truck size={16} className="mt-0.5 shrink-0 text-brand-600" />
            <span>
              অর্ডার করার পর আমরা ফোনে নিশ্চিত করব। ঢাকায় ১-২ দিন, ঢাকার বাইরে ২-৪ দিনে
              পৌঁছে যাবে।
            </span>
          </div>
        </div>
      </aside>
    </form>
  )
}
