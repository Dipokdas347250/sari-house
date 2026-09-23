import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { LoginForm } from '@/components/admin/LoginForm'

export const metadata: Metadata = {
  title: 'অ্যাডমিন লগইন',
  robots: { index: false, follow: false },
}

export default function AdminLoginPage() {
  return (
    <div className="weave-bg flex min-h-screen items-center justify-center bg-brand-950 px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-7 text-center">
          <span className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-gold-500 font-[family-name:var(--font-display)] text-2xl font-bold text-brand-950">
            শা
          </span>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-white">
            শাড়িঘর অ্যাডমিন
          </h1>
          <p className="mt-1.5 text-sm text-cream-300/75">
            দোকান পরিচালনা করতে লগইন করুন
          </p>
        </div>

        <div className="rounded-2xl bg-cream-50 p-6 shadow-2xl">
          <LoginForm />
        </div>

        <Link
          href="/"
          className="mt-6 flex items-center justify-center gap-1.5 text-sm text-cream-300/75 transition-colors hover:text-gold-300"
        >
          <ArrowLeft size={15} />
          দোকানের সাইটে ফিরে যান
        </Link>
      </div>
    </div>
  )
}
