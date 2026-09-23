import type { MetadataRoute } from 'next'
import { DEFAULT_SETTINGS } from '@/lib/constants'

/** ফোনের হোম স্ক্রিনে যোগ করার জন্য ওয়েব ম্যানিফেস্ট */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${DEFAULT_SETTINGS.siteName} — অনলাইনে শাড়ি ও দেশীয় পোশাক`,
    short_name: DEFAULT_SETTINGS.siteName,
    description: DEFAULT_SETTINGS.tagline,
    lang: 'bn',
    dir: 'ltr',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#fdf8f3',
    theme_color: '#9e1f3a',
    categories: ['shopping', 'lifestyle'],
    icons: [
      { src: '/favicon.ico', sizes: 'any', type: 'image/x-icon' },
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
    ],
    shortcuts: [
      { name: 'সব পণ্য', url: '/products' },
      { name: 'অর্ডার ট্র্যাক', url: '/track' },
    ],
  }
}
