import type { Metadata } from 'next'
import { Heart, Scissors, Truck, ShieldCheck, Sparkles, Users } from 'lucide-react'
import { SmartImage } from '@/components/ui/SmartImage'
import { LinkButton } from '@/components/ui/kit'
import { getSettings } from '@/lib/settings'
import { toBn } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'আমাদের কথা',
  description:
    'শাড়িঘর কীভাবে শুরু হলো, আমরা কোথা থেকে পণ্য আনি আর কীভাবে কাজ করি — সব এখানে।',
}

const VALUES = [
  {
    icon: Heart,
    title: 'তাঁতির পাশে থাকা',
    text: 'আমরা সরাসরি তাঁতির কাছ থেকে কিনি এবং হাতে হাতে দাম পরিশোধ করি। কোনো বাকি নেই, কোনো ফড়িয়া নেই।',
  },
  {
    icon: ShieldCheck,
    title: 'যা দেখছেন, তাই পাবেন',
    text: 'ছবি তোলা হয় আসল পণ্যের, কোনো এডিট ছাড়া। রঙে সামান্য পার্থক্য হলে আগেই জানিয়ে দিই।',
  },
  {
    icon: Scissors,
    title: 'নিজে যাচাই করে নেওয়া',
    text: 'প্রতিটি শাড়ি পাঠানোর আগে আমরা নিজেরা খুলে দেখি — সুতো ছেঁড়া, দাগ বা বুননের ত্রুটি আছে কি না।',
  },
  {
    icon: Truck,
    title: 'সময়মতো পৌঁছানো',
    text: 'ঢাকায় ১-২ দিন, বাইরে ২-৪ দিন। দেরি হলে ফোন করে আগেই জানাই।',
  },
]

const TIMELINE = [
  {
    year: '২০১৪',
    title: 'ছোট্ট শুরু',
    text: 'নিউ মার্কেটের এক কোণে ছোট একটি দোকান দিয়ে যাত্রা। প্রথম মাসে বিক্রি হয়েছিল মাত্র ১১টি শাড়ি।',
  },
  {
    year: '২০১৮',
    title: 'সরাসরি তাঁতির কাছে',
    text: 'পাইকারি বাজার ছেড়ে আমরা নিজেরাই রূপগঞ্জ আর টাঙ্গাইলে গিয়ে তাঁতিদের সাথে সরাসরি কাজ শুরু করি।',
  },
  {
    year: '২০২১',
    title: 'অনলাইনে পা রাখা',
    text: 'মহামারির সময় ফেসবুক পেজ দিয়ে অনলাইন বিক্রি শুরু। দেশের ৬৪ জেলায় পৌঁছে যাই।',
  },
  {
    year: 'আজ',
    title: 'আপনার শাড়িঘর',
    text: 'এখন প্রতি মাসে হাজারো পরিবারের কাছে পৌঁছে যায় আমাদের পণ্য। গল্পটা এখনো চলছে।',
  },
]

