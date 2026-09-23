const BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯']

/** ইংরেজি সংখ্যাকে বাংলা সংখ্যায় রূপান্তর — 1250 → ১২৫০ */
export function toBn(value: number | string): string {
  return String(value).replace(/\d/g, (d) => BN_DIGITS[Number(d)])
}

/** বাংলা সংখ্যাকে ইংরেজিতে ফেরত — ১২৫০ → 1250 */
export function fromBn(value: string): string {
  return value.replace(/[০-৯]/g, (d) => String(BN_DIGITS.indexOf(d)))
}

/** টাকার অঙ্ক — ১,২৫০ ৳ */
export function formatTaka(amount: number): string {
  const grouped = Math.round(amount).toLocaleString('en-IN')
  return `৳ ${toBn(grouped)}`
}

/** শুধু সংখ্যাটা বাংলায়, চিহ্ন ছাড়া */
export function formatNumber(amount: number): string {
  return toBn(Math.round(amount).toLocaleString('en-IN'))
}

const BN_MONTHS = [
  'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর',
]

/** তারিখ — ২২ সেপ্টেম্বর ২০২৬ */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return `${toBn(d.getDate())} ${BN_MONTHS[d.getMonth()]} ${toBn(d.getFullYear())}`
}

/** তারিখ ও সময় — ২২ সেপ্টেম্বর ২০২৬, বিকাল ৪:৩০ */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  let h = d.getHours()
  const m = d.getMinutes()
  const period = h < 6 ? 'ভোর' : h < 12 ? 'সকাল' : h < 16 ? 'দুপুর' : h < 19 ? 'বিকাল' : 'রাত'
  h = h % 12 || 12
  return `${formatDate(d)}, ${period} ${toBn(h)}:${toBn(String(m).padStart(2, '0'))}`
}

/** "৫ মিনিট আগে" ধরনের আপেক্ষিক সময় */
export function timeAgo(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000)
  if (seconds < 60) return 'এইমাত্র'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${toBn(minutes)} মিনিট আগে`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${toBn(hours)} ঘণ্টা আগে`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${toBn(days)} দিন আগে`
  return formatDate(d)
}

/** ছাড়ের শতাংশ হিসাব */
export function discountPercent(price: number, comparePrice?: number | null): number {
  if (!comparePrice || comparePrice <= price) return 0
  return Math.round(((comparePrice - price) / comparePrice) * 100)
}

/** বাংলা নাম থেকে URL-বান্ধব slug */
export function makeSlug(text: string): string {
  const base = text
    .trim()
    .toLowerCase()
    .replace(/[^ঀ-৿a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
  return base || `p-${Date.now().toString(36)}`
}

/** JSON স্ট্রিং থেকে নিরাপদে array পার্স */
export function parseJsonArray<T>(value: string | null | undefined, fallback: T[] = []): T[] {
  if (!value) return fallback
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? (parsed as T[]) : fallback
  } catch {
    return fallback
  }
}

/** ক্লাসনেম জোড়া লাগানোর ছোট হেলপার */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ')
}

/** বাংলাদেশি মোবাইল নম্বর যাচাই — 01XXXXXXXXX */
export function isValidPhone(phone: string): boolean {
  return /^01[3-9]\d{8}$/.test(fromBn(phone).replace(/[\s-]/g, ''))
}

/** ফোন নম্বর স্বাভাবিক রূপে আনা */
export function normalizePhone(phone: string): string {
  const digits = fromBn(phone).replace(/\D/g, '')
  if (digits.startsWith('880')) return '0' + digits.slice(3)
  if (digits.length === 10 && digits.startsWith('1')) return '0' + digits
  return digits
}

/** অর্ডার নম্বর — SG-260922-4821 */
export function generateOrderNo(): string {
  const d = new Date()
  const stamp = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
  const rand = Math.floor(1000 + Math.random() * 9000)
  return `SG-${stamp}-${rand}`
}
