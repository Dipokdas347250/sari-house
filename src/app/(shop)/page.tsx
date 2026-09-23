import Link from 'next/link'
import { ArrowLeft, Quote, Sparkles, Scissors, Users, Truck } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { getProducts, getCategories } from '@/lib/products'
import { getSettings } from '@/lib/settings'
import { SmartImage } from '@/components/ui/SmartImage'
import { ProductGrid } from '@/components/shop/ProductGrid'
import { HeroSlider, type Slide } from '@/components/shop/HeroSlider'
import { CountdownOffer } from '@/components/shop/CountdownOffer'
import { SectionHeading, LinkButton, Card } from '@/components/ui/kit'
import { Stars } from '@/components/ui/Stars'
import { JsonLd } from '@/components/ui/JsonLd'
import { organizationJsonLd, websiteJsonLd } from '@/lib/jsonld'
import { toBn, timeAgo } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const [banners, categories, featured, latest, reviews, settings, stats] =
    await Promise.all([
      prisma.banner.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      }),
      getCategories(),
      getProducts({ featured: true, perPage: 8 }),
      getProducts({ sort: 'newest', perPage: 8 }),
      prisma.review.findMany({
        where: { isApproved: true, rating: { gte: 4 } },
        orderBy: { createdAt: 'desc' },
        take: 6,
        include: { product: { select: { name: true, slug: true } } },
      }),
      getSettings(),
      Promise.all([
        prisma.product.count({ where: { isActive: true } }),
        prisma.order.count({ where: { status: 'delivered' } }),
      ]),
    ])

  const slides: Slide[] = banners.map((b) => ({
    id: b.id,
    title: b.title,
    subtitle: b.subtitle,
    image: b.image,
    link: b.link,
    buttonText: b.buttonText,
  }))

  const [productCount, deliveredCount] = stats

  return (
    <>
      <JsonLd data={[organizationJsonLd(settings), websiteJsonLd(settings)]} />

      {slides.length > 0 && <HeroSlider slides={slides} />}

      {/* ---------------- ক্যাটাগরি ---------------- */}
      <section className="container-x py-14 sm:py-16">
        <SectionHeading
          eyebrow="সংগ্রহ"
          title="কোন ধরনের পোশাক খুঁজছেন?"
          description="ঐতিহ্যবাহী জামদানি থেকে শুরু করে রোজকার সুতি — সব এক জায়গায়।"
          action={
            <LinkButton href="/products" variant="outline" size="sm">
              সব দেখুন
              <ArrowLeft size={15} className="rotate-180" />
            </LinkButton>
          }
        />

        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/category/${c.slug}`}
              className="group relative aspect-square overflow-hidden rounded-2xl bg-cream-100"
            >
              <SmartImage
                src={c.image ?? '/seed/cat-tant.svg'}
                alt={c.name}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-950/85 via-brand-950/25 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4">
                <h3 className="font-[family-name:var(--font-display)] text-base font-semibold text-white sm:text-lg">
                  {c.name}
                </h3>
                <p className="mt-0.5 text-xs text-cream-300/85">
                  {toBn(c._count.products)} টি পণ্য
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ---------------- বাছাই করা পণ্য ---------------- */}
      {featured.items.length > 0 && (
        <section className="bg-white py-14 sm:py-16">
          <div className="container-x">
            <SectionHeading
              eyebrow="বিশেষ বাছাই"
              title="আমাদের পছন্দের সংগ্রহ"
              description="যে পণ্যগুলো আমরা নিজেরা বেছে নিয়েছি — মান আর নকশা, দুটোতেই সেরা।"
              action={
                <LinkButton href="/products?sort=popular" variant="outline" size="sm">
                  আরও দেখুন
                  <ArrowLeft size={15} className="rotate-180" />
                </LinkButton>
              }
            />
            <ProductGrid products={featured.items} priorityCount={4} />
          </div>
        </section>
      )}

      {/* ---------------- অফারের ঘড়ি ---------------- */}
      <div className="py-14 sm:py-16">
        <CountdownOffer couponCode="NOBOBORSHO" />
      </div>

      {/* ---------------- নতুন এসেছে ---------------- */}
      {latest.items.length > 0 && (
        <section className="container-x pb-14 sm:pb-16">
          <SectionHeading
            eyebrow="সদ্য এসেছে"
            title="নতুন সংগ্রহ"
            description="তাঁত থেকে সরাসরি — একদম নতুন যা কিছু এসেছে।"
            action={
              <LinkButton href="/products?sort=newest" variant="outline" size="sm">
                সব নতুন পণ্য
                <ArrowLeft size={15} className="rotate-180" />
              </LinkButton>
            }
          />
          <ProductGrid products={latest.items} />
        </section>
      )}

      {/* ---------------- আমাদের গল্প ---------------- */}
      <section className="bg-white py-14 sm:py-16">
        <div className="container-x grid items-center gap-10 lg:grid-cols-2">
          <div className="relative aspect-4/3 overflow-hidden rounded-3xl">
            <SmartImage
              src="/seed/banner-2.svg"
              alt="তাঁতে বোনা শাড়ি"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold tracking-[0.18em] text-gold-700 uppercase">
              আমাদের কথা
            </p>
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-brand-900 text-balance-bn sm:text-3xl">
              {settings.tagline}
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              নারায়ণগঞ্জের রূপগঞ্জ, টাঙ্গাইলের করটিয়া, রাজশাহীর সিল্ক পল্লী — আমরা ঘুরে ঘুরে
              তাঁতিদের কাছ থেকে সরাসরি শাড়ি সংগ্রহ করি। মাঝখানে কোনো ফড়িয়া না থাকায় তাঁতি
              ন্যায্য দাম পান, আর আপনি পান আসল জিনিস কম দামে।
            </p>

            <div className="mt-7 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                { icon: Scissors, value: `${toBn(productCount)}+`, label: 'পণ্যের সংগ্রহ' },
                { icon: Users, value: `${toBn(deliveredCount + 850)}+`, label: 'খুশি ক্রেতা' },
                { icon: Truck, value: `${toBn(64)}`, label: 'জেলায় ডেলিভারি' },
                { icon: Sparkles, value: `${toBn(12)}+`, label: 'বছরের অভিজ্ঞতা' },
              ].map(({ icon: Icon, value, label }) => (
                <div key={label} className="rounded-2xl bg-cream-100 p-4 text-center">
                  <Icon size={20} className="mx-auto mb-2 text-brand-600" />
                  <div className="font-[family-name:var(--font-display)] text-xl font-bold text-brand-900">
                    {value}
                  </div>
                  <div className="mt-0.5 text-[0.7rem] text-muted">{label}</div>
                </div>
              ))}
            </div>

            <LinkButton href="/about" variant="primary" size="md" className="mt-7">
              পুরো গল্পটা পড়ুন
              <ArrowLeft size={16} className="rotate-180" />
            </LinkButton>
          </div>
        </div>
      </section>

      {/* ---------------- ক্রেতাদের মতামত ---------------- */}
      {reviews.length > 0 && (
        <section className="container-x py-14 sm:py-16">
          <SectionHeading
            eyebrow="মতামত"
            title="ক্রেতারা যা বলছেন"
            description="আমাদের সবচেয়ে বড় প্রাপ্তি আপনাদের ভালোবাসা।"
            align="center"
          />

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {reviews.map((r) => (
              <Card key={r.id} className="flex flex-col">
                <Quote size={26} className="mb-3 text-gold-300" />
                <p className="flex-1 text-sm leading-relaxed text-ink">{r.comment}</p>
                <div className="mt-4 border-t border-brand-100 pt-4">
                  <Stars rating={r.rating} showCount={false} />
                  <p className="mt-2 text-sm font-semibold text-brand-900">
                    {r.customerName}
                  </p>
                  <p className="text-xs text-muted">
                    <Link
                      href={`/products/${r.product.slug}`}
                      className="hover:text-brand-700"
                    >
                      {r.product.name}
                    </Link>
                    {' • '}
                    {timeAgo(r.createdAt)}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}
    </>
  )
}
