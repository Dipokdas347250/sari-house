'use client'

import { useActionState, useRef } from 'react'
import { useFormStatus } from 'react-dom'
import { Send, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { subscribeNewsletter } from '@/actions/shop'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      aria-label="সাবস্ক্রাইব করুন"
      className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gold-500 text-brand-950 transition-colors hover:bg-gold-400 disabled:opacity-60"
    >
      {pending ? <Loader2 size={17} className="animate-spin" /> : <Send size={17} />}
    </button>
  )
}

export function NewsletterForm() {
  const formRef = useRef<HTMLFormElement>(null)

  const [, action] = useActionState(
    async (prev: Awaited<ReturnType<typeof subscribeNewsletter>> | null, formData: FormData) => {
      const res = await subscribeNewsletter(prev, formData)
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

  return (
    <form ref={formRef} action={action} className="flex items-center gap-2">
      <input
        type="email"
        name="email"
        required
        placeholder="আপনার ইমেইল"
        aria-label="ইমেইল ঠিকানা"
        className="min-w-0 flex-1 rounded-full border border-white/20 bg-white/10 px-4 py-2.5 text-sm text-white placeholder:text-cream-300/60 outline-none focus:border-gold-400"
      />
      <SubmitButton />
    </form>
  )
}
