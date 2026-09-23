'use client'

import { useEffect, useRef } from 'react'
import { recordProductView } from '@/actions/shop'

/**
 * পণ্যের পাতা সত্যিই কেউ খুলেছে কি না সেটা ব্রাউজার থেকে জানানো হয় —
 * এতে সার্চ ইঞ্জিনের ক্রল বা প্রিফেচ গণনায় ঢোকে না।
 * এক সেশনে একটি পণ্য একবারই গোনা হয়।
 */
export function ViewTracker({ productId }: { productId: string }) {
  const sent = useRef(false)

  useEffect(() => {
    if (sent.current) return
    sent.current = true

    const key = `viewed:${productId}`
    try {
      if (sessionStorage.getItem(key)) return
      sessionStorage.setItem(key, '1')
    } catch {
      // প্রাইভেট মোডে sessionStorage বন্ধ থাকতে পারে — তবুও গণনা চলবে
    }

    void recordProductView(productId)
  }, [productId])

  return null
}
