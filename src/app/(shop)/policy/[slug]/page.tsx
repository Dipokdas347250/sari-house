import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { ChevronLeft } from 'lucide-react'
import { getSettings } from '@/lib/settings'

type Section = { heading: string; paragraphs: string[]; bullets?: string[] }
type Policy = { title: string; intro: string; sections: Section[] }

const POLICIES: Record<string, Policy> = {
  delivery: {
    title: 'ডেলিভারি নীতিমালা',
    intro:
      'আমরা সারা বাংলাদেশে পণ্য পৌঁছে দিই। নিচে ডেলিভারি সম্পর্কিত সব তথ্য দেওয়া হলো।',
    sections: [
      {
        heading: 'কত সময় লাগে',
        paragraphs: [
          'অর্ডার নিশ্চিত হওয়ার পর থেকে সময় গণনা শুরু হয়। অর্ডার দেওয়ার পর আমাদের একজন প্রতিনিধি ফোন করে অর্ডারটি নিশ্চিত করেন।',
        ],
        bullets: [
          'ঢাকা শহরের ভেতরে — ১ থেকে ২ কর্মদিবস',
          'ঢাকার বাইরে (জেলা শহর) — ২ থেকে ৩ কর্মদিবস',
          'উপজেলা বা প্রত্যন্ত এলাকা — ৩ থেকে ৪ কর্মদিবস',
          'ঈদ বা পূজার আগে চাপ বেশি থাকায় ১-২ দিন বেশি লাগতে পারে',
        ],
      },
      {
        heading: 'ডেলিভারি চার্জ',
        paragraphs: [
          'ডেলিভারি চার্জ আপনার জেলার উপর নির্ভর করে এবং চেকআউটের সময় স্পষ্টভাবে দেখানো হয়। নির্দিষ্ট অঙ্কের বেশি কেনাকাটায় ডেলিভারি চার্জ সম্পূর্ণ ফ্রি।',
        ],
      },
      {
        heading: 'পণ্য বুঝে নেওয়ার সময়',
        paragraphs: [
          'কুরিয়ারের সামনেই প্যাকেট খুলে দেখে নেওয়ার অনুরোধ করছি। পণ্যে কোনো সমস্যা চোখে পড়লে তখনই ছবি তুলে আমাদের জানান — সমাধান সহজ হয়।',
        ],
      },
      {
        heading: 'ডেলিভারি ব্যর্থ হলে',
        paragraphs: [
          'দেওয়া নম্বরে তিনবার ফোন করেও যোগাযোগ করা না গেলে বা ঠিকানা ভুল থাকলে পণ্য ফেরত আসে। এমন হলে দ্বিতীয়বার পাঠানোর ডেলিভারি চার্জ ক্রেতাকে বহন করতে হয়।',
        ],
      },
    ],
  },

  return: {
    title: 'রিটার্ন ও রিফান্ড নীতিমালা',
    intro:
      'আমরা চাই আপনি সন্তুষ্ট হন। পণ্যে সমস্যা থাকলে আমরা দায়িত্ব নিয়ে সমাধান করি।',
    sections: [
      {
        heading: 'কখন ফেরত নেওয়া হয়',
        paragraphs: ['নিচের যেকোনো কারণ থাকলে পণ্য হাতে পাওয়ার ৩ দিনের মধ্যে জানান —'],
        bullets: [
          'ভুল পণ্য বা ভুল সাইজ পাঠানো হয়েছে',
          'কাপড়ে ছেঁড়া, দাগ বা বুননের স্পষ্ট ত্রুটি আছে',
          'ওয়েবসাইটের বর্ণনার সাথে পণ্যের বড় ধরনের অমিল',
        ],
      },
      {
        heading: 'কখন ফেরত নেওয়া হয় না',
        paragraphs: [],
        bullets: [
          'পণ্য ব্যবহার করা হয়েছে, ধোয়া হয়েছে বা সেলাই করা হয়েছে',
          'শুধু পছন্দ হয়নি বা মন বদলেছে',
          'পর্দার কারণে রঙ সামান্য আলাদা লেগেছে',
          'সেল বা বিশেষ ছাড়ে কেনা পণ্য (আগে থেকে উল্লেখ করা থাকলে)',
          '৩ দিন পেরিয়ে যাওয়ার পর জানানো হলে',
        ],
      },
      {
        heading: 'কীভাবে জানাবেন',
        paragraphs: [
          'আমাদের ফোন নম্বরে কল করুন বা হোয়াটসঅ্যাপে অর্ডার নম্বরসহ পণ্যের ছবি ও ভিডিও পাঠান। আমাদের দিক থেকে ভুল হলে ফেরত পাঠানোর কুরিয়ার খরচ আমরাই বহন করি।',
        ],
      },
      {
        heading: 'টাকা ফেরত',
        paragraphs: [
          'পণ্য আমাদের কাছে পৌঁছে যাচাই হওয়ার পর ৩ থেকে ৭ কর্মদিবসের মধ্যে টাকা ফেরত দেওয়া হয়। বিকাশ বা নগদে পাঠানো হলে সেই নম্বরেই ফেরত যায়।',
        ],
      },
    ],
  },

  privacy: {
    title: 'গোপনীয়তা নীতি',
    intro:
      'আপনার দেওয়া তথ্য আমাদের কাছে আমানত। কীভাবে তা ব্যবহার করি, তা এখানে খোলাখুলি লেখা আছে।',
    sections: [
      {
        heading: 'আমরা কী তথ্য নিই',
        paragraphs: ['অর্ডার সম্পন্ন করতে যতটুকু দরকার, ঠিক ততটুকুই —'],
        bullets: [
          'নাম, মোবাইল নম্বর ও ডেলিভারির ঠিকানা',
          'ইমেইল ঠিকানা (যদি দেন)',
          'পেমেন্টের ক্ষেত্রে ট্রানজেকশন আইডি ও প্রেরকের নম্বর',
        ],
      },
      {
        heading: 'কীভাবে ব্যবহার করি',
        paragraphs: [],
        bullets: [
          'অর্ডার প্রক্রিয়া করা ও পণ্য পৌঁছে দেওয়া',
          'অর্ডার নিশ্চিত করতে ফোন করা',
          'নতুন পণ্য বা অফারের খবর জানানো (আপনি চাইলে)',
        ],
      },
      {
        heading: 'আমরা যা করি না',
        paragraphs: [
          'আপনার ফোন নম্বর বা ঠিকানা আমরা কোনো তৃতীয় পক্ষের কাছে বিক্রি করি না। কেবল কুরিয়ার প্রতিষ্ঠানকে ডেলিভারির জন্য প্রয়োজনীয় তথ্যটুকু দেওয়া হয়।',
        ],
      },
      {
        heading: 'কুকি',
        paragraphs: [
          'আপনার কার্ট ও পছন্দের তালিকা আপনার নিজের ব্রাউজারেই সংরক্ষিত থাকে, আমাদের সার্ভারে যায় না। ব্রাউজারের ডেটা মুছে ফেললে এগুলোও মুছে যাবে।',
        ],
      },
      {
        heading: 'তথ্য মুছে ফেলা',
        paragraphs: [
          'আপনি চাইলে আমাদের কাছে থাকা আপনার তথ্য মুছে ফেলার অনুরোধ করতে পারেন। ফোন বা ইমেইলে জানালেই হবে।',
        ],
      },
    ],
  },

  terms: {
    title: 'শর্তাবলি',
    intro: 'এই ওয়েবসাইট ব্যবহার ও অর্ডার করার শর্তগুলো নিচে দেওয়া হলো।',
    sections: [
      {
        heading: 'অর্ডার',
        paragraphs: [
          'ওয়েবসাইটে অর্ডার দেওয়ার অর্থ হলো আপনি পণ্য কেনার আগ্রহ প্রকাশ করেছেন। আমাদের প্রতিনিধি ফোনে নিশ্চিত করার পরই অর্ডারটি চূড়ান্ত হয়।',
          'স্টক শেষ হয়ে যাওয়া, দামে ভুল থাকা বা ঠিকানা অসম্পূর্ণ থাকলে আমরা অর্ডার বাতিল করার অধিকার রাখি। সেক্ষেত্রে আগে টাকা দিয়ে থাকলে তা পুরোপুরি ফেরত দেওয়া হয়।',
        ],
      },
      {
        heading: 'দাম ও পেমেন্ট',
        paragraphs: [
          'ওয়েবসাইটে দেখানো সব দাম বাংলাদেশি টাকায় এবং ডেলিভারি চার্জ আলাদা। দাম যেকোনো সময় পরিবর্তন হতে পারে, তবে নিশ্চিত হওয়া অর্ডারের দাম বদলায় না।',
          'ক্যাশ অন ডেলিভারি ছাড়াও বিকাশ ও নগদে পেমেন্ট করা যায়। বিকাশ বা নগদে পাঠালে সঠিক ট্রানজেকশন আইডি দেওয়া বাধ্যতামূলক।',
        ],
      },
      {
        heading: 'পণ্যের ছবি ও বর্ণনা',
        paragraphs: [
          'আমরা আসল পণ্যের ছবি ব্যবহার করি। তবে হাতে বোনা পণ্যে সামান্য ভিন্নতা স্বাভাবিক, এবং পর্দাভেদে রঙ একটু আলাদা দেখাতে পারে। এটি ত্রুটি হিসেবে গণ্য হবে না।',
        ],
      },
      {
        heading: 'মেধাস্বত্ব',
        paragraphs: [
          'এই ওয়েবসাইটের সব ছবি, লেখা ও নকশা আমাদের সম্পত্তি। অনুমতি ছাড়া কোথাও ব্যবহার করা যাবে না।',
        ],
      },
      {
        heading: 'শর্ত পরিবর্তন',
        paragraphs: [
          'প্রয়োজনে আমরা এই শর্তাবলি হালনাগাদ করতে পারি। পরিবর্তিত শর্ত এই পাতায় প্রকাশের সাথে সাথেই কার্যকর হবে।',
        ],
      },
    ],
  },
}

