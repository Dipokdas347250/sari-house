'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getSettings, calcDelivery } from '@/lib/settings'
import { generateOrderNo, isValidPhone, normalizePhone, parseJsonArray } from '@/lib/utils'
import { DIVISIONS } from '@/lib/constants'

export type ActionResult<T = undefined> =
  | { ok: true; message: string; data?: T }
  | { ok: false; message: string; fieldErrors?: Record<string, string> }

/* ------------------------------------------------------------------ */
/*                          নিউজলেটার                                  */
/* ------------------------------------------------------------------ */

export async function subscribeNewsletter(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase()

  if (!z.string().email().safeParse(email).success) {
    return { ok: false, message: 'সঠিক ইমেইল ঠিকানা দিন।' }
  }

  const existing = await prisma.subscriber.findUnique({ where: { email } })
  if (existing) {
    return { ok: true, message: 'আপনি তো আগেই যুক্ত আছেন — ধন্যবাদ!' }
  }

  await prisma.subscriber.create({ data: { email } })
  return { ok: true, message: 'ধন্যবাদ! নতুন পণ্যের খবর আপনাকে জানানো হবে।' }
}

/* ------------------------------------------------------------------ */
/*                          যোগাযোগ ফর্ম                               */
/* ------------------------------------------------------------------ */

const messageSchema = z.object({
  name: z.string().trim().min(2, 'নাম লিখুন'),
  phone: z.string().trim().refine(isValidPhone, 'সঠিক মোবাইল নম্বর দিন (যেমন ০১৭১১১১১১১১)'),
  email: z.string().trim().email('সঠিক ইমেইল দিন').optional().or(z.literal('')),
  subject: z.string().trim().max(120).optional(),
  body: z.string().trim().min(5, 'আপনার বার্তাটি লিখুন'),
})

export async function sendMessage(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const parsed = messageSchema.safeParse({
    name: formData.get('name'),
    phone: formData.get('phone'),
    email: formData.get('email') ?? '',
    subject: formData.get('subject') ?? '',
    body: formData.get('body'),
  })

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      fieldErrors[String(issue.path[0])] = issue.message
    }
    return { ok: false, message: 'কিছু তথ্য ঠিক করতে হবে।', fieldErrors }
  }

  const d = parsed.data
  await prisma.message.create({
    data: {
      name: d.name,
      phone: normalizePhone(d.phone),
      email: d.email || null,
      subject: d.subject || '',
      body: d.body,
    },
  })

  return { ok: true, message: 'বার্তা পৌঁছে গেছে। আমরা শীঘ্রই যোগাযোগ করব।' }
}

/* ------------------------------------------------------------------ */
/*                             রিভিউ                                   */
/* ------------------------------------------------------------------ */

const reviewSchema = z.object({
  productId: z.string().min(1),
  customerName: z.string().trim().min(2, 'আপনার নাম লিখুন'),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().min(3, 'অন্তত কয়েকটি শব্দ লিখুন').max(1000),
})

export async function submitReview(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const parsed = reviewSchema.safeParse({
    productId: formData.get('productId'),
    customerName: formData.get('customerName'),
    rating: formData.get('rating'),
    comment: formData.get('comment'),
  })

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      fieldErrors[String(issue.path[0])] = issue.message
    }
    return { ok: false, message: 'কিছু তথ্য ঠিক করতে হবে।', fieldErrors }
  }

  const product = await prisma.product.findUnique({
    where: { id: parsed.data.productId },
    select: { slug: true },
  })
  if (!product) return { ok: false, message: 'পণ্যটি খুঁজে পাওয়া যায়নি।' }

  await prisma.review.create({ data: { ...parsed.data, isApproved: false } })
  revalidatePath(`/products/${product.slug}`)

  return {
    ok: true,
    message: 'মতামতের জন্য ধন্যবাদ! যাচাইয়ের পর এটি প্রকাশ করা হবে।',
  }
}

/* ------------------------------------------------------------------ */
/*                        পণ্য কতবার দেখা হলো                          */
/* ------------------------------------------------------------------ */

/**
 * পণ্যের পাতা খোলা হলে গণনা এক বাড়ায় — কোন পণ্য কতটা আগ্রহ টানছে
 * তা অ্যাডমিন প্যানেলে দেখা যায়।
 * ক্রেতার কাছে কিছু ফেরত দেওয়ার দরকার নেই, তাই ব্যর্থ হলেও চুপচাপ থাকে।
 */
