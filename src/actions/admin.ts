'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { authenticate, startSession, endSession, requireAdmin } from '@/lib/auth'
import { saveSettings } from '@/lib/settings'
import { makeSlug } from '@/lib/utils'
import { DEFAULT_SETTINGS } from '@/lib/constants'

export type AdminResult = {
  ok: boolean
  message: string
  fieldErrors?: Record<string, string>
}

function fieldErrorsFrom(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {}
  for (const issue of error.issues) out[String(issue.path[0])] = issue.message
  return out
}

/* ------------------------------------------------------------------ */
/*                              লগইন                                   */
/* ------------------------------------------------------------------ */

export async function adminLogin(
  _prev: AdminResult | null,
  formData: FormData
): Promise<AdminResult> {
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')

  if (!email || !password) {
    return { ok: false, message: 'ইমেইল ও পাসওয়ার্ড দুটোই দিন।' }
  }

  const session = await authenticate(email, password)
  if (!session) {
    return { ok: false, message: 'ইমেইল বা পাসওয়ার্ড মিলছে না।' }
  }

  await startSession(session)
  redirect('/admin')
}

export async function adminLogout() {
  await endSession()
  redirect('/admin/login')
}

/* ------------------------------------------------------------------ */
/*                              পণ্য                                   */
/* ------------------------------------------------------------------ */

const productSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(2, 'পণ্যের নাম লিখুন'),
  slug: z.string().trim().optional(),
  categoryId: z.string().min(1, 'ক্যাটাগরি নির্বাচন করুন'),
  price: z.coerce.number().int().min(1, 'দাম দিন'),
  comparePrice: z.coerce.number().int().min(0).optional().nullable(),
  stock: z.coerce.number().int().min(0, 'স্টক দিন'),
  sku: z.string().trim().optional(),
  fabric: z.string().trim().optional(),
  shortDesc: z.string().trim().max(300).optional(),
  description: z.string().trim().optional(),
  images: z.array(z.string()).default([]),
  sizes: z.array(z.string()).default([]),
  colors: z.array(z.object({ name: z.string(), hex: z.string() })).default([]),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
})

export type ProductInput = z.input<typeof productSchema>

export async function saveProduct(input: ProductInput): Promise<AdminResult> {
  await requireAdmin()

  const parsed = productSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, message: 'কিছু তথ্য ঠিক করতে হবে।', fieldErrors: fieldErrorsFrom(parsed.error) }
  }

  const d = parsed.data

  if (d.comparePrice && d.comparePrice > 0 && d.comparePrice <= d.price) {
    return {
      ok: false,
      message: 'কাটা দাম বিক্রয়মূল্যের চেয়ে বেশি হতে হবে।',
      fieldErrors: { comparePrice: 'বিক্রয়মূল্যের চেয়ে বেশি দিন' },
    }
  }

  // slug ইউনিক রাখা
  let slug = d.slug?.trim() || makeSlug(d.name)
  const clash = await prisma.product.findFirst({
    where: { slug, ...(d.id ? { NOT: { id: d.id } } : {}) },
    select: { id: true },
  })
  if (clash) slug = `${slug}-${Date.now().toString(36).slice(-4)}`

  const data = {
    name: d.name,
    slug,
    categoryId: d.categoryId,
    price: d.price,
    comparePrice: d.comparePrice && d.comparePrice > 0 ? d.comparePrice : null,
    stock: d.stock,
    sku: d.sku || null,
    fabric: d.fabric || null,
    shortDesc: d.shortDesc ?? '',
    description: d.description ?? '',
    images: JSON.stringify(d.images),
    sizes: JSON.stringify(d.sizes),
    colors: JSON.stringify(d.colors),
    isFeatured: d.isFeatured,
    isActive: d.isActive,
  }

  if (d.id) {
    await prisma.product.update({ where: { id: d.id }, data })
  } else {
    await prisma.product.create({ data })
  }

  revalidatePath('/admin/products')
  revalidatePath('/products')
  revalidatePath(`/products/${slug}`)
  revalidatePath('/')

  return { ok: true, message: d.id ? 'পণ্যটি হালনাগাদ হয়েছে।' : 'নতুন পণ্য যোগ হয়েছে।' }
}

export async function deleteProduct(id: string): Promise<AdminResult> {
  await requireAdmin()
  await prisma.product.delete({ where: { id } })
  revalidatePath('/admin/products')
  revalidatePath('/products')
  return { ok: true, message: 'পণ্যটি মুছে ফেলা হয়েছে।' }
}

