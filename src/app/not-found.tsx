import Link from 'next/link'
import { Home, Search, PackageSearch } from 'lucide-react'

export const metadata = {
  title: 'পাতাটি পাওয়া যায়নি',
}

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <p className="font-[family-name:var(--font-display)] text-7xl font-bold text-brand-200">
        ৪০৪
      </p>
      <h1 className="mt-4 font-[family-name:var(--font-display)] text-2xl font-bold text-brand-900 sm:text-3xl">
        দুঃখিত, পাতাটি খুঁজে পাওয়া গেল না
      </h1>
      <p className="mt-3 max-w-md text-sm text-muted">
        আপনি যে ঠিকানায় যেতে চাইছেন সেটি হয়তো সরিয়ে ফেলা হয়েছে, নয়তো ঠিকানায় কোথাও ভুল
        আছে।
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full bg-brand-700 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-800"
        >
          <Home size={17} />
          হোমে ফিরুন
        </Link>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 rounded-full border border-brand-200 px-6 py-3 text-sm font-semibold text-brand-800 transition-colors hover:bg-brand-50"
        >
          <Search size={17} />
          পণ্য দেখুন
        </Link>
        <Link
          href="/track"
          className="inline-flex items-center gap-2 rounded-full border border-brand-200 px-6 py-3 text-sm font-semibold text-brand-800 transition-colors hover:bg-brand-50"
        >
          <PackageSearch size={17} />
          অর্ডার ট্র্যাক
        </Link>
      </div>
    </div>
  )
}
