'use client'

import { useActionState, useState } from 'react'
import { useFormStatus } from 'react-dom'
import { Loader2, LogIn, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { adminLogin } from '@/actions/admin'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex w-full items-center justify-center gap-2 rounded-full bg-brand-700 py-3 font-semibold text-white transition-colors hover:bg-brand-800 disabled:opacity-60"
    >
      {pending ? <Loader2 size={18} className="animate-spin" /> : <LogIn size={18} />}
      লগইন করুন
    </button>
  )
}

export function LoginForm() {
  const [state, action] = useActionState(adminLogin, null)
  const [showPassword, setShowPassword] = useState(false)
  // ফর্ম জমা দিলে React ঘরগুলো খালি করে দেয় — লগইন ব্যর্থ হলে
  // যেন ইমেইলটা আবার লিখতে না হয়, তাই এটি নিয়ন্ত্রিত রাখা হলো
  const [email, setEmail] = useState('')

  return (
    <form action={action} className="space-y-4">
      {state && !state.ok && (
        <div
          className="flex animate-fade-up items-start gap-2.5 rounded-xl bg-rose-50 p-3 text-sm text-rose-800"
          role="alert"
        >
          <AlertCircle size={17} className="mt-0.5 shrink-0" />
          {state.message}
        </div>
      )}

      <div>
        <label htmlFor="admin-email" className="mb-1.5 block text-sm font-medium text-ink">
          ইমেইল
        </label>
        <input
          id="admin-email"
          name="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="username"
          placeholder="admin@sharighor.com"
          className="w-full rounded-xl border border-brand-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-500"
        />
      </div>

      <div>
        <label htmlFor="admin-password" className="mb-1.5 block text-sm font-medium text-ink">
          পাসওয়ার্ড
        </label>
        <div className="relative">
          <input
            id="admin-password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            required
            autoComplete="current-password"
            placeholder="••••••••"
            className="w-full rounded-xl border border-brand-200 bg-white py-2.5 pr-11 pl-4 text-sm outline-none focus:border-brand-500"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখুন'}
            className="absolute top-1/2 right-2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-muted hover:bg-brand-50"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      <SubmitButton />
    </form>
  )
}