export async function recordProductView(productId: string): Promise<void> {
  if (!productId) return
  try {
    await prisma.product.update({
      where: { id: productId },
      data: { viewCount: { increment: 1 } },
    })
  } catch {
    // পণ্যটি হয়তো মুছে ফেলা হয়েছে — গণনা না হলেও ক্ষতি নেই
  }
}

/* ------------------------------------------------------------------ */
/*                             কুপন                                    */
/* ------------------------------------------------------------------ */

export type CouponResult = {
  code: string
  discount: number
  label: string
}

export async function checkCoupon(
  code: string,
  subtotal: number
): Promise<ActionResult<CouponResult>> {
  const clean = code.trim().toUpperCase()
  if (!clean) return { ok: false, message: 'কুপন কোড লিখুন।' }

  const coupon = await prisma.coupon.findUnique({ where: { code: clean } })

  if (!coupon || !coupon.isActive) {
    return { ok: false, message: 'কুপন কোডটি সঠিক নয়।' }
  }
  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    return { ok: false, message: 'কুপনের মেয়াদ শেষ হয়ে গেছে।' }
  }
  if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit) {
    return { ok: false, message: 'এই কুপনটি আর ব্যবহার করা যাবে না।' }
  }
  if (subtotal < coupon.minOrder) {
    return {
      ok: false,
      message: `এই কুপন ব্যবহার করতে অন্তত ${coupon.minOrder} টাকার কেনাকাটা লাগবে।`,
    }
  }

  const discount = calcDiscount(coupon, subtotal)

  return {
    ok: true,
    message: 'কুপন প্রয়োগ হয়েছে!',
    data: {
      code: coupon.code,
      discount,
      label:
        coupon.type === 'percent'
          ? `${coupon.value}% ছাড়`
          : `${coupon.value} টাকা ছাড়`,
    },
  }
}

type CouponRow = {
  type: string
  value: number
  maxDiscount: number | null
}

function calcDiscount(coupon: CouponRow, subtotal: number): number {
  if (coupon.type === 'percent') {
    const raw = Math.floor((subtotal * coupon.value) / 100)
    return coupon.maxDiscount ? Math.min(raw, coupon.maxDiscount) : raw
  }
  return Math.min(coupon.value, subtotal)
}

/* ------------------------------------------------------------------ */
/*                            অর্ডার                                   */
/* ------------------------------------------------------------------ */

const orderItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.coerce.number().int().min(1).max(20),
  size: z.string().nullable().optional(),
  color: z.string().nullable().optional(),
})

const orderSchema = z.object({
  customerName: z.string().trim().min(2, 'আপনার পুরো নাম লিখুন'),
  phone: z.string().trim().refine(isValidPhone, 'সঠিক মোবাইল নম্বর দিন'),
  altPhone: z.string().trim().optional().or(z.literal('')),
  email: z.string().trim().email('সঠিক ইমেইল দিন').optional().or(z.literal('')),
  division: z.string().trim().min(1, 'বিভাগ নির্বাচন করুন'),
  district: z.string().trim().min(1, 'জেলা নির্বাচন করুন'),
  address: z.string().trim().min(8, 'বিস্তারিত ঠিকানা লিখুন (বাড়ি, রোড, এলাকা)'),
  note: z.string().trim().max(500).optional().or(z.literal('')),
  paymentMethod: z.enum(['cod', 'bkash', 'nagad']),
  senderNumber: z.string().trim().optional().or(z.literal('')),
  transactionId: z.string().trim().optional().or(z.literal('')),
  couponCode: z.string().trim().optional().or(z.literal('')),
  items: z.array(orderItemSchema).min(1, 'কার্টে কোনো পণ্য নেই'),
})

export type PlaceOrderInput = z.input<typeof orderSchema>

