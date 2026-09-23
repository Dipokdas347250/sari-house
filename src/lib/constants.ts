/** বাংলাদেশের বিভাগ ও জেলা */
export const DIVISIONS: Record<string, string[]> = {
  ঢাকা: [
    'ঢাকা', 'গাজীপুর', 'নারায়ণগঞ্জ', 'মানিকগঞ্জ', 'মুন্সিগঞ্জ', 'নরসিংদী',
    'টাঙ্গাইল', 'কিশোরগঞ্জ', 'ফরিদপুর', 'গোপালগঞ্জ', 'মাদারীপুর', 'রাজবাড়ী', 'শরীয়তপুর',
  ],
  চট্টগ্রাম: [
    'চট্টগ্রাম', 'কক্সবাজার', 'কুমিল্লা', 'ব্রাহ্মণবাড়িয়া', 'চাঁদপুর', 'ফেনী',
    'লক্ষ্মীপুর', 'নোয়াখালী', 'বান্দরবান', 'খাগড়াছড়ি', 'রাঙ্গামাটি',
  ],
  রাজশাহী: [
    'রাজশাহী', 'বগুড়া', 'জয়পুরহাট', 'নওগাঁ', 'নাটোর', 'চাঁপাইনবাবগঞ্জ', 'পাবনা', 'সিরাজগঞ্জ',
  ],
  খুলনা: [
    'খুলনা', 'বাগেরহাট', 'চুয়াডাঙ্গা', 'যশোর', 'ঝিনাইদহ', 'কুষ্টিয়া',
    'মাগুরা', 'মেহেরপুর', 'নড়াইল', 'সাতক্ষীরা',
  ],
  বরিশাল: ['বরিশাল', 'বরগুনা', 'ভোলা', 'ঝালকাঠি', 'পটুয়াখালী', 'পিরোজপুর'],
  সিলেট: ['সিলেট', 'হবিগঞ্জ', 'মৌলভীবাজার', 'সুনামগঞ্জ'],
  রংপুর: [
    'রংপুর', 'দিনাজপুর', 'গাইবান্ধা', 'কুড়িগ্রাম', 'লালমনিরহাট',
    'নীলফামারী', 'পঞ্চগড়', 'ঠাকুরগাঁও',
  ],
  ময়মনসিংহ: ['ময়মনসিংহ', 'জামালপুর', 'নেত্রকোণা', 'শেরপুর'],
}

export const DIVISION_NAMES = Object.keys(DIVISIONS)

/** ডেলিভারি চার্জ — সেটিংস থেকে ওভাররাইড করা যায় */
export const DEFAULT_DELIVERY = {
  insideDhaka: 70,
  outsideDhaka: 130,
  freeAbove: 3000,
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'

export const ORDER_STATUS: Record<
  OrderStatus,
  { label: string; color: string; description: string }
> = {
  pending: {
    label: 'অপেক্ষমাণ',
    color: 'bg-amber-100 text-amber-800 border-amber-200',
    description: 'আপনার অর্ডারটি আমরা পেয়েছি, শীঘ্রই ফোনে নিশ্চিত করা হবে।',
  },
  confirmed: {
    label: 'নিশ্চিত হয়েছে',
    color: 'bg-sky-100 text-sky-800 border-sky-200',
    description: 'অর্ডার নিশ্চিত হয়েছে, প্যাকেজিংয়ের জন্য প্রস্তুত করা হচ্ছে।',
  },
  processing: {
    label: 'প্রস্তুত হচ্ছে',
    color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    description: 'আপনার পণ্য যত্ন করে প্যাক করা হচ্ছে।',
  },
  shipped: {
    label: 'পাঠানো হয়েছে',
    color: 'bg-violet-100 text-violet-800 border-violet-200',
    description: 'কুরিয়ারে পাঠানো হয়েছে, খুব শীঘ্রই পৌঁছে যাবে।',
  },
  delivered: {
    label: 'ডেলিভারি সম্পন্ন',
    color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    description: 'পণ্য সফলভাবে পৌঁছে দেওয়া হয়েছে। ধন্যবাদ!',
  },
  cancelled: {
    label: 'বাতিল',
    color: 'bg-rose-100 text-rose-800 border-rose-200',
    description: 'অর্ডারটি বাতিল করা হয়েছে।',
  },
}

export const ORDER_STATUS_FLOW: OrderStatus[] = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
]

export const PAYMENT_METHODS = {
  cod: { label: 'ক্যাশ অন ডেলিভারি', short: 'ক্যাশ অন ডেলিভারি' },
  bkash: { label: 'বিকাশ', short: 'বিকাশ' },
  nagad: { label: 'নগদ', short: 'নগদ' },
} as const

export type PaymentMethod = keyof typeof PAYMENT_METHODS

export const SORT_OPTIONS = [
  { value: 'newest', label: 'নতুন আগে' },
  { value: 'price-asc', label: 'দাম: কম থেকে বেশি' },
  { value: 'price-desc', label: 'দাম: বেশি থেকে কম' },
  { value: 'popular', label: 'জনপ্রিয়' },
  { value: 'name', label: 'নাম অনুসারে' },
] as const

/** সাইট সেটিংসের ডিফল্ট মান */
export const DEFAULT_SETTINGS = {
  siteName: 'শাড়িঘর',
  tagline: 'বাংলার তাঁতের গল্প, আপনার আঁচলে',
  phone: '01711-000000',
  altPhone: '01811-000000',
  email: 'hello@sharighor.com',
  address: 'দোকান নং ১২, নিউ মার্কেট, ঢাকা ১২০৫',
  facebook: 'https://facebook.com',
  instagram: 'https://instagram.com',
  whatsapp: '8801711000000',
  bkashNumber: '01711-000000',
  nagadNumber: '01811-000000',
  deliveryInsideDhaka: String(DEFAULT_DELIVERY.insideDhaka),
  deliveryOutsideDhaka: String(DEFAULT_DELIVERY.outsideDhaka),
  freeDeliveryAbove: String(DEFAULT_DELIVERY.freeAbove),
  announcement: 'সারা দেশে ডেলিভারি • ৩০০০৳ এর বেশি কেনাকাটায় ডেলিভারি ফ্রি',
}

export type SettingsKey = keyof typeof DEFAULT_SETTINGS
