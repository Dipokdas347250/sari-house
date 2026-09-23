'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useTransition } from 'react'
import {
  LayoutDashboard,
  Package,
  Tags,
  ShoppingCart,
  Ticket,
  Images,
  Star,
  MessageSquare,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  ExternalLink,
  Loader2,
} from 'lucide-react'
import { adminLogout } from '@/actions/admin'
import { cn, toBn } from '@/lib/utils'

export type AdminBadges = {
  orders: number
  reviews: number
  messages: number
}

const NAV = [
  { href: '/admin', label: 'ড্যাশবোর্ড', icon: LayoutDashboard, badge: null },
  { href: '/admin/orders', label: 'অর্ডার', icon: ShoppingCart, badge: 'orders' },
  { href: '/admin/products', label: 'পণ্য', icon: Package, badge: null },
  { href: '/admin/categories', label: 'ক্যাটাগরি', icon: Tags, badge: null },
  { href: '/admin/coupons', label: 'কুপন', icon: Ticket, badge: null },
  { href: '/admin/banners', label: 'ব্যানার', icon: Images, badge: null },
  { href: '/admin/reviews', label: 'রিভিউ', icon: Star, badge: 'reviews' },
  { href: '/admin/messages', label: 'বার্তা', icon: MessageSquare, badge: 'messages' },
  { href: '/admin/subscribers', label: 'সাবস্ক্রাইবার', icon: Users, badge: null },
  { href: '/admin/settings', label: 'সেটিংস', icon: Settings, badge: null },
] as const

export function AdminShell({
  admin,
  badges,
  children,
}: {
  admin: { name: string; email: string; role: string }
  badges: AdminBadges
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  // এক পাতা থেকে আরেক পাতায় গেলে মোবাইল মেনু বন্ধ হয়ে যাবে
  const [lastPath, setLastPath] = useState(pathname)
  if (lastPath !== pathname) {
    setLastPath(pathname)
    setOpen(false)
  }

  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)

  const nav = (
    <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
      {NAV.map(({ href, label, icon: Icon, badge }) => {
        const count = badge ? badges[badge as keyof AdminBadges] : 0
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors',
              isActive(href)
                ? 'bg-brand-700 text-white'
                : 'text-cream-200/80 hover:bg-white/10 hover:text-white'
            )}
          >
            <Icon size={18} className="shrink-0" />
            <span className="flex-1">{label}</span>
            {count > 0 && (
              <span
                className={cn(
                  'grid h-5 min-w-5 place-items-center rounded-full px-1.5 text-[0.65rem] font-bold',
                  isActive(href) ? 'bg-white text-brand-800' : 'bg-gold-500 text-brand-950'
                )}
              >
                {toBn(count)}
              </span>
            )}
          </Link>
        )
      })}
    </nav>
  )

  const footer = (
    <div className="border-t border-white/10 p-3">
      <Link
        href="/"
        target="_blank"
        className="mb-1 flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-cream-200/80 transition-colors hover:bg-white/10 hover:text-white"
      >
        <ExternalLink size={18} />
        দোকান দেখুন
      </Link>

      <form
        action={() => {
          startTransition(async () => {
            await adminLogout()
          })
        }}
      >
        <button
          type="submit"
          disabled={isPending}
          className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-rose-300 transition-colors hover:bg-rose-500/15 disabled:opacity-60"
        >
          {isPending ? <Loader2 size={18} className="animate-spin" /> : <LogOut size={18} />}
          লগআউট
        </button>
      </form>

      <div className="mt-2 rounded-xl bg-white/5 px-3.5 py-3">
        <p className="truncate text-sm font-semibold text-white">{admin.name}</p>
        <p className="truncate text-xs text-cream-300/60">{admin.email}</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-cream-100">
      {/* ডেস্কটপ সাইডবার */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col bg-brand-950 lg:flex">
        <div className="flex items-center gap-2.5 border-b border-white/10 px-5 py-5">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-gold-500 font-[family-name:var(--font-display)] text-lg font-bold text-brand-950">
            শা
          </span>
          <span className="font-[family-name:var(--font-display)] text-lg font-bold text-white">
            শাড়িঘর
          </span>
        </div>
        {nav}
        {footer}
      </aside>

      {/* মোবাইল ড্রয়ার */}
      <div
        className={cn('fixed inset-0 z-50 lg:hidden', open ? '' : 'pointer-events-none')}
        aria-hidden={!open}
      >
        <div
          onClick={() => setOpen(false)}
          className={cn(
            'absolute inset-0 bg-brand-950/50 transition-opacity',
            open ? 'opacity-100' : 'opacity-0'
          )}
        />
        <aside
          className={cn(
            'absolute inset-y-0 left-0 flex w-72 flex-col bg-brand-950 transition-transform duration-300',
            open ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <span className="font-[family-name:var(--font-display)] text-lg font-bold text-white">
              শাড়িঘর
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="মেনু বন্ধ করুন"
              className="grid h-9 w-9 place-items-center rounded-full text-white hover:bg-white/10"
            >
              <X size={20} />
            </button>
          </div>
          {nav}
          {footer}
        </aside>
      </div>

      {/* মূল অংশ */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-brand-100 bg-white/95 px-4 backdrop-blur lg:px-8">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="মেনু খুলুন"
            className="grid h-10 w-10 place-items-center rounded-full text-brand-800 hover:bg-brand-50 lg:hidden"
          >
            <Menu size={22} />
          </button>

          <h1 className="flex-1 font-[family-name:var(--font-display)] text-lg font-semibold text-brand-900">
            {NAV.find((n) => isActive(n.href))?.label ?? 'অ্যাডমিন'}
          </h1>

          <Link
            href="/"
            target="_blank"
            className="hidden items-center gap-1.5 rounded-full border border-brand-200 px-3.5 py-1.5 text-sm font-medium text-brand-800 hover:bg-brand-50 sm:flex"
          >
            <ExternalLink size={15} />
            দোকান দেখুন
          </Link>
        </header>

        <main className="px-4 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  )
}
