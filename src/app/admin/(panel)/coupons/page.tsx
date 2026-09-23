import { prisma } from '@/lib/prisma'
import { CouponManager } from '@/components/admin/CouponManager'

export const dynamic = 'force-dynamic'

export const metadata = { title: 'কুপন' }

export default async function AdminCouponsPage() {
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } })

  return (
    <CouponManager
      coupons={coupons.map((c) => ({
        id: c.id,
        code: c.code,
        type: c.type,
        value: c.value,
        minOrder: c.minOrder,
        maxDiscount: c.maxDiscount,
        usageLimit: c.usageLimit,
        usedCount: c.usedCount,
        expiresAt: c.expiresAt ? c.expiresAt.toISOString() : null,
        isActive: c.isActive,
      }))}
    />
  )
}
