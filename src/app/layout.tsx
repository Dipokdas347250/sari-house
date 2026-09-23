import type { Metadata, Viewport } from 'next'
import { Hind_Siliguri, Noto_Serif_Bengali } from 'next/font/google'
import { Toaster } from 'sonner'
import './globals.css'

const bangla = Hind_Siliguri({
  subsets: ['bengali', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-bangla',
  display: 'swap',
})

const banglaDisplay = Noto_Serif_Bengali({
  subsets: ['bengali', 'latin'],
  weight: ['500', '600', '700'],
  variable: '--font-bangla-display',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: {
    default: 'শাড়িঘর — অনলাইনে শাড়ি ও দেশীয় পোশাক',
    template: '%s | শাড়িঘর',
  },
  description:
    'জামদানি, টাঙ্গাইল তাঁত, কাতান, সিল্ক ও থ্রি-পিসের বিশাল সংগ্রহ। সারা বাংলাদেশে হোম ডেলিভারি, ক্যাশ অন ডেলিভারি সুবিধা।',
  keywords: ['শাড়ি', 'জামদানি', 'তাঁতের শাড়ি', 'অনলাইন শপ', 'থ্রি পিস', 'বাংলাদেশ'],
  openGraph: {
    type: 'website',
    locale: 'bn_BD',
    siteName: 'শাড়িঘর',
    title: 'শাড়িঘর — অনলাইনে শাড়ি ও দেশীয় পোশাক',
    description: 'বাংলার তাঁতের গল্প, আপনার আঁচলে। সারা দেশে ডেলিভারি।',
  },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  themeColor: '#9e1f3a',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="bn" data-scroll-behavior="smooth">
      <body className={`${bangla.variable} ${banglaDisplay.variable} antialiased`}>
        {children}
        <Toaster
          position="top-center"
          richColors
          closeButton
          toastOptions={{
            style: { fontFamily: 'var(--font-bangla)', fontSize: '0.95rem' },
          }}
        />
      </body>
    </html>
  )
}