export default async function AboutPage() {
  const settings = await getSettings()

  return (
    <>
      {/* শিরোনাম */}
      <section className="relative h-64 overflow-hidden bg-brand-950 sm:h-80">
        <SmartImage
          src="/seed/banner-2.svg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-45"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-950 via-brand-950/60 to-brand-950/30" />
        <div className="container-x relative flex h-full flex-col justify-center text-center">
          <p className="mb-2 text-xs font-semibold tracking-[0.2em] text-gold-400 uppercase">
            আমাদের কথা
          </p>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-white text-balance-bn sm:text-4xl">
            {settings.tagline}
          </h1>
        </div>
      </section>

      {/* গল্প */}
      <section className="container-x py-14 sm:py-16">
        <div className="mx-auto max-w-3xl space-y-5 text-[0.95rem] leading-relaxed text-ink">
          <p>
            আমাদের শুরুটা খুব সাধারণ। একটা সময় আমরা দেখলাম — যে তাঁতি সারা মাস খেটে একটা
            জামদানি বোনেন, তিনি পান সামান্য টাকা; আর সেই শাড়িই শহরের দোকানে বিক্রি হয়
            কয়েকগুণ বেশি দামে। মাঝখানের এই লম্বা শেকলটা ছোট করতেই{' '}
            <strong>{settings.siteName}</strong> এর জন্ম।
          </p>
          <p>
            আমরা নিজেরা গ্রামে যাই। তাঁতির ঘরে বসে চা খাই, তাঁর বুনন দেখি, দরদাম করি — তারপর
            নগদ টাকায় শাড়ি কিনে আনি। এতে তাঁতি ন্যায্য দাম পান, আর আপনি পান আসল জিনিস
            নাগালের দামে।
          </p>
          <p>
            আমরা বড় কোম্পানি নই। আমরা ছোট একটা দল, যারা বাংলার তাঁতকে ভালোবাসে। তাই আমাদের
            কাছে অর্ডার করলে ফোনটা ধরেন আমাদেরই কেউ — কোনো রোবট নয়।
          </p>
        </div>
      </section>

      {/* মূল্যবোধ */}
      <section className="bg-white py-14 sm:py-16">
        <div className="container-x">
          <h2 className="mb-9 text-center font-[family-name:var(--font-display)] text-2xl font-bold text-brand-900 sm:text-3xl">
            আমরা যেভাবে কাজ করি
          </h2>

          <div className="grid gap-5 sm:grid-cols-2">
            {VALUES.map(({ icon: Icon, title, text }) => (
              <div
                key={title}
                className="flex gap-4 rounded-2xl border border-brand-100 bg-cream-50 p-5"
              >
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-brand-700 text-white">
                  <Icon size={21} />
                </span>
                <div>
                  <h3 className="font-[family-name:var(--font-display)] text-base font-semibold text-brand-900">
                    {title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* সময়রেখা */}
      <section className="container-x py-14 sm:py-16">
        <h2 className="mb-10 text-center font-[family-name:var(--font-display)] text-2xl font-bold text-brand-900 sm:text-3xl">
          পথচলার গল্প
        </h2>

        <ol className="relative mx-auto max-w-2xl border-r-2 border-brand-100 pr-6 sm:pr-8">
          {TIMELINE.map((t) => (
            <li key={t.year} className="relative pb-9 last:pb-0">
              <span className="absolute top-1 -right-[0.6rem] grid h-4 w-4 place-items-center rounded-full border-2 border-brand-600 bg-cream-50" />
              <p className="font-[family-name:var(--font-display)] text-lg font-bold text-gold-700">
                {t.year}
              </p>
              <h3 className="mt-0.5 font-semibold text-brand-900">{t.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{t.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* সংখ্যা */}
      <section className="bg-brand-950 weave-bg py-14">
        <div className="container-x grid grid-cols-2 gap-6 text-center sm:grid-cols-4">
          {[
            { icon: Users, value: `${toBn(9200)}+`, label: 'খুশি ক্রেতা' },
            { icon: Scissors, value: `${toBn(140)}+`, label: 'তাঁতি পরিবার' },
            { icon: Truck, value: toBn(64), label: 'জেলায় ডেলিভারি' },
            { icon: Sparkles, value: `${toBn(12)}`, label: 'বছরের পথচলা' },
          ].map(({ icon: Icon, value, label }) => (
            <div key={label}>
              <Icon size={24} className="mx-auto mb-3 text-gold-400" />
              <div className="font-[family-name:var(--font-display)] text-2xl font-bold text-white sm:text-3xl">
                {value}
              </div>
              <div className="mt-1 text-xs text-cream-300/80">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ডাক */}
      <section className="container-x py-14 text-center sm:py-16">
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-brand-900">
          আপনার পছন্দের শাড়িটি খুঁজে নিন
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted">
          প্রশ্ন থাকলে সরাসরি ফোন করুন — {settings.phone}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <LinkButton href="/products" variant="primary" size="lg">
            সংগ্রহ দেখুন
          </LinkButton>
          <LinkButton href="/contact" variant="outline" size="lg">
            যোগাযোগ করুন
          </LinkButton>
        </div>
      </section>
    </>
  )
}
