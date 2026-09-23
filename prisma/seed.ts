import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { PrismaClient } from '../src/generated/prisma/client'
import { generatePlaceholders } from '../scripts/generate-placeholders'

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? 'file:./dev.db',
})
const prisma = new PrismaClient({ adapter })

const C = {
  লাল: '#c1121f',
  মেরুন: '#7a1029',
  'গাঢ় নীল': '#1d3557',
  সবুজ: '#2a9d8f',
  হলুদ: '#e9c46a',
  কালো: '#22223b',
  'অফ হোয়াইট': '#f3ede3',
  গোলাপি: '#e5989b',
  বেগুনি: '#6a4c93',
  কমলা: '#f4a261',
  ফিরোজা: '#219ebc',
  সোনালি: '#d29820',
} as const

type ColorName = keyof typeof C
const color = (...names: ColorName[]) => names.map((n) => ({ name: n, hex: C[n] }))

const SAREE_SIZES = ['১২ হাত', '১৩ হাত']
const DRESS_SIZES = ['এস', 'এম', 'এল', 'এক্সএল', 'ডাবল এক্সএল']

const CATEGORIES = [
  {
    slug: 'jamdani',
    name: 'জামদানি শাড়ি',
    image: '/seed/cat-jamdani.svg',
    description:
      'ঢাকাই জামদানি — তাঁতির হাতে বোনা নকশা, যার প্রতিটি সুতোয় লেগে আছে শত বছরের ঐতিহ্য।',
    sortOrder: 1,
  },
  {
    slug: 'katan',
    name: 'কাতান শাড়ি',
    image: '/seed/cat-katan.svg',
    description: 'বিয়ে ও উৎসবের জন্য জমকালো কাতান, সোনালি জরির কাজে ভরা।',
    sortOrder: 2,
  },
  {
    slug: 'tant',
    name: 'টাঙ্গাইল তাঁত',
    image: '/seed/cat-tant.svg',
    description: 'হালকা, আরামদায়ক আর রোজকার পরার জন্য নিখুঁত টাঙ্গাইলের তাঁতের শাড়ি।',
    sortOrder: 3,
  },
  {
    slug: 'silk',
    name: 'সিল্ক শাড়ি',
    image: '/seed/cat-silk.svg',
    description: 'রাজশাহী সিল্ক ও মসলিনের কোমল ছোঁয়া, অনুষ্ঠানের জন্য আদর্শ।',
    sortOrder: 4,
  },
  {
    slug: 'cotton',
    name: 'সুতি শাড়ি',
    image: '/seed/cat-cotton.svg',
    description: 'গরমের দিনে স্বস্তির নাম — খাঁটি সুতির শাড়ি।',
    sortOrder: 5,
  },
  {
    slug: 'three-piece',
    name: 'থ্রি-পিস',
    image: '/seed/cat-threepiece.svg',
    description: 'সালোয়ার-কামিজ ও ওড়নার সম্পূর্ণ সেট, অফিস থেকে দাওয়াত সব জায়গায়।',
    sortOrder: 6,
  },
  {
    slug: 'kurti',
    name: 'কুর্তি ও কামিজ',
    image: '/seed/cat-kurti.svg',
    description: 'আরামদায়ক কুর্তি, রোজকার ব্যবহারে ফ্যাশনের ছোঁয়া।',
    sortOrder: 7,
  },
  {
    slug: 'orna',
    name: 'ওড়না ও স্কার্ফ',
    image: '/seed/cat-orna.svg',
    description: 'পোশাকের সাথে মানানসই ওড়না, দোপাট্টা ও স্কার্ফ।',
    sortOrder: 8,
  },
]

type SeedProduct = {
  name: string
  slug: string
  category: string
  price: number
  comparePrice?: number
  stock: number
  fabric: string
  shortDesc: string
  description: string
  images: string[]
  sizes: string[]
  colors: { name: string; hex: string }[]
  isFeatured?: boolean
  soldCount?: number
}

const img = (...names: string[]) => names.map((n) => `/seed/${n}.svg`)

