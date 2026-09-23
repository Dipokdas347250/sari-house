'use client'

import { useActionState, useRef } from 'react'
import { useFormStatus } from 'react-dom'
import { Send, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { sendMessage } from '@/actions/shop'
import { cn } from '@/lib/utils'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-700 py-3 font-semibold text-white transition-colors hover:bg-brand-800 disabled:opacity-60 sm:w-auto sm:px-8"
    >
      {pending ? <Loader2 size={17} className="animate-spin" /> : <Send size={17} />}
      বার্তা পাঠান
    </button>
  )
}

export function ContactForm() {
  const formRef = useRef<HTMLFormElement>(null)

  const [state, action] = useActionState(
    async (prev: Awaited<ReturnType<typeof sendMessage>> | null, formData: FormData) => {
      const res = await sendMessage(prev, formData)
      if (res.ok) {
        toast.success(res.message)
        formRef.current?.reset()
      } else {
        toast.error(res.message)
      }
      return res
    },
    null
  )

  const errors = state && !state.ok ? (state.fieldErrors ?? {}) : {}

  const inputClass = (field: string) =>
    cn(
      'w-full rounded-xl border bg-white px-4 py-2.5 text-sm outline-none transition-colors',
      errors[field]
        ? 'border-rose-400 focus:border-rose-500'
        : 'border-brand-200 focus:border-brand-500'
    )

  return (
    <form ref={formRef} action={action} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="ct-name" className="mb-1.5 block text-sm font-medium text-ink">
            আপনার নাম <span className="text-rose-600">*</span>
          </label>
          <input
            id="ct-name"
            name="name"
            required
            placeholder="যেমন: সাবিনা ইয়াসমিন"
            className={inputClass('name')}
          />
          {errors.name && <p className="mt-1 text-xs text-rose-600">{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="ct-phone" className="mb-1.5 block text-sm font-medium text-ink">
            মোবাইল নম্বর <span className="text-rose-600">*</span>
          </label>
          <input
            id="ct-phone"
            name="phone"
            required
            inputMode="tel"
            placeholder="01XXXXXXXXX"
            className={inputClass('phone')}
          />
          {errors.phone && <p className="mt-1 text-xs text-rose-600">{errors.phone}</p>}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="ct-email" className="mb-1.5 block text-sm font-medium text-ink">
            ইমেইল <span className="text-muted">(ঐচ্ছিক)</span>
          </label>
          <input
            id="ct-email"
            name="email"
            type="email"
            placeholder="you@example.com"
            className={inputClass('email')}
          />
          {errors.email && <p className="mt-1 text-xs text-rose-600">{errors.email}</p>}
        </div>

        <div>
          <label htmlFor="ct-subject" className="mb-1.5 block text-sm font-medium text-ink">
            বিষয় <span className="text-muted">(ঐচ্ছিক)</span>
          </label>
          <input
            id="ct-subject"
            name="subject"
            placeholder="যেমন: অর্ডার সম্পর্কে জানতে চাই"
            className={inputClass('subject')}
          />
        </div>
      </div>

      <div>
        <label htmlFor="ct-body" className="mb-1.5 block text-sm font-medium text-ink">
          আপনার বার্তা <span className="text-rose-600">*</span>
        </label>
        <textarea
          id="ct-body"
          name="body"
          required
          rows={5}
          placeholder="বিস্তারিত লিখুন..."
          className={cn(inputClass('body'), 'resize-y')}
        />
        {errors.body && <p className="mt-1 text-xs text-rose-600">{errors.body}</p>}
      </div>

      <SubmitButton />
    </form>
  )
}
