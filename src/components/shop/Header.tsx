'use client'

import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  ShoppingBag,
  Heart,
  Search,
  Menu,
  X,
  Phone,
  ChevronDown,
  PackageSearch,
} from 'lucide-react'
import { useCart, cartCount } from '@/store/cart'
import { useHydrated } from '@/lib/use-hydrated'
import { useWishlist } from '@/store/wishlist'
import { cn, toBn } from '@/lib/utils'

export type NavCategory = { name: string; slug: string; count: number }

export function Header({
  categories,
  phone,
  announcement,
  siteName,
}: {
  categories: NavCategory[]
  phone: string
  announcement: string
  siteName: string
}) {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()

  const items = useCart((s) => s.items)
  const openCart = useCart((s) => s.openCart)
  const wishlist = useWishlist((s) => s.items)

  const hydrated = useHydrated()
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // ঠিকানার search প্যারামিটারই সার্চ বাক্সের মান — আলাদা state লাগে না
  const searchValue = searchParams.get('search') ?? ''
  const [query, setQuery] = useState(searchValue)
  const [lastSearch, setLastSearch] = useState(searchValue)
  if (lastSearch !== searchValue) {
    setLastSearch(searchValue)
    setQuery(searchValue)
  }

  // রুট বদলালে খোলা মেনু বন্ধ
  const [lastPath, setLastPath] = useState(pathname)
  if (lastPath !== pathname) {
    setLastPath(pathname)
    setMenuOpen(false)
    setSearchOpen(false)
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // মেনু খোলা থাকলে পেছনের স্ক্রল বন্ধ
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  const count = hydrated ? cartCount(items) : 0
  const wishCount = hydrated ? wishlist.length : 0

  function submitSearch(e: React.FormEvent) {
    e.preventDefault()
    const q = query.trim()
    router.push(q ? `/products?search=${encodeURIComponent(q)}` : '/products')
    setSearchOpen(false)
  }

  const navLinks = [
    { href: '/', label: 'হোম' },
    { href: '/products', label: 'সব পণ্য' },
    { href: '/about', label: 'আমাদের কথা' },
    { href: '/contact', label: 'যোগাযোগ' },
  ]

  return (
    <>
      {/* ঘোষণা বার */}
      {announcement && (
        <div className="overflow-hidden bg-brand-900 py-2 text-white">
          <div className="flex w-max animate-marquee whitespace-nowrap">
            {[0, 1].map((k) => (
              <span key={k} className="px-8 text-xs font-medium sm:text-sm">
                {announcement} • {announcement}
              </span>
            ))}
          </div>
        </div>
      )}

      <header
        className={cn(
          'sticky top-0 z-40 border-b border-brand-100 bg-cream-50/95 backdrop-blur transition-shadow',
          scrolled && 'shadow-[0_4px_20px_-12px_rgba(64,10,23,0.35)]'
        )}
      >
        <div className="container-x">
          <div className="flex h-16 items-center justify-between gap-3 sm:h-[4.5rem]">
            {/* মোবাইল মেনু বোতাম */}
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="-ml-1 grid h-10 w-10 place-items-center rounded-full text-brand-800 hover:bg-brand-50 lg:hidden"
              aria-label="মেনু খুলুন"
            >
              <Menu size={22} />
            </button>

            {/* লোগো */}
            <Link href="/" className="flex shrink-0 items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-700 font-[family-name:var(--font-display)] text-lg font-bold text-gold-200">
                শা
              </span>
              <span className="font-[family-name:var(--font-display)] text-xl font-bold text-brand-900 sm:text-2xl">
                {siteName}
              </span>
            </Link>

            {/* ডেস্কটপ নেভিগেশন */}
            <nav className="hidden items-center gap-1 lg:flex">
              {navLinks.slice(0, 2).map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={cn(
                    'rounded-full px-3 py-2 text-sm font-medium transition-colors',
                    pathname === l.href
                      ? 'bg-brand-50 text-brand-800'
                      : 'text-ink hover:bg-brand-50 hover:text-brand-800'
                  )}
                >
                  {l.label}
                </Link>
              ))}

              {/* ক্যাটাগরি ড্রপডাউন */}
              <div className="group relative">
                <button
                  type="button"
                  className="flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium text-ink transition-colors hover:bg-brand-50 hover:text-brand-800"
                  aria-haspopup="true"
                >
                  ক্যাটাগরি
                  <ChevronDown size={15} className="transition-transform group-hover:rotate-180" />
                </button>
                <div className="invisible absolute top-full left-0 z-50 w-64 translate-y-1 rounded-2xl border border-brand-100 bg-white p-2 opacity-0 shadow-(--shadow-soft) transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                  {categories.map((c) => (
                    <Link
                      key={c.slug}
                      href={`/category/${c.slug}`}
                      className="flex items-center justify-between rounded-xl px-3 py-2 text-sm text-ink hover:bg-cream-100 hover:text-brand-800"
                    >
                      {c.name}
                      <span className="text-xs text-muted">{toBn(c.count)}</span>
                    </Link>
                  ))}
                </div>
              </div>

              {navLinks.slice(2).map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={cn(
                    'rounded-full px-3 py-2 text-sm font-medium transition-colors',
                    pathname === l.href
                      ? 'bg-brand-50 text-brand-800'
                      : 'text-ink hover:bg-brand-50 hover:text-brand-800'
                  )}
                >
                  {l.label}
                </Link>
              ))}
              <Link
                href="/track"
                className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-ink transition-colors hover:bg-brand-50 hover:text-brand-800"
              >
                <PackageSearch size={15} />
                অর্ডার ট্র্যাক
              </Link>
            </nav>

            {/* ডানপাশের আইকন */}
            <div className="flex items-center gap-1">
              {/* ডেস্কটপ সার্চ */}
              <form onSubmit={submitSearch} className="relative hidden xl:block">
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="শাড়ি, থ্রি-পিস খুঁজুন..."
                  aria-label="পণ্য খুঁজুন"
                  className="w-56 rounded-full border border-brand-200 bg-white py-2 pr-9 pl-4 text-sm outline-none transition-[width] focus:w-72"
                />
                <button
                  type="submit"
                  aria-label="খুঁজুন"
                  className="absolute top-1/2 right-1 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full text-brand-700 hover:bg-brand-50"
                >
                  <Search size={16} />
                </button>
              </form>

              <button
                type="button"
                onClick={() => setSearchOpen((v) => !v)}
                className="grid h-10 w-10 place-items-center rounded-full text-brand-800 hover:bg-brand-50 xl:hidden"
                aria-label="খুঁজুন"
                aria-expanded={searchOpen}
              >
                <Search size={20} />
              </button>

              <a
                href={`tel:${phone.replace(/[^\d+]/g, '')}`}
                className="hidden h-10 w-10 place-items-center rounded-full text-brand-800 hover:bg-brand-50 md:grid"
                aria-label={`ফোন করুন ${phone}`}
                title={phone}
              >
                <Phone size={19} />
              </a>

              <Link
                href="/wishlist"
                className="relative grid h-10 w-10 place-items-center rounded-full text-brand-800 hover:bg-brand-50"
                aria-label="পছন্দের তালিকা"
              >
                <Heart size={20} />
                {wishCount > 0 && (
                  <span className="absolute top-1 right-0.5 grid h-4.5 min-w-4.5 place-items-center rounded-full bg-gold-500 px-1 text-[0.65rem] font-bold text-brand-950">
                    {toBn(wishCount)}
                  </span>
                )}
              </Link>

              <button
                type="button"
                onClick={openCart}
                className="relative grid h-10 w-10 place-items-center rounded-full text-brand-800 hover:bg-brand-50"
                aria-label={`কার্ট — ${toBn(count)} টি পণ্য`}
              >
                <ShoppingBag size={20} />
                {count > 0 && (
                  <span className="absolute top-1 right-0.5 grid h-4.5 min-w-4.5 place-items-center rounded-full bg-brand-700 px-1 text-[0.65rem] font-bold text-white">
                    {toBn(count)}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* মোবাইল সার্চ বার */}
          {searchOpen && (
            <form onSubmit={submitSearch} className="animate-fade-up pb-3 xl:hidden">
              <div className="relative">
                <input
                  type="search"
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="কী খুঁজছেন?"
                  aria-label="পণ্য খুঁজুন"
                  className="w-full rounded-full border border-brand-200 bg-white py-2.5 pr-11 pl-4 text-sm outline-none"
                />
                <button
                  type="submit"
                  aria-label="খুঁজুন"
                  className="absolute top-1/2 right-1.5 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-brand-700 text-white"
                >
                  <Search size={16} />
                </button>
              </div>
            </form>
          )}
        </div>

        {/* ক্যাটাগরি স্ট্রিপ — শুধু ট্যাবলেট ও মোবাইলে */}
        <div className="no-scrollbar overflow-x-auto border-t border-brand-100 bg-white lg:hidden">
          <div className="flex w-max gap-1 px-4 py-2">
            {categories.map((c) => (
              <Link
                key={c.slug}
                href={`/category/${c.slug}`}
                className={cn(
                  'rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors',
                  pathname === `/category/${c.slug}`
                    ? 'bg-brand-700 text-white'
                    : 'bg-cream-100 text-ink hover:bg-cream-200'
                )}
              >
                {c.name}
              </Link>
            ))}
          </div>
        </div>
      </header>

      {/* মোবাইল ড্রয়ার মেনু */}
      <div
        className={cn(
          'fixed inset-0 z-50 lg:hidden',
          menuOpen ? 'pointer-events-auto' : 'pointer-events-none'
        )}
        aria-hidden={!menuOpen}
      >
        <div
          onClick={() => setMenuOpen(false)}
          className={cn(
            'absolute inset-0 bg-brand-950/40 transition-opacity duration-300',
            menuOpen ? 'opacity-100' : 'opacity-0'
          )}
        />
        <nav
          className={cn(
            'absolute inset-y-0 left-0 flex w-[85%] max-w-sm flex-col bg-cream-50 shadow-2xl transition-transform duration-300',
            menuOpen ? 'translate-x-0' : '-translate-x-full'
          )}
          aria-label="মূল মেনু"
        >
          <div className="flex items-center justify-between border-b border-brand-100 px-5 py-4">
            <span className="font-[family-name:var(--font-display)] text-xl font-bold text-brand-900">
              {siteName}
            </span>
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              className="grid h-9 w-9 place-items-center rounded-full text-brand-800 hover:bg-brand-50"
              aria-label="মেনু বন্ধ করুন"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-4">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="block rounded-xl px-4 py-3 font-medium text-ink hover:bg-white"
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/track"
              className="block rounded-xl px-4 py-3 font-medium text-ink hover:bg-white"
            >
              অর্ডার ট্র্যাক করুন
            </Link>

            <p className="mt-5 mb-1 px-4 text-xs font-semibold tracking-wider text-gold-700 uppercase">
              ক্যাটাগরি
            </p>
            {categories.map((c) => (
              <Link
                key={c.slug}
                href={`/category/${c.slug}`}
                className="flex items-center justify-between rounded-xl px-4 py-2.5 text-sm text-ink hover:bg-white"
              >
                {c.name}
                <span className="text-xs text-muted">{toBn(c.count)} টি</span>
              </Link>
            ))}
          </div>

          <a
            href={`tel:${phone.replace(/[^\d+]/g, '')}`}
            className="flex items-center justify-center gap-2 border-t border-brand-100 bg-brand-700 py-4 font-semibold text-white"
          >
            <Phone size={18} />
            {phone}
          </a>
        </nav>
      </div>
    </>
  )
}