export async function placeOrder(
  input: PlaceOrderInput
): Promise<ActionResult<{ orderNo: string }>> {
  const parsed = orderSchema.safeParse(input)

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      fieldErrors[String(issue.path[0])] = issue.message
    }
    return { ok: false, message: 'কিছু তথ্য ঠিক করতে হবে।', fieldErrors }
  }

  const d = parsed.data

  // বিভাগ ও জেলা মিলছে কি না
  if (!DIVISIONS[d.division]?.includes(d.district)) {
    return {
      ok: false,
      message: 'বিভাগ ও জেলা মিলছে না।',
      fieldErrors: { district: 'এই বিভাগের জেলা নির্বাচন করুন' },
    }
  }

  // বিকাশ/নগদ হলে ট্রানজেকশন তথ্য বাধ্যতামূলক
  if (d.paymentMethod !== 'cod') {
    if (!d.senderNumber || !isValidPhone(d.senderNumber)) {
      return {
        ok: false,
        message: 'যে নম্বর থেকে টাকা পাঠিয়েছেন সেটি দিন।',
        fieldErrors: { senderNumber: 'সঠিক মোবাইল নম্বর দিন' },
      }
    }
    if (!d.transactionId || d.transactionId.length < 4) {
      return {
        ok: false,
        message: 'ট্রানজেকশন আইডি দিন।',
        fieldErrors: { transactionId: 'ট্রানজেকশন আইডি দিন' },
      }
    }
  }

  // দাম ও স্টক সার্ভার থেকেই যাচাই — ব্রাউজারের পাঠানো দাম বিশ্বাস করা হয় না
  const products = await prisma.product.findMany({
    where: { id: { in: d.items.map((i) => i.productId) }, isActive: true },
  })

  if (products.length === 0) {
    return { ok: false, message: 'পণ্যগুলো আর পাওয়া যাচ্ছে না।' }
  }

  const lines: {
    productId: string
    productName: string
    productSlug: string
    productImage: string
    price: number
    quantity: number
    size: string | null
    color: string | null
  }[] = []

  for (const item of d.items) {
    const p = products.find((x) => x.id === item.productId)
    if (!p) {
      return { ok: false, message: 'কার্টের একটি পণ্য আর নেই। কার্টটি আবার দেখে নিন।' }
    }
    if (p.stock < item.quantity) {
      return {
        ok: false,
        message: `"${p.name}" এর পর্যাপ্ত স্টক নেই (আছে ${p.stock} টি)।`,
      }
    }
    lines.push({
      productId: p.id,
      productName: p.name,
      productSlug: p.slug,
      productImage: parseJsonArray<string>(p.images)[0] ?? '',
      price: p.price,
      quantity: item.quantity,
      size: item.size || null,
      color: item.color || null,
    })
  }

  const subtotal = lines.reduce((sum, l) => sum + l.price * l.quantity, 0)

  // কুপন
  let discount = 0
  let couponCode: string | null = null
  if (d.couponCode) {
    const coupon = await prisma.coupon.findUnique({
      where: { code: d.couponCode.trim().toUpperCase() },
    })
    const usable =
      coupon &&
      coupon.isActive &&
      (!coupon.expiresAt || coupon.expiresAt >= new Date()) &&
      (coupon.usageLimit == null || coupon.usedCount < coupon.usageLimit) &&
      subtotal >= coupon.minOrder
    if (usable && coupon) {
      discount = calcDiscount(coupon, subtotal)
      couponCode = coupon.code
    }
  }

  const settings = await getSettings()
  const deliveryCharge = calcDelivery(settings, d.district, subtotal - discount)
  const total = subtotal - discount + deliveryCharge

  const orderNo = generateOrderNo()

  await prisma.$transaction(async (tx) => {
    await tx.order.create({
      data: {
        orderNo,
        customerName: d.customerName,
        phone: normalizePhone(d.phone),
        altPhone: d.altPhone ? normalizePhone(d.altPhone) : null,
        email: d.email || null,
        division: d.division,
        district: d.district,
        address: d.address,
        note: d.note || null,
        subtotal,
        discount,
        deliveryCharge,
        total,
        couponCode,
        paymentMethod: d.paymentMethod,
        senderNumber: d.senderNumber ? normalizePhone(d.senderNumber) : null,
        transactionId: d.transactionId || null,
        paymentStatus: 'unpaid',
        status: 'pending',
        items: { create: lines },
      },
    })

    for (const line of lines) {
      await tx.product.update({
        where: { id: line.productId },
        data: {
          stock: { decrement: line.quantity },
          soldCount: { increment: line.quantity },
        },
      })
    }

    if (couponCode) {
      await tx.coupon.update({
        where: { code: couponCode },
        data: { usedCount: { increment: 1 } },
      })
    }
  })

  revalidatePath('/products')
  revalidatePath('/admin/orders')

  return { ok: true, message: 'অর্ডার সফল হয়েছে!', data: { orderNo } }
}
