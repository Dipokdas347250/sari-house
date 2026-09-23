import { prisma } from '@/lib/prisma'
import { DEFAULT_SETTINGS } from '@/lib/constants'

export type SiteSettings = typeof DEFAULT_SETTINGS

/** ডাটাবেস থেকে সব সেটিংস, না থাকলে ডিফল্ট মান */
export async function getSettings(): Promise<SiteSettings> {
  const rows = await prisma.setting.findMany()
  const stored = Object.fromEntries(rows.map((r) => [r.key, r.value]))
  return { ...DEFAULT_SETTINGS, ...stored } as SiteSettings
}

export async function saveSettings(values: Partial<SiteSettings>): Promise<void> {
  const entries = Object.entries(values).filter(([, v]) => v !== undefined)
  await prisma.$transaction(
    entries.map(([key, value]) =>
      prisma.setting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      })
    )
  )
}

/** ডেলিভারি চার্জ হিসাব — ঢাকার ভেতরে/বাইরে ও ফ্রি ডেলিভারির সীমা */
export function calcDelivery(
  settings: SiteSettings,
  district: string,
  subtotal: number
): number {
  const freeAbove = Number(settings.freeDeliveryAbove) || 0
  if (freeAbove > 0 && subtotal >= freeAbove) return 0
  const inside = Number(settings.deliveryInsideDhaka) || 0
  const outside = Number(settings.deliveryOutsideDhaka) || 0
  return district === 'ঢাকা' ? inside : outside
}