const PRODUCTS: SeedProduct[] = [
  // ---------------- জামদানি ----------------
  {
    name: 'ঢাকাই জামদানি — হীরা নকশা',
    slug: 'dhakai-jamdani-hira-noksha',
    category: 'jamdani',
    price: 8500,
    comparePrice: 11000,
    stock: 12,
    fabric: 'খাঁটি সুতি জামদানি',
    shortDesc: 'হাতে বোনা হীরার নকশা, চওড়া জরির পাড়।',
    description:
      'রূপগঞ্জের তাঁতির হাতে প্রায় দুই সপ্তাহ ধরে বোনা এই জামদানিটি। অফ-হোয়াইট জমিনে সরু লাল পাড়, আর সারা শাড়িজুড়ে ছড়ানো ছোট ছোট হীরার মোটিফ। হালকা ওজনের হওয়ায় সারাদিন পরে থাকলেও আরাম লাগবে।\n\nসাথে থাকছে ম্যাচিং ব্লাউজ পিস। প্রথমবার ধোয়ার আগে ড্রাই ওয়াশ করানোর পরামর্শ দিচ্ছি।',
    images: img('fabric-dhakai-diamond', 'fabric-jamdani-diamond', 'fabric-jamdani-floral'),
    sizes: SAREE_SIZES,
    colors: color('অফ হোয়াইট', 'লাল'),
    isFeatured: true,
    soldCount: 42,
  },
  {
    name: 'জামদানি — কলকা পাড়',
    slug: 'jamdani-kolka-par',
    category: 'jamdani',
    price: 9800,
    comparePrice: 12500,
    stock: 7,
    fabric: 'সুতি-সিল্ক জামদানি',
    shortDesc: 'আঁচলজুড়ে বড় কলকা, উৎসবের জন্য।',
    description:
      'সুতি ও সিল্কের মিশেলে বোনা জামদানি, তাই জমিনটা একটু চকচকে। আঁচলে বড় কলকা মোটিফ আর দুই পাশে সরু জরির পাড়। বিয়ের অনুষ্ঠান বা ঈদের দাওয়াতের জন্য চমৎকার মানাবে।',
    images: img('fabric-jamdani-paisley', 'fabric-dhakai-paisley'),
    sizes: SAREE_SIZES,
    colors: color('মেরুন', 'সোনালি'),
    isFeatured: true,
    soldCount: 28,
  },
  {
    name: 'হাফ সিল্ক জামদানি',
    slug: 'half-silk-jamdani',
    category: 'jamdani',
    price: 6200,
    comparePrice: 7500,
    stock: 18,
    fabric: 'হাফ সিল্ক',
    shortDesc: 'দামে সাশ্রয়ী, দেখতে অভিজাত।',
    description:
      'যারা জামদানির নকশা ভালোবাসেন কিন্তু বাজেট একটু কম রাখতে চান, তাদের জন্য হাফ সিল্ক জামদানি। জমিন হালকা, পাড় গাঢ়, আর নকশা স্পষ্ট।',
    images: img('fabric-jamdani-zari', 'fabric-mustard-diamond'),
    sizes: SAREE_SIZES,
    colors: color('হলুদ', 'সবুজ', 'ফিরোজা'),
    soldCount: 55,
  },

  // ---------------- কাতান ----------------
  {
    name: 'বেনারসি কাতান — বধূ সংগ্রহ',
    slug: 'benarasi-katan-bodhu',
    category: 'katan',
    price: 15500,
    comparePrice: 19000,
    stock: 5,
    fabric: 'বেনারসি কাতান',
    shortDesc: 'বিয়ের দিনের জন্য ভারী জরির কাজ।',
    description:
      'টকটকে লাল জমিনে সারা শাড়িজুড়ে সোনালি জরির বুটি, আর আঁচলে ভারী নকশা। বিয়ের দিনের জন্য বিশেষভাবে বাছাই করা। ওজন একটু বেশি, তবে পড়লে যে জৌলুস আসে তার তুলনা হয় না।\n\nসাথে ম্যাচিং ব্লাউজ পিস ও পেটিকোট কাপড় দেওয়া হচ্ছে।',
    images: img('fabric-katan-zari', 'fabric-katan-paisley', 'fabric-katan-floral'),
    sizes: SAREE_SIZES,
    colors: color('লাল', 'মেরুন'),
    isFeatured: true,
    soldCount: 19,
  },
  {
    name: 'কাতান শাড়ি — জরি বুটি',
    slug: 'katan-zari-buti',
    category: 'katan',
    price: 7800,
    comparePrice: 9500,
    stock: 14,
    fabric: 'কাতান',
    shortDesc: 'হালকা জরির বুটি, উৎসবে পরার মতো।',
    description:
      'মাঝারি ওজনের কাতান, সারা জমিনে ছোট ছোট জরির বুটি। গায়ে-হলুদ, জন্মদিন বা পারিবারিক অনুষ্ঠানে দারুণ মানাবে।',
    images: img('fabric-night-zari', 'fabric-katan-stripe'),
    sizes: SAREE_SIZES,
    colors: color('গাঢ় নীল', 'বেগুনি', 'কালো'),
    soldCount: 33,
  },
  {
    name: 'কাঞ্জিভরম স্টাইল কাতান',
    slug: 'kanjivaram-style-katan',
    category: 'katan',
    price: 11200,
    stock: 9,
    fabric: 'সিল্ক কাতান',
    shortDesc: 'চওড়া কন্ট্রাস্ট পাড়, দক্ষিণী ঢঙ।',
    description:
      'দক্ষিণ ভারতীয় কাঞ্জিভরমের ধাঁচে বোনা কাতান। জমিন এক রঙ, পাড় সম্পূর্ণ আলাদা রঙের — এই কন্ট্রাস্টই শাড়িটির প্রাণ।',
    images: img('fabric-emerald-zari', 'fabric-emerald-floral'),
    sizes: SAREE_SIZES,
    colors: color('সবুজ', 'কমলা'),
    soldCount: 21,
  },

  // ---------------- টাঙ্গাইল তাঁত ----------------
  {
    name: 'টাঙ্গাইল তাঁত — ডুরে পাড়',
    slug: 'tangail-tant-dure-par',
    category: 'tant',
    price: 2200,
    comparePrice: 2800,
    stock: 30,
    fabric: 'খাঁটি সুতি তাঁত',
    shortDesc: 'রোজকার পরার জন্য হালকা ও আরামদায়ক।',
    description:
      'টাঙ্গাইলের তাঁতিদের হাতে বোনা খাঁটি সুতির শাড়ি। জমিনে সরু ডুরে, পাড়ে কন্ট্রাস্ট রঙ। গরমের দিনে বা অফিসে পরার জন্য এর চেয়ে ভালো কিছু হয় না।',
    images: img('fabric-tant-check', 'fabric-tant-stripe', 'fabric-cotton-stripe'),
    sizes: SAREE_SIZES,
    colors: color('সবুজ', 'লাল', 'গাঢ় নীল', 'হলুদ'),
    isFeatured: true,
    soldCount: 87,
  },
  {
    name: 'তাঁতের শাড়ি — চেক নকশা',
    slug: 'tanter-saree-check',
    category: 'tant',
    price: 1850,
    comparePrice: 2400,
    stock: 42,
    fabric: 'সুতি তাঁত',
    shortDesc: 'ছোট ছোট চেক, দুই রঙের মিশেল।',
    description:
      'হালকা ওজনের তাঁতের শাড়ি, সারা জমিনে ছোট চেকের নকশা। ধোয়ার পর রঙ যাওয়ার ভয় নেই — কাপড় আগেই ওয়াশ করা।',
    images: img('fabric-tant-check', 'fabric-teal-check'),
    sizes: SAREE_SIZES,
    colors: color('ফিরোজা', 'গোলাপি', 'কমলা'),
    soldCount: 64,
  },
  {
    name: 'তাঁতের শাড়ি — মিনিমাল',
    slug: 'tanter-saree-minimal',
    category: 'tant',
    price: 1650,
    stock: 36,
    fabric: 'সুতি তাঁত',
    shortDesc: 'এক রঙা জমিন, সরু পাড়।',
    description:
      'যারা সাদামাটা কিন্তু রুচিশীল পোশাক পছন্দ করেন — এক রঙা জমিন আর সরু কন্ট্রাস্ট পাড়ের এই শাড়িটি তাদের জন্য।',
    images: img('fabric-cotton-stripe', 'fabric-indigo-stripe'),
    sizes: SAREE_SIZES,
    colors: color('অফ হোয়াইট', 'কালো', 'ফিরোজা'),
    soldCount: 48,
  },

  // ---------------- সিল্ক ----------------
  {
    name: 'রাজশাহী সিল্ক — ফুলেল নকশা',
    slug: 'rajshahi-silk-floral',
    category: 'silk',
    price: 5600,
    comparePrice: 7000,
    stock: 16,
    fabric: 'রাজশাহী সিল্ক',
    shortDesc: 'হাতে আঁকা ফুলের নকশা, কোমল জমিন।',
    description:
      'রাজশাহীর খাঁটি সিল্কের উপর হাতে আঁকা ফুলের নকশা। কাপড় এতটাই নরম যে গায়ে জড়ালে আলাদা করে বোঝা যায় না। অনুষ্ঠান কিংবা অফিস — দুই জায়গাতেই মানানসই।',
    images: img('fabric-silk-floral', 'fabric-silk-paisley', 'fabric-rose-floral'),
    sizes: SAREE_SIZES,
    colors: color('বেগুনি', 'গোলাপি', 'অফ হোয়াইট'),
    isFeatured: true,
    soldCount: 39,
  },
  {
    name: 'মসলিন সিল্ক শাড়ি',
    slug: 'muslin-silk-saree',
    category: 'silk',
    price: 7400,
    stock: 11,
    fabric: 'মসলিন সিল্ক',
    shortDesc: 'পাতলা, স্বচ্ছ আর অসম্ভব হালকা।',
    description:
      'মসলিনের ঐতিহ্য ফিরিয়ে আনার চেষ্টা। কাপড় এত পাতলা যে আংটির ভেতর দিয়ে গলে যায় বলে যে গল্প শোনা যায় — এই শাড়ি হাতে নিলে সেটা বিশ্বাস করতে ইচ্ছে হবে।',
    images: img('fabric-silk-diamond', 'fabric-jamdani-diamond'),
    sizes: SAREE_SIZES,
    colors: color('অফ হোয়াইট', 'সোনালি'),
    soldCount: 17,
  },
  {
    name: 'সিল্ক শাড়ি — কলকা আঁচল',
    slug: 'silk-kolka-anchal',
    category: 'silk',
    price: 4900,
    comparePrice: 6200,
    stock: 22,
    fabric: 'আর্ট সিল্ক',
    shortDesc: 'আঁচলে বড় কলকা, দামে সাশ্রয়ী।',
    description:
      'আর্ট সিল্কের শাড়ি, দেখতে খাঁটি সিল্কের মতোই। আঁচলে বড় কলকার নকশা আর সারা জমিনে ছোট বুটি।',
    images: img('fabric-silk-paisley', 'fabric-indigo-paisley'),
    sizes: SAREE_SIZES,
    colors: color('গাঢ় নীল', 'মেরুন', 'সবুজ'),
    soldCount: 44,
  },

  // ---------------- সুতি ----------------
  {
    name: 'ব্লক প্রিন্ট সুতি শাড়ি',
    slug: 'block-print-cotton-saree',
    category: 'cotton',
    price: 1450,
    comparePrice: 1900,
    stock: 50,
    fabric: 'খাঁটি সুতি',
    shortDesc: 'হাতে ছাপানো ব্লক প্রিন্ট।',
    description:
      'কাঠের ব্লকে হাতে ছাপানো নকশা, তাই প্রতিটি শাড়ির ছাপ একটু আলাদা — এটাই এর সৌন্দর্য। গরমে পরার জন্য সবচেয়ে আরামদায়ক।',
    images: img('fabric-cotton-floral', 'fabric-rose-floral'),
    sizes: SAREE_SIZES,
    colors: color('অফ হোয়াইট', 'হলুদ', 'ফিরোজা'),
    soldCount: 96,
  },
  {
    name: 'সুতি শাড়ি — হ্যান্ড পেইন্ট',
    slug: 'cotton-hand-paint-saree',
    category: 'cotton',
    price: 2100,
    stock: 24,
    fabric: 'খাঁটি সুতি',
    shortDesc: 'শিল্পীর হাতে আঁকা আঁচল।',
    description:
      'আঁচলে শিল্পীর হাতে আঁকা নকশা, কাপড়ের রঙ পাকা। ধোয়ার সময় উল্টো করে ধুলে রঙ অনেকদিন থাকবে।',
    images: img('fabric-teal-floral', 'fabric-emerald-floral'),
    sizes: SAREE_SIZES,
    colors: color('সবুজ', 'ফিরোজা'),
    soldCount: 31,
  },

  // ---------------- থ্রি-পিস ----------------
  {
    name: 'আনস্টিচড থ্রি-পিস — এমব্রয়ডারি',
    slug: 'unstitched-three-piece-embroidery',
    category: 'three-piece',
    price: 2950,
    comparePrice: 3800,
    stock: 28,
    fabric: 'কটন লিনেন',
    shortDesc: 'কামিজ, সালোয়ার ও ওড়নার পূর্ণ সেট।',
    description:
      'গলা ও হাতায় সূক্ষ্ম এমব্রয়ডারির কাজ। কাপড় আনস্টিচড, তাই নিজের মাপে বানিয়ে নিতে পারবেন।\n\nসেটে থাকছে — কামিজের কাপড় ২.৫ গজ, সালোয়ার ২.৫ গজ, ওড়না ২.৫ গজ।',
    images: img('fabric-rose-floral', 'fabric-mustard-floral', 'fabric-emerald-floral'),
    sizes: ['আনস্টিচড'],
    colors: color('গোলাপি', 'হলুদ', 'সবুজ', 'গাঢ় নীল'),
    isFeatured: true,
    soldCount: 73,
  },
  {
    name: 'সেলাই করা থ্রি-পিস — ডেইলি ওয়্যার',
    slug: 'stitched-three-piece-daily',
    category: 'three-piece',
    price: 1850,
    comparePrice: 2400,
    stock: 35,
    fabric: 'সুতি',
    shortDesc: 'রেডিমেড, পরেই বেরিয়ে পড়ুন।',
    description:
      'সেলাই করা রেডিমেড থ্রি-পিস, অফিস বা ক্লাসের জন্য আরামদায়ক। সাইজ চার্ট দেখে অর্ডার করবেন।',
    images: img('fabric-cotton-floral', 'fabric-indigo-floral'),
    sizes: DRESS_SIZES,
    colors: color('গাঢ় নীল', 'কালো', 'ফিরোজা', 'মেরুন'),
    soldCount: 58,
  },
  {
    name: 'পার্টি থ্রি-পিস — জর্জেট',
    slug: 'party-three-piece-georgette',
    category: 'three-piece',
    price: 4200,
    comparePrice: 5500,
    stock: 15,
    fabric: 'জর্জেট',
    shortDesc: 'দাওয়াত ও উৎসবের জন্য জমকালো।',
    description:
      'জর্জেটের উপর স্টোন ও জরির কাজ। ওড়নায় ভারী পাড়। বিয়ের দাওয়াত বা ঈদের জন্য বেছে নিতে পারেন।',
    images: img('fabric-night-floral', 'fabric-silk-floral'),
    sizes: DRESS_SIZES,
    colors: color('কালো', 'বেগুনি', 'মেরুন'),
    soldCount: 26,
  },

  // ---------------- কুর্তি ----------------
  {
    name: 'সুতি কুর্তি — প্রিন্টেড',
    slug: 'cotton-kurti-printed',
    category: 'kurti',
    price: 1150,
    comparePrice: 1500,
    stock: 45,
    fabric: 'সুতি',
    shortDesc: 'হালকা ও আরামদায়ক রোজকার কুর্তি।',
    description:
      'সুতির প্রিন্টেড কুর্তি, সাইড স্লিট দেওয়া। জিন্স বা পালাজ্জোর সাথে দারুণ মানায়।',
    images: img('fabric-cotton-floral', 'fabric-teal-floral'),
    sizes: DRESS_SIZES,
    colors: color('ফিরোজা', 'হলুদ', 'গোলাপি', 'অফ হোয়াইট'),
    soldCount: 112,
  },
  {
    name: 'এমব্রয়ডারি কুর্তি — লিনেন',
    slug: 'embroidery-kurti-linen',
    category: 'kurti',
    price: 1650,
    stock: 32,
    fabric: 'লিনেন',
    shortDesc: 'গলায় হাতের কাজ, লিনেন কাপড়।',
    description:
      'লিনেন কাপড়ের কুর্তি, গলায় সূক্ষ্ম হাতের এমব্রয়ডারি। কাপড় নিঃশ্বাস নেয়, তাই সারাদিন পরে থাকা যায়।',
    images: img('fabric-emerald-floral', 'fabric-indigo-floral'),
    sizes: DRESS_SIZES,
    colors: color('সবুজ', 'গাঢ় নীল', 'অফ হোয়াইট'),
    isFeatured: true,
    soldCount: 67,
  },

  // ---------------- ওড়না ----------------
  {
    name: 'জর্জেট ওড়না — সিকুইন',
    slug: 'georgette-orna-sequin',
    category: 'orna',
    price: 750,
    comparePrice: 1000,
    stock: 60,
    fabric: 'জর্জেট',
    shortDesc: 'হালকা ওড়না, চিকচিকে সিকুইনের কাজ।',
    description:
      'যেকোনো সাদামাটা কামিজকে উৎসবের সাজে বদলে দিতে পারে এই ওড়না। চারপাশে সরু জরির পাড়।',
    images: img('fabric-rose-floral', 'fabric-mustard-zari'),
    sizes: ['ফ্রি সাইজ'],
    colors: color('গোলাপি', 'সোনালি', 'কালো', 'লাল'),
    soldCount: 84,
  },
  {
    name: 'সুতি ওড়না — ব্লক প্রিন্ট',
    slug: 'cotton-orna-block-print',
    category: 'orna',
    price: 480,
    stock: 70,
    fabric: 'সুতি',
    shortDesc: 'হাতে ছাপানো সুতির ওড়না।',
    description: 'খাঁটি সুতির ওড়না, হাতে ব্লক প্রিন্ট করা। রোজকার ব্যবহারের জন্য।',
    images: img('fabric-indigo-diamond', 'fabric-teal-check'),
    sizes: ['ফ্রি সাইজ'],
    colors: color('গাঢ় নীল', 'ফিরোজা', 'মেরুন'),
    soldCount: 53,
  },
]

