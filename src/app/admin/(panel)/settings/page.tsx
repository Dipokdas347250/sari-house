import { getSettings } from '@/lib/settings'
import { SettingsForm } from '@/components/admin/SettingsForm'

export const dynamic = 'force-dynamic'

export const metadata = { title: 'সেটিংস' }

export default async function AdminSettingsPage() {
  const settings = await getSettings()

  return (
    <div>
      <header className="mb-5">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-brand-900">
          দোকানের সেটিংস
        </h2>
        <p className="mt-1 text-sm text-muted">
          এখানে যা বদলাবেন, তা সাথে সাথেই পুরো ওয়েবসাইটে দেখা যাবে।
        </p>
      </header>

      <SettingsForm settings={settings} />
    </div>
  )
}