export function generateStaticParams() {
  return Object.keys(POLICIES).map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const policy = POLICIES[slug]
  if (!policy) return { title: 'পাওয়া যায়নি' }
  return { title: policy.title, description: policy.intro }
}

export default async function PolicyPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const policy = POLICIES[slug]
  if (!policy) notFound()

  const settings = await getSettings()

  return (
    <div className="container-x py-10 sm:py-14">
      <nav aria-label="পথনির্দেশ" className="mb-6 flex items-center gap-1 text-sm text-muted">
        <Link href="/" className="hover:text-brand-700">
          হোম
        </Link>
        <ChevronLeft size={14} className="rotate-180" />
        <span className="text-ink">{policy.title}</span>
      </nav>

      <article className="mx-auto max-w-3xl">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-brand-900 sm:text-3xl">
          {policy.title}
        </h1>
        <p className="mt-3 text-[0.95rem] leading-relaxed text-muted">{policy.intro}</p>

        <div className="mt-9 space-y-9">
          {policy.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="mb-3 font-[family-name:var(--font-display)] text-lg font-semibold text-brand-900">
                {section.heading}
              </h2>
              {section.paragraphs.map((p, i) => (
                <p key={i} className="mb-3 text-[0.95rem] leading-relaxed text-ink">
                  {p}
                </p>
              ))}
              {section.bullets && (
                <ul className="mt-2 space-y-2">
                  {section.bullets.map((b, i) => (
                    <li key={i} className="flex gap-2.5 text-[0.95rem] text-ink">
                      <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>

        <div className="mt-12 rounded-2xl bg-cream-100 p-5 text-sm text-ink">
          <p className="font-semibold text-brand-900">আরও কিছু জানার আছে?</p>
          <p className="mt-1.5 text-muted">
            আমাদের ফোন করুন{' '}
            <a
              href={`tel:${settings.phone.replace(/[^\d+]/g, '')}`}
              className="font-medium text-brand-700 hover:underline"
            >
              {settings.phone}
            </a>{' '}
            অথবা{' '}
            <Link href="/contact" className="font-medium text-brand-700 hover:underline">
              বার্তা পাঠান
            </Link>
            ।
          </p>
        </div>
      </article>
    </div>
  )
}
