import { prisma } from '@/lib/prisma'
import { BannerManager } from '@/components/admin/BannerManager'

export const dynamic = 'force-dynamic'

export const metadata = { title: 'ব্যানার' }

export default async function AdminBannersPage() {
  const banners = await prisma.banner.findMany({
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
  })

  return (
    <BannerManager
      banners={banners.map((b) => ({
        id: b.id,
        title: b.title,
        subtitle: b.subtitle,
        image: b.image,
        link: b.link,
        buttonText: b.buttonText,
        sortOrder: b.sortOrder,
        isActive: b.isActive,
      }))}
    />
  )
}
