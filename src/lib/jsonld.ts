import type { ProductDetail } from '@/lib/products'
import type { SiteSettings } from '@/lib/settings'

/**
 * schema.org স্ট্রাকচার্ড ডেটা — গুগল যেন পণ্যের দাম, স্টক ও রেটিং
 * সার্চ ফলাফলেই দেখাতে পারে।
 */

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
).replace(/\/$/, '')

const abs = (path: string) => (path.startsWith('http') ? path : `${SITE_URL}${path}`)

/** দোকানের পরিচয় — হোমপেজে একবার */
export function organizationJsonLd(settings: SiteSettings) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Store',
    '@id': `${SITE_URL}/#store`,
    name: settings.siteName,
    slogan: settings.tagline,
    url: SITE_URL,
    image: abs('/icon.svg'),
    telephone: settings.phone,
    email: settings.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: settings.address,
      addressCountry: 'BD',
    },
    areaServed: { '@type': 'Country', name: 'Bangladesh' },
    currenciesAccepted: 'BDT',
    paymentAccepted: 'Cash on Delivery, bKash, Nagad',
    sameAs: [settings.facebook, settings.instagram].filter(Boolean),
  }
}

/** সাইট ও তার সার্চবক্স */
export function websiteJsonLd(settings: SiteSettings) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: settings.siteName,
    url: SITE_URL,
    inLanguage: 'bn-BD',
    publisher: { '@id': `${SITE_URL}/#store` },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/products?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

/** একটি পণ্য — দাম, স্টক ও রিভিউ সহ */
export function productJsonLd(product: ProductDetail, settings: SiteSettings) {
  const url = `${SITE_URL}/products/${product.slug}`

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${url}#product`,
    name: product.name,
    description: product.shortDesc || product.description.slice(0, 300),
    url,
    image: product.images.map(abs),
    sku: product.sku || undefined,
    category: product.categoryName,
    material: product.fabric || undefined,
    color: product.colors.map((c) => c.name).join(', ') || undefined,
    brand: { '@type': 'Brand', name: settings.siteName },
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency: 'BDT',
      price: product.price,
      availability:
        product.stock > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: { '@id': `${SITE_URL}/#store` },
    },
    ...(product.reviewCount > 0
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: Math.round(product.rating * 10) / 10,
            reviewCount: product.reviewCount,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
  }
}

/** ব্রেডক্রাম — সার্চ ফলাফলে পথটা দেখায় */
export function breadcrumbJsonLd(trail: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: abs(item.path),
    })),
  }
}