const BANNERS = [
  {
    title: 'বিয়ের মৌসুমের নতুন সংগ্রহ',
    subtitle: 'বেনারসি ও কাতানে ৩০% পর্যন্ত ছাড় — সীমিত সময়ের জন্য',
    image: '/seed/banner-1.svg',
    link: '/category/katan',
    buttonText: 'সংগ্রহ দেখুন',
    sortOrder: 1,
  },
  {
    title: 'ঢাকাই জামদানি, সরাসরি তাঁতির কাছ থেকে',
    subtitle: 'মাঝখানে কেউ নেই — তাই দাম কম, মান আসল',
    image: '/seed/banner-2.svg',
    link: '/category/jamdani',
    buttonText: 'জামদানি দেখুন',
    sortOrder: 2,
  },
  {
    title: 'রোজকার আরাম, তাঁতের শাড়িতে',
    subtitle: '১৫০০ টাকা থেকে শুরু, সারা দেশে ডেলিভারি',
    image: '/seed/banner-3.svg',
    link: '/category/tant',
    buttonText: 'এখনই কিনুন',
    sortOrder: 3,
  },
]

const COUPONS = [
  {
    code: 'NOBOBORSHO',
    type: 'percent',
    value: 15,
    minOrder: 2000,
    maxDiscount: 1500,
    usageLimit: 500,
    isActive: true,
  },
  {
    code: 'PROTHOM100',
    type: 'fixed',
    value: 100,
    minOrder: 1000,
    usageLimit: 1000,
    isActive: true,
  },
  {
    code: 'EID25',
    type: 'percent',
    value: 25,
    minOrder: 5000,
    maxDiscount: 3000,
    usageLimit: 200,
    isActive: true,
  },
]

