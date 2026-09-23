'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { Loader2, Save, Store, Phone, Truck, Wallet, Megaphone } from 'lucide-react'
import { toast } from 'sonner'
import { updateSettings } from '@/actions/admin'
import type { SiteSettings } from '@/lib/settings'

type Field = {
  name: keyof SiteSettings
  label: string
  hint?: string
  type?: 'text' | 'number' | 'url' | 'email' | 'textarea'
  placeholder?: string
}

const GROUPS: { title: string; icon: typeof Store; fields: Field[] }[] = [
  {
    title: 'দোকানের পরিচয়',
    icon: Store,
    fields: [
      { name: 'siteName', label: 'দোকানের নাম', placeholder: 'শাড়িঘর' },
      {
        name: 'tagline',
        label: 'স্লোগান',
        placeholder: 'বাংলার তাঁতের গল্প, আপনার আঁচলে',
      },
      { name: 'address', label: 'দোকানের ঠিকানা', type: 'textarea' },
    ],
  },
  {
    title: 'যোগাযোগ',
    icon: Phone,
    fields: [
      { name: 'phone', label: 'প্রধান মোবাইল নম্বর', placeholder: '01711-000000' },
      { name: 'altPhone', label: 'বিকল্প নম্বর', placeholder: '01811-000000' },
      { name: 'email', label: 'ইমেইল', type: 'email' },
      {
        name: 'whatsapp',
        label: 'হোয়াটসঅ্যাপ নম্বর',
        hint: 'দেশের কোড সহ, যেমন 8801711000000',
      },
      { name: 'facebook', label: 'ফেসবুক পেজের লিংক', type: 'url' },
      { name: 'instagram', label: 'ইনস্টাগ্রামের লিংক', type: 'url' },
    ],
  },
  {
    title: 'ডেলিভারি',
    icon: Truck,
    fields: [
      { name: 'deliveryInsideDhaka', label: 'ঢাকার ভেতরে চার্জ (৳)', type: 'number' },
      { name: 'deliveryOutsideDhaka', label: 'ঢাকার বাইরে চার্জ (৳)', type: 'number' },
      {
        name: 'freeDeliveryAbove',
        label: 'যত টাকার উপরে ডেলিভারি ফ্রি (৳)',
        type: 'number',
        hint: '০ দিলে ফ্রি ডেলিভারি বন্ধ থাকবে।',
      },
    ],
  },
  {
    title: 'পেমেন্ট',
    icon: Wallet,
    fields: [
      {
        name: 'bkashNumber',
        label: 'বিকাশ নম্বর',
        hint: 'চেকআউটে ক্রেতাকে এই নম্বরটি দেখানো হবে।',
      },
      { name: 'nagadNumber', label: 'নগদ নম্বর' },
    ],
  },
  {
    title: 'ঘোষণা',
    icon: Megaphone,
    fields: [
      {
        name: 'announcement',
        label: 'উপরের চলন্ত ঘোষণা',
        type: 'textarea',
        hint: 'খালি রাখলে ঘোষণার বারটি দেখানো হবে না।',
      },
    ],
  },
]

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex items-center justify-center gap-2 rounded-full bg-brand-700 px-7 py-3 font-semibold text-white transition-colors hover:bg-brand-800 disabled:opacity-60"
    >
      {pending ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
      সেটিংস সংরক্ষণ করুন
    </button>
  )
}

export function SettingsForm({ settings }: { settings: SiteSettings }) {
  const [, action] = useActionState(
    async (prev: Awaited<ReturnType<typeof updateSettings>> | null, formData: FormData) => {
      const res = await updateSettings(prev, formData)
      toast[res.ok ? 'success' : 'error'](res.message)
      return res
    },
    null
  )

  const field =
    'w-full rounded-xl border border-brand-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-500'

  return (
    <form action={action} className="space-y-5">
      {GROUPS.map(({ title, icon: Icon, fields }) => (
        <section key={title} className="rounded-2xl border border-brand-100 bg-white p-5">
          <h2 className="mb-5 flex items-center gap-2 font-[family-name:var(--font-display)] text-base font-semibold text-brand-900">
            <Icon size={18} />
            {title}
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            {fields.map((f) => (
              <div
                key={f.name}
                className={f.type === 'textarea' ? 'sm:col-span-2' : undefined}
              >
                <label
                  htmlFor={`st-${f.name}`}
                  className="mb-1.5 block text-sm font-medium text-ink"
                >
                  {f.label}
                </label>

                {f.type === 'textarea' ? (
                  <textarea
                    id={`st-${f.name}`}
                    name={f.name}
                    defaultValue={settings[f.name]}
                    rows={2}
                    placeholder={f.placeholder}
                    className={`${field} resize-y`}
                  />
                ) : (
                  <input
                    id={`st-${f.name}`}
                    name={f.name}
                    type={f.type ?? 'text'}
                    defaultValue={settings[f.name]}
                    placeholder={f.placeholder}
                    className={field}
                  />
                )}

                {f.hint && <p className="mt-1 text-xs text-muted">{f.hint}</p>}
              </div>
            ))}
          </div>
        </section>
      ))}

      <div className="sticky bottom-4 flex justify-end rounded-2xl border border-brand-100 bg-white p-4">
        <SubmitButton />
      </div>
    </form>
  )
}
