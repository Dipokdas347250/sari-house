import type { Metadata } from 'next'
import { Phone, Mail, MapPin, Clock, MessageCircle } from 'lucide-react'
import { ContactForm } from '@/components/shop/ContactForm'
import { FacebookIcon, InstagramIcon } from '@/components/ui/BrandIcons'
import { getSettings } from '@/lib/settings'

export const metadata: Metadata = {
  title: 'যোগাযোগ',
  description: 'ফোন, হোয়াটসঅ্যাপ বা ফর্মের মাধ্যমে আমাদের সাথে যোগাযোগ করুন।',
}

const FAQ = [
  {
    q: 'অর্ডার করার কতদিনে পণ্য পাব?',
    a: 'ঢাকার ভেতরে সাধারণত ১-২ কর্মদিবস, ঢাকার বাইরে ২-৪ কর্মদিবস লাগে। উৎসবের সময় একটু বেশি সময় লাগতে পারে।',
  },
  {
    q: 'পণ্য পছন্দ না হলে ফেরত দেওয়া যাবে?',
    a: 'পণ্যে ত্রুটি থাকলে বা ভুল পণ্য পেলে হাতে পাওয়ার ৩ দিনের মধ্যে জানালে আমরা বদলে দিই। ব্যবহার করা পণ্য ফেরত নেওয়া হয় না।',
  },
  {
    q: 'ছবির রঙের সাথে আসল রঙ মিলবে তো?',
    a: 'আমরা কোনো এডিট ছাড়া আসল পণ্যের ছবি দিই। তবে মোবাইল বা কম্পিউটারের পর্দাভেদে রঙ সামান্য আলাদা দেখাতে পারে।',
  },
  {
    q: 'অগ্রিম টাকা দিতে হবে?',
    a: 'ক্যাশ অন ডেলিভারিতে কোনো অগ্রিম লাগে না। তবে ঢাকার বাইরে দামি পণ্যের ক্ষেত্রে আমরা ডেলিভারি চার্জ অগ্রিম নিতে পারি।',
  },
  {
    q: 'পাইকারি অর্ডার নেওয়া হয়?',
    a: 'হ্যাঁ। ১০ পিস বা তার বেশি অর্ডারে বিশেষ দাম পাবেন। সরাসরি ফোন করে কথা বলুন।',
  },
]

export default async function ContactPage() {
  const settings = await getSettings()

  const channels = [
    {
      icon: Phone,
      label: 'ফোন করুন',
      value: `${settings.phone}${settings.altPhone ? ` / ${settings.altPhone}` : ''}`,
      href: `tel:${settings.phone.replace(/[^\d+]/g, '')}`,
    },
    {
      icon: MessageCircle,
      label: 'হোয়াটসঅ্যাপ',
      value: settings.phone,
      href: `https://wa.me/${settings.whatsapp}`,
    },
    {
      icon: Mail,
      label: 'ইমেইল',
      value: settings.email,
      href: `mailto:${settings.email}`,
    },
    {
      icon: MapPin,
      label: 'দোকানের ঠিকানা',
      value: settings.address,
      href: null,
    },
  ]

  return (
    <div className="container-x py-10 sm:py-14">
      <header className="mb-10 text-center">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-brand-900 sm:text-3xl">
          যোগাযোগ করুন
        </h1>
        <p className="mx-auto mt-2 max-w-lg text-sm text-muted">
          যেকোনো প্রশ্ন, অভিযোগ বা পরামর্শ — আমরা শুনতে আগ্রহী। ফোন করলে সবচেয়ে দ্রুত উত্তর
          পাবেন।
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1fr_23rem]">
        {/* ফর্ম */}
        <div className="rounded-2xl border border-brand-100 bg-white p-5 sm:p-7">
          <h2 className="mb-5 font-[family-name:var(--font-display)] text-lg font-semibold text-brand-900">
            বার্তা লিখুন
          </h2>
          <ContactForm />
        </div>

        {/* যোগাযোগের মাধ্যম */}
        <aside className="space-y-4">
          <div className="rounded-2xl border border-brand-100 bg-white p-5">
            <ul className="space-y-4">
              {channels.map(({ icon: Icon, label, value, href }) => (
                <li key={label} className="flex gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-700">
                    <Icon size={18} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs text-muted">{label}</p>
                    {href ? (
                      <a
                        href={href}
                        target={href.startsWith('http') ? '_blank' : undefined}
                        rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                        className="text-sm font-medium text-ink break-words hover:text-brand-700"
                      >
                        {value}
                      </a>
                    ) : (
                      <p className="text-sm font-medium text-ink">{value}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-brand-100 bg-white p-5">
            <h3 className="mb-3 flex items-center gap-2 font-semibold text-brand-900">
              <Clock size={17} />
              খোলা থাকে
            </h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">শনি — বৃহস্পতি</dt>
                <dd className="font-medium text-ink">সকাল ১০টা — রাত ৯টা</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">শুক্রবার</dt>
                <dd className="font-medium text-ink">বিকাল ৩টা — রাত ৯টা</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-2xl bg-brand-950 p-5 text-center">
            <p className="mb-3 text-sm text-cream-200">সোশ্যাল মিডিয়ায় আমরা</p>
            <div className="flex justify-center gap-2">
              <a
                href={settings.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="ফেসবুক"
                className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white hover:bg-gold-500 hover:text-brand-950"
              >
                <FacebookIcon size={18} />
              </a>
              <a
                href={settings.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="ইনস্টাগ্রাম"
                className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white hover:bg-gold-500 hover:text-brand-950"
              >
                <InstagramIcon size={18} />
              </a>
              <a
                href={`https://wa.me/${settings.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="হোয়াটসঅ্যাপ"
                className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white hover:bg-gold-500 hover:text-brand-950"
              >
                <MessageCircle size={18} />
              </a>
            </div>
          </div>
        </aside>
      </div>

      {/* প্রশ্নোত্তর */}
      <section className="mt-14">
        <h2 className="mb-6 text-center font-[family-name:var(--font-display)] text-2xl font-bold text-brand-900">
          প্রায়ই জিজ্ঞাসিত প্রশ্ন
        </h2>

        <div className="mx-auto max-w-3xl space-y-3">
          {FAQ.map((item, i) => (
            <details
              key={i}
              className="group rounded-2xl border border-brand-100 bg-white px-5 py-4 open:bg-cream-50"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-ink">
                {item.q}
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-700 transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted">{item.a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  )
}