const REVIEWS = [
  { customerName: 'নাজনীন আক্তার', rating: 5, comment: 'কাপড়ের মান ছবিতে যেমন দেখেছি ঠিক তেমনই। দ্রুত ডেলিভারি পেয়েছি, ধন্যবাদ।' },
  { customerName: 'ফারজানা হক', rating: 5, comment: 'রঙটা খুব সুন্দর। বোনের বিয়েতে পরেছি, সবাই প্রশংসা করেছে।' },
  { customerName: 'সুমাইয়া ইসলাম', rating: 4, comment: 'ভালো জিনিস, তবে ডেলিভারি একদিন দেরি হয়েছিল।' },
  { customerName: 'রুবিনা পারভীন', rating: 5, comment: 'দাম অনুযায়ী মান অসাধারণ। আবার অর্ডার করব ইনশাআল্লাহ।' },
  { customerName: 'তানজিলা রহমান', rating: 5, comment: 'হাতে বোনা কাজটা সত্যিই নিখুঁত। খুব খুশি হয়েছি।' },
  { customerName: 'শারমিন সুলতানা', rating: 4, comment: 'কাপড় আরামদায়ক। সাইজটা ঠিকঠাক পেয়েছি।' },
]

async function main() {
  console.log('ছবি তৈরি হচ্ছে...')
  await generatePlaceholders()

  console.log('পুরোনো ডেটা মুছে ফেলা হচ্ছে...')
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.review.deleteMany()
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()
  await prisma.banner.deleteMany()
  await prisma.coupon.deleteMany()
  await prisma.message.deleteMany()
  await prisma.subscriber.deleteMany()

  // ---- অ্যাডমিন ----
  const adminEmail = (process.env.ADMIN_EMAIL ?? 'admin@sharighor.com').toLowerCase()
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'admin123'
  await prisma.admin.upsert({
    where: { email: adminEmail },
    update: { password: await bcrypt.hash(adminPassword, 10) },
    create: {
      name: 'দোকান মালিক',
      email: adminEmail,
      password: await bcrypt.hash(adminPassword, 10),
      role: 'OWNER',
    },
  })

  // ---- ক্যাটাগরি ----
  const categoryIds = new Map<string, string>()
  for (const c of CATEGORIES) {
    const created = await prisma.category.create({ data: c })
    categoryIds.set(c.slug, created.id)
  }
  console.log(`✔ ${CATEGORIES.length} টি ক্যাটাগরি`)

  // ---- পণ্য ----
  let created = 0
  for (const p of PRODUCTS) {
    const categoryId = categoryIds.get(p.category)
    if (!categoryId) continue
    const product = await prisma.product.create({
      data: {
        name: p.name,
        slug: p.slug,
        description: p.description,
        shortDesc: p.shortDesc,
        price: p.price,
        comparePrice: p.comparePrice ?? null,
        stock: p.stock,
        sku: `SG-${String(created + 1).padStart(4, '0')}`,
        images: JSON.stringify(p.images),
        sizes: JSON.stringify(p.sizes),
        colors: JSON.stringify(p.colors),
        fabric: p.fabric,
        isFeatured: p.isFeatured ?? false,
        soldCount: p.soldCount ?? 0,
        categoryId,
      },
    })
    created++

    // কিছু পণ্যে রিভিউ
    const reviewCount = (created % 3 === 0 ? 3 : created % 2 === 0 ? 2 : 1)
    for (let i = 0; i < reviewCount; i++) {
      const r = REVIEWS[(created + i) % REVIEWS.length]
      await prisma.review.create({
        data: { ...r, productId: product.id, isApproved: true },
      })
    }
  }
  console.log(`✔ ${created} টি পণ্য`)

  // ---- ব্যানার ও কুপন ----
  for (const b of BANNERS) await prisma.banner.create({ data: b })
  for (const c of COUPONS) await prisma.coupon.create({ data: c })
  console.log(`✔ ${BANNERS.length} টি ব্যানার, ${COUPONS.length} টি কুপন`)

  // ---- সেটিংস ----
  const { DEFAULT_SETTINGS } = await import('../src/lib/constants')
  for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
    await prisma.setting.upsert({
      where: { key },
      update: {},
      create: { key, value: String(value) },
    })
  }

  // ---- নমুনা অর্ডার ----
  const sampleProducts = await prisma.product.findMany({ take: 4 })
  const statuses = ['pending', 'confirmed', 'shipped', 'delivered']
  const buyers = [
    { name: 'রুমানা আক্তার', phone: '01712345678', division: 'ঢাকা', district: 'ঢাকা', address: 'বাড়ি ১২, রোড ৫, ধানমন্ডি' },
    { name: 'সাবিনা ইয়াসমিন', phone: '01823456789', division: 'চট্টগ্রাম', district: 'চট্টগ্রাম', address: 'জিইসি মোড়, পাঁচলাইশ' },
    { name: 'নুসরাত জাহান', phone: '01934567890', division: 'রাজশাহী', district: 'রাজশাহী', address: 'সাহেব বাজার, বোয়ালিয়া' },
    { name: 'মাহমুদা খাতুন', phone: '01645678901', division: 'খুলনা', district: 'যশোর', address: 'এমএম কলেজ রোড' },
  ]

  for (let i = 0; i < buyers.length; i++) {
    const b = buyers[i]
    const p = sampleProducts[i % sampleProducts.length]
    if (!p) break
    const qty = (i % 2) + 1
    const subtotal = p.price * qty
    const deliveryCharge = b.district === 'ঢাকা' ? 70 : 130
    const daysAgo = (buyers.length - i) * 2
    await prisma.order.create({
      data: {
        orderNo: `SG-260915-${1000 + i}`,
        customerName: b.name,
        phone: b.phone,
        division: b.division,
        district: b.district,
        address: b.address,
        subtotal,
        deliveryCharge,
        total: subtotal + deliveryCharge,
        paymentMethod: i % 2 === 0 ? 'cod' : 'bkash',
        paymentStatus: i % 2 === 0 ? 'unpaid' : 'paid',
        senderNumber: i % 2 === 0 ? null : '01711111111',
        transactionId: i % 2 === 0 ? null : `TRX${1000 + i}`,
        status: statuses[i % statuses.length],
        createdAt: new Date(Date.now() - daysAgo * 86400000),
        items: {
          create: [
            {
              productId: p.id,
              productName: p.name,
              productSlug: p.slug,
              productImage: JSON.parse(p.images)[0] ?? '',
              price: p.price,
              quantity: qty,
              size: JSON.parse(p.sizes)[0] ?? null,
              color: JSON.parse(p.colors)[0]?.name ?? null,
            },
          ],
        },
      },
    })
  }
  console.log(`✔ ${buyers.length} টি নমুনা অর্ডার`)

  console.log('\n────────────────────────────────')
  console.log('  অ্যাডমিন লগইন')
  console.log(`  ইমেইল   : ${adminEmail}`)
  console.log(`  পাসওয়ার্ড : ${adminPassword}`)
  console.log('────────────────────────────────\n')
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
