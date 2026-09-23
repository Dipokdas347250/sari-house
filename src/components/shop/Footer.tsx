import Link from 'next/link'
import {
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  Truck,
  ShieldCheck,
  RefreshCcw,
  HandCoins,
} from 'lucide-react'
import { FacebookIcon, InstagramIcon } from '@/components/ui/BrandIcons'
import { NewsletterForm } from '@/components/shop/NewsletterForm'
import type { SiteSettings } from '@/lib/settings'
import { formatTaka } from '@/lib/utils'

const PROMISES = [
  {
    icon: Truck,
    title: 'সারা দেশে ডেলিভারি',
    text: 'ঢাকায় ১-২ দিন, ঢাকার বাইরে ২-৪ দিন',
  },
  {
    icon: HandCoins,
    title: 'ক্যাশ অন ডেলিভারি',
    text: 'পণ্য হাতে পেয়ে টাকা দিন',
  },
  {
    icon: RefreshCcw,
    title: '৩ দিনের রিটার্ন',
    text: 'পণ্যে সমস্যা থাকলে বদলে দেওয়া হবে',
  },
  {
    icon: ShieldCheck,
    title: 'শতভাগ আসল',
    text: 'সরাসরি তাঁতির কাছ থেকে সংগ্রহ',
  },
]

export function Footer({
  settings,
  categories,
}: {
  settings: SiteSettings
  categories: { name: string; slug: string }[]
}) {
  const year = new Date().getFullYear()

  return (
    <footer className="mt-16">
      {/* প্রতিশ্রুতির সারি */}
      <div className="border-y border-brand-100 bg-white">
        <div className="container-x grid grid-cols-2 gap-6 py-10 lg:grid-cols-4">
          {PROMISES.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex items-start gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-700">
                <Icon size={20} />
              </span>
              <div>
                <p className="text-sm font-semibold text-ink">{title}</p>
                <p className="mt-0.5 text-xs text-muted">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* মূল ফুটার */}
      <div className="weave-bg bg-brand-950 text-cream-200">
        <div className="container-x grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-4">
          {/* পরিচয় */}
          <div>
            <div className="flex items-center gap-2">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-gold-500 font-[family-name:var(--font-display)] text-lg font-bold text-brand-950">
                শা
              </span>
              <span className="font-[family-name:var(--font-display)] text-2xl font-bold text-white">
                {settings.siteName}
              </span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-cream-300/90">
              {settings.tagline}। আমরা সরাসরি তাঁতি ও কারিগরদের কাছ থেকে পণ্য সংগ্রহ করি, তাই
              দাম থাকে নাগালের মধ্যে আর মান থাকে সেরা।
            </p>

            <div className="mt-5 flex gap-2">
              <a
                href={settings.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="ফেসবুক পেজ"
                className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-gold-500 hover:text-brand-950"
              >
                <FacebookIcon size={18} />
              </a>
              <a
                href={settings.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="ইনস্টাগ্রাম"
                className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-gold-500 hover:text-brand-950"
              >
                <InstagramIcon size={18} />
              </a>
              <a
                href={`https://wa.me/${settings.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="হোয়াটসঅ্যাপে বার্তা"
                className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-gold-500 hover:text-brand-950"
              >
                <MessageCircle size={18} />
              </a>
            </div>
          </div>

          {/* ক্যাটাগরি */}
          <nav aria-label="ক্যাটাগরি">
            <h3 className="mb-4 font-[family-name:var(--font-display)] text-base font-semibold text-white">
              আমাদের সংগ্রহ
            </h3>
            <ul className="space-y-2.5 text-sm">
              {categories.slice(0, 7).map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/category/${c.slug}`}
                    className="text-cream-300/85 transition-colors hover:text-gold-300"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* সহায়তা */}
          <nav aria-label="সহায়তা">
            <h3 className="mb-4 font-[family-name:var(--font-display)] text-base font-semibold text-white">
              সহায়তা
            </h3>
            <ul className="space-y-2.5 text-sm">
              {[
                { href: '/track', label: 'অর্ডার ট্র্যাক করুন' },
                { href: '/about', label: 'আমাদের কথা' },
                { href: '/contact', label: 'যোগাযোগ' },
                { href: '/policy/delivery', label: 'ডেলিভারি নীতিমালা' },
                { href: '/policy/return', label: 'রিটার্ন ও রিফান্ড' },
                { href: '/policy/privacy', label: 'গোপনীয়তা নীতি' },
                { href: '/policy/terms', label: 'শর্তাবলি' },
              ].map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-cream-300/85 transition-colors hover:text-gold-300"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* যোগাযোগ + নিউজলেটার */}
          <div>
            <h3 className="mb-4 font-[family-name:var(--font-display)] text-base font-semibold text-white">
              যোগাযোগ
            </h3>
            <ul className="space-y-3 text-sm text-cream-300/85">
              <li className="flex items-start gap-2.5">
                <Phone size={16} className="mt-1 shrink-0 text-gold-400" />
                <span>
                  <a href={`tel:${settings.phone.replace(/[^\d+]/g, '')}`} className="hover:text-gold-300">
                    {settings.phone}
                  </a>
                  {settings.altPhone && (
                    <>
                      {' / '}
                      <a
                        href={`tel:${settings.altPhone.replace(/[^\d+]/g, '')}`}
                        className="hover:text-gold-300"
                      >
                        {settings.altPhone}
                      </a>
                    </>
                  )}
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail size={16} className="mt-1 shrink-0 text-gold-400" />
                <a href={`mailto:${settings.email}`} className="hover:text-gold-300">
                  {settings.email}
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin size={16} className="mt-1 shrink-0 text-gold-400" />
                <span>{settings.address}</span>
              </li>
            </ul>

            <div className="mt-6">
              <p className="mb-2 text-sm font-semibold text-white">নতুন পণ্যের খবর পান</p>
              <NewsletterForm />
            </div>
          </div>
        </div>

        {/* নিচের বার */}
        <div className="border-t border-white/10">
          <div className="container-x flex flex-col items-center justify-between gap-3 py-5 text-xs text-cream-300/70 sm:flex-row">
            <p>
              © {year} {settings.siteName}। সর্বস্বত্ব সংরক্ষিত।
            </p>
            <p>
              {formatTaka(Number(settings.freeDeliveryAbove) || 0)} এর বেশি কেনাকাটায় ডেলিভারি
              ফ্রি
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