export async function toggleProductField(
  id: string,
  field: 'isActive' | 'isFeatured'
): Promise<AdminResult> {
  await requireAdmin()
  const product = await prisma.product.findUnique({ where: { id } })
  if (!product) return { ok: false, message: 'পণ্যটি পাওয়া যায়নি।' }

  await prisma.product.update({
    where: { id },
    data: { [field]: !product[field] },
  })

  revalidatePath('/admin/products')
  revalidatePath('/products')
  revalidatePath('/')
  return { ok: true, message: 'হালনাগাদ হয়েছে।' }
}

export async function updateStock(id: string, stock: number): Promise<AdminResult> {
  await requireAdmin()
  if (!Number.isInteger(stock) || stock < 0) {
    return { ok: false, message: 'স্টক একটি পূর্ণ সংখ্যা হতে হবে।' }
  }
  await prisma.product.update({ where: { id }, data: { stock } })
  revalidatePath('/admin/products')
  return { ok: true, message: 'স্টক হালনাগাদ হয়েছে।' }
}

/* ------------------------------------------------------------------ */
/*                            ক্যাটাগরি                                */
/* ------------------------------------------------------------------ */

const categorySchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(2, 'ক্যাটাগরির নাম লিখুন'),
  slug: z.string().trim().optional(),
  description: z.string().trim().optional(),
  image: z.string().trim().optional(),
  sortOrder: z.coerce.number().int().default(0),
  isActive: z.boolean().default(true),
})

export type CategoryInput = z.input<typeof categorySchema>

export async function saveCategory(input: CategoryInput): Promise<AdminResult> {
  await requireAdmin()

  const parsed = categorySchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, message: 'কিছু তথ্য ঠিক করতে হবে।', fieldErrors: fieldErrorsFrom(parsed.error) }
  }

  const d = parsed.data
  let slug = d.slug?.trim() || makeSlug(d.name)
  const clash = await prisma.category.findFirst({
    where: { slug, ...(d.id ? { NOT: { id: d.id } } : {}) },
    select: { id: true },
  })
  if (clash) slug = `${slug}-${Date.now().toString(36).slice(-4)}`

  const data = {
    name: d.name,
    slug,
    description: d.description || null,
    image: d.image || null,
    sortOrder: d.sortOrder,
    isActive: d.isActive,
  }

  if (d.id) {
    await prisma.category.update({ where: { id: d.id }, data })
  } else {
    await prisma.category.create({ data })
  }

  revalidatePath('/admin/categories')
  revalidatePath('/')
  revalidatePath('/products')
  return { ok: true, message: d.id ? 'ক্যাটাগরি হালনাগাদ হয়েছে।' : 'নতুন ক্যাটাগরি যোগ হয়েছে।' }
}

export async function deleteCategory(id: string): Promise<AdminResult> {
  await requireAdmin()

  const count = await prisma.product.count({ where: { categoryId: id } })
  if (count > 0) {
    return {
      ok: false,
      message: `এই ক্যাটাগরিতে ${count} টি পণ্য আছে। আগে পণ্যগুলো সরিয়ে নিন।`,
    }
  }

  await prisma.category.delete({ where: { id } })
  revalidatePath('/admin/categories')
  revalidatePath('/')
  return { ok: true, message: 'ক্যাটাগরি মুছে ফেলা হয়েছে।' }
}

/* ------------------------------------------------------------------ */
/*                              অর্ডার                                 */
/* ------------------------------------------------------------------ */

const STATUSES = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
] as const

export async function updateOrderStatus(
  id: string,
  status: string
): Promise<AdminResult> {
  await requireAdmin()

  if (!STATUSES.includes(status as (typeof STATUSES)[number])) {
    return { ok: false, message: 'অবস্থাটি সঠিক নয়।' }
  }

  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  })
  if (!order) return { ok: false, message: 'অর্ডারটি পাওয়া যায়নি।' }

  // বাতিল করলে স্টক ফেরত যাবে
  const cancelling = status === 'cancelled' && order.status !== 'cancelled'
  const reviving = order.status === 'cancelled' && status !== 'cancelled'

  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id },
      data: {
        status,
        // ডেলিভারি হয়ে গেলে ক্যাশ অন ডেলিভারির টাকাও পরিশোধিত ধরা হয়
        ...(status === 'delivered' ? { paymentStatus: 'paid' } : {}),
      },
    })

    for (const item of order.items) {
      if (!item.productId) continue
      if (cancelling) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: { increment: item.quantity },
            soldCount: { decrement: item.quantity },
          },
        })
      } else if (reviving) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: { decrement: item.quantity },
            soldCount: { increment: item.quantity },
          },
        })
      }
    }
  })

  revalidatePath('/admin/orders')
  revalidatePath(`/admin/orders/${id}`)
  return { ok: true, message: 'অর্ডারের অবস্থা হালনাগাদ হয়েছে।' }
}

