'use client'

import { useSyncExternalStore } from 'react'

const subscribe = () => () => {}

/**
 * সার্ভারে false, ব্রাউজারে hydration শেষ হওয়ার পর true।
 * localStorage-ভিত্তিক কার্ট বা উইশলিস্ট দেখানোর আগে এটি দেখে নেওয়া হয়,
 * যাতে সার্ভার ও ব্রাউজারের HTML আলাদা না হয়ে যায়।
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  )
}
