'use client'

import { useEffect, useState } from 'react'
import { MessageCircle, Phone, X, ArrowUp } from 'lucide-react'
import { cn } from '@/lib/utils'

/** ডানদিকের নিচে ভাসমান যোগাযোগ বোতাম */
export function FloatingContact({
  whatsapp,
  phone,
}: {
  whatsapp: string
  phone: string
}) {
  const [open, setOpen] = useState(false)
  const [showTop, setShowTop] = useState(false)

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 600)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="no-print fixed right-4 bottom-4 z-50 flex flex-col items-end gap-2 sm:right-6 sm:bottom-6">
      {showTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="উপরে যান"
          className="grid h-10 w-10 place-items-center rounded-full border border-brand-200 bg-white text-brand-800 shadow-md transition-colors hover:bg-brand-50"
        >
          <ArrowUp size={18} />
        </button>
      )}

      <div
        className={cn(
          'flex flex-col items-end gap-2 transition-all duration-300',
          open
            ? 'pointer-events-auto translate-y-0 opacity-100'
            : 'pointer-events-none translate-y-2 opacity-0'
        )}
      >
        <a
          href={`https://wa.me/${whatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-full bg-[#25D366] py-2.5 pr-4 pl-3 text-sm font-semibold text-white shadow-lg"
        >
          <MessageCircle size={18} />
          হোয়াটসঅ্যাপে লিখুন
        </a>
        <a
          href={`tel:${phone.replace(/[^\d+]/g, '')}`}
          className="flex items-center gap-2 rounded-full bg-brand-700 py-2.5 pr-4 pl-3 text-sm font-semibold text-white shadow-lg"
        >
          <Phone size={18} />
          {phone}
        </a>
      </div>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? 'যোগাযোগের অপশন বন্ধ করুন' : 'যোগাযোগ করুন'}
        className="grid h-13 w-13 place-items-center rounded-full bg-brand-700 text-white shadow-xl transition-transform hover:scale-105 active:scale-95"
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>
    </div>
  )
}