export async function updatePaymentStatus(
  id: string,
  paymentStatus: 'paid' | 'unpaid'
): Promise<AdminResult> {
  await requireAdmin()
  await prisma.order.update({ where: { id }, data: { paymentStatus } })
  revalidatePath('/admin/orders')
  revalidatePath(`/admin/orders/${id}`)
  return { ok: true, message: 'পেমেন্টের অবস্থা হালনাগাদ হয়েছে।' }
}

export async function deleteOrder(id: string): Promise<AdminResult> {
  await requireAdmin()
  await prisma.order.delete({ where: { id } })
  revalidatePath('/admin/orders')
  return { ok: true, message: 'অর্ডারটি মুছে ফেলা হয়েছে।' }
}

/* ------------------------------------------------------------------ */
/*                              কুপন                                   */
/* ------------------------------------------------------------------ */

const couponSchema = z.object({
  id: z.string().optional(),
  code: z.string().trim().min(3, 'কোড অন্তত ৩ অক্ষরের হতে হবে'),
  type: z.enum(['percent', 'fixed']),
  value: z.coerce.number().int().min(1, 'মান দিন'),
  minOrder: z.coerce.number().int().min(0).default(0),
  maxDiscount: z.coerce.number().int().min(0).optional().nullable(),
  usageLimit: z.coerce.number().int().min(0).optional().nullable(),
  expiresAt: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
})

export type CouponInput = z.input<typeof couponSchema>

export async function saveCoupon(input: CouponInput): Promise<AdminResult> {
  await requireAdmin()

  const parsed = couponSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, message: 'কিছু তথ্য ঠিক করতে হবে।', fieldErrors: fieldErrorsFrom(parsed.error) }
  }

  const d = parsed.data
  const code = d.code.toUpperCase()

  if (d.type === 'percent' && d.value > 90) {
    return {
      ok: false,
      message: 'শতকরা ছাড় ৯০% এর বেশি দেওয়া যাবে না।',
      fieldErrors: { value: 'সর্বোচ্চ ৯০%' },
    }
  }

  const clash = await prisma.coupon.findFirst({
    where: { code, ...(d.id ? { NOT: { id: d.id } } : {}) },
    select: { id: true },
  })
  if (clash) {
    return {
      ok: false,
      message: 'এই কোডটি আগে থেকেই আছে।',
      fieldErrors: { code: 'অন্য একটি কোড দিন' },
    }
  }

  const data = {
    code,
    type: d.type,
    value: d.value,
    minOrder: d.minOrder,
    maxDiscount: d.maxDiscount && d.maxDiscount > 0 ? d.maxDiscount : null,
    usageLimit: d.usageLimit && d.usageLimit > 0 ? d.usageLimit : null,
    expiresAt: d.expiresAt ? new Date(d.expiresAt) : null,
    isActive: d.isActive,
  }

  if (d.id) {
    await prisma.coupon.update({ where: { id: d.id }, data })
  } else {
    await prisma.coupon.create({ data })
  }

  revalidatePath('/admin/coupons')
  return { ok: true, message: d.id ? 'কুপন হালনাগাদ হয়েছে।' : 'নতুন কুপন তৈরি হয়েছে।' }
}

export async function deleteCoupon(id: string): Promise<AdminResult> {
  await requireAdmin()
  await prisma.coupon.delete({ where: { id } })
  revalidatePath('/admin/coupons')
  return { ok: true, message: 'কুপনটি মুছে ফেলা হয়েছে।' }
}

/* ------------------------------------------------------------------ */
/*                              ব্যানার                                */
/* ------------------------------------------------------------------ */

const bannerSchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(2, 'শিরোনাম লিখুন'),
  subtitle: z.string().trim().optional(),
  image: z.string().trim().min(1, 'ছবি যোগ করুন'),
  link: z.string().trim().optional(),
  buttonText: z.string().trim().optional(),
  sortOrder: z.coerce.number().int().default(0),
  isActive: z.boolean().default(true),
})

export type BannerInput = z.input<typeof bannerSchema>

export async function saveBanner(input: BannerInput): Promise<AdminResult> {
  await requireAdmin()

  const parsed = bannerSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, message: 'কিছু তথ্য ঠিক করতে হবে।', fieldErrors: fieldErrorsFrom(parsed.error) }
  }

  const d = parsed.data
  const data = {
    title: d.title,
    subtitle: d.subtitle ?? '',
    image: d.image,
    link: d.link || '/products',
    buttonText: d.buttonText || 'কিনতে চাই',
    sortOrder: d.sortOrder,
    isActive: d.isActive,
  }

  if (d.id) {
    await prisma.banner.update({ where: { id: d.id }, data })
  } else {
    await prisma.banner.create({ data })
  }

  revalidatePath('/admin/banners')
  revalidatePath('/')
  return { ok: true, message: d.id ? 'ব্যানার হালনাগাদ হয়েছে।' : 'নতুন ব্যানার যোগ হয়েছে।' }
}

export async function deleteBanner(id: string): Promise<AdminResult> {
  await requireAdmin()
  await prisma.banner.delete({ where: { id } })
  revalidatePath('/admin/banners')
  revalidatePath('/')
  return { ok: true, message: 'ব্যানারটি মুছে ফেলা হয়েছে।' }
}

/* ------------------------------------------------------------------ */
/*                              রিভিউ                                  */
/* ------------------------------------------------------------------ */

export async function setReviewApproval(
  id: string,
  isApproved: boolean
): Promise<AdminResult> {
  await requireAdmin()
  const review = await prisma.review.update({
    where: { id },
    data: { isApproved },
    include: { product: { select: { slug: true } } },
  })
  revalidatePath('/admin/reviews')
  revalidatePath(`/products/${review.product.slug}`)
  revalidatePath('/')
  return {
    ok: true,
    message: isApproved ? 'রিভিউটি প্রকাশ করা হয়েছে।' : 'রিভিউটি লুকানো হয়েছে।',
  }
}

export async function deleteReview(id: string): Promise<AdminResult> {
  await requireAdmin()
  await prisma.review.delete({ where: { id } })
  revalidatePath('/admin/reviews')
  return { ok: true, message: 'রিভিউটি মুছে ফেলা হয়েছে।' }
}

/* ------------------------------------------------------------------ */
/*                              বার্তা                                 */
/* ------------------------------------------------------------------ */

export async function setMessageRead(id: string, isRead: boolean): Promise<AdminResult> {
  await requireAdmin()
  await prisma.message.update({ where: { id }, data: { isRead } })
  revalidatePath('/admin/messages')
  return { ok: true, message: isRead ? 'পঠিত হিসেবে চিহ্নিত।' : 'অপঠিত হিসেবে চিহ্নিত।' }
}

export async function deleteMessage(id: string): Promise<AdminResult> {
  await requireAdmin()
  await prisma.message.delete({ where: { id } })
  revalidatePath('/admin/messages')
  return { ok: true, message: 'বার্তাটি মুছে ফেলা হয়েছে।' }
}

/* ------------------------------------------------------------------ */
/*                          সাবস্ক্রাইবার                              */
/* ------------------------------------------------------------------ */

export async function deleteSubscriber(id: string): Promise<AdminResult> {
  await requireAdmin()
  await prisma.subscriber.delete({ where: { id } })
  revalidatePath('/admin/subscribers')
  return { ok: true, message: 'সাবস্ক্রাইবারটি তালিকা থেকে সরানো হয়েছে।' }
}

/* ------------------------------------------------------------------ */
/*                              সেটিংস                                 */
/* ------------------------------------------------------------------ */

export async function updateSettings(
  _prev: AdminResult | null,
  formData: FormData
): Promise<AdminResult> {
  await requireAdmin()

  const values: Record<string, string> = {}
  for (const key of Object.keys(DEFAULT_SETTINGS)) {
    const value = formData.get(key)
    if (value != null) values[key] = String(value)
  }

  await saveSettings(values)

  revalidatePath('/', 'layout')
  return { ok: true, message: 'সেটিংস সংরক্ষিত হয়েছে।' }
}
