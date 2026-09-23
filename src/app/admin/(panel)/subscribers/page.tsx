import { Download, Search, Trash2, Users, Mail } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { ConfirmAction } from '@/components/admin/ActionButton'
import { deleteSubscriber } from '@/actions/admin'
import { Pagination } from '@/components/shop/Pagination'
import { EmptyState } from '@/components/ui/kit'
import { toBn, formatDate, timeAgo } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export const metadata = { title: 'সাবস্ক্রাইবার' }

type SearchParams = Record<string, string | string[] | undefined>
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)

const PER_PAGE = 40

export default async function AdminSubscribersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const sp = await searchParams
  const search = one(sp.q)?.trim()
  const page = Math.max(1, Number(one(sp.page) ?? 1) || 1)

  const where = search ? { email: { contains: search.toLowerCase() } } : {}

  const monthAgo = new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000)

  const [subscribers, total, allTime, recent] = await Promise.all([
    prisma.subscriber.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
    }),
    prisma.subscriber.count({ where }),
    prisma.subscriber.count(),
    prisma.subscriber.count({ where: { createdAt: { gte: monthAgo } } }),
  ])

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE))

  return (
    <div className="space-y-5">
      {/* উপরের সারি */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <p className="rounded-full bg-white px-4 py-2 text-sm text-muted">
            মোট <strong className="text-ink">{toBn(allTime)}</strong> জন
          </p>
          <p className="rounded-full bg-white px-4 py-2 text-sm text-muted">
            গত ৩০ দিনে <strong className="text-ink">{toBn(recent)}</strong> জন
          </p>
        </div>

        {allTime > 0 && (
          <a
            href="/api/subscribers"
            download
            className="flex items-center gap-2 rounded-full bg-brand-700 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-800"
          >
            <Download size={16} />
            CSV নামান
          </a>
        )}
      </div>

      {/* খোঁজা */}
      <form
        method="get"
        className="flex gap-3 rounded-2xl border border-brand-100 bg-white p-4"
      >
        <div className="relative flex-1">
          <Search
            size={16}
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted"
          />
          <input
            type="search"
            name="q"
            defaultValue={search ?? ''}
            placeholder="ইমেইল দিয়ে খুঁজুন"
            aria-label="ইমেইল দিয়ে খুঁজুন"
            className="w-full rounded-xl border border-brand-200 py-2.5 pr-3 pl-9 text-sm"
          />
        </div>
        <button
          type="submit"
          className="rounded-xl bg-brand-700 px-5 text-sm font-medium text-white transition-colors hover:bg-brand-800"
        >
          খুঁজুন
        </button>
      </form>

      {subscribers.length === 0 ? (
        <EmptyState
          icon={<Users size={44} />}
          title={search ? 'কিছু পাওয়া যায়নি' : 'এখনো কেউ যুক্ত হয়নি'}
          description={
            search
              ? 'অন্য কোনো ইমেইল দিয়ে খুঁজে দেখুন।'
              : 'ফুটারের নিউজলেটার ফর্ম থেকে কেউ যুক্ত হলে এখানে দেখা যাবে।'
          }
        />
      ) : (
        <>
          <div className="overflow-hidden rounded-2xl border border-brand-100 bg-white">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[34rem] text-sm">
                <thead>
                  <tr className="border-b border-brand-100 bg-cream-50 text-left text-xs text-muted">
                    <th scope="col" className="px-4 py-3 font-medium">ইমেইল</th>
                    <th scope="col" className="px-4 py-3 font-medium">যুক্ত হয়েছেন</th>
                    <th scope="col" className="px-4 py-3 text-right font-medium">কাজ</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-brand-50">
                  {subscribers.map((s) => (
                    <tr key={s.id} className="hover:bg-cream-50">
                      <td className="px-4 py-3">
                        <a
                          href={`mailto:${s.email}`}
                          className="flex items-center gap-2 font-medium text-ink hover:text-brand-700"
                        >
                          <Mail size={14} className="shrink-0 text-brand-400" />
                          <span className="break-all">{s.email}</span>
                        </a>
                      </td>

                      <td className="px-4 py-3 text-muted">
                        {formatDate(s.createdAt)}
                        <span className="block text-xs">{timeAgo(s.createdAt)}</span>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex justify-end">
                          <ConfirmAction
                            action={deleteSubscriber.bind(null, s.id)}
                            ariaLabel="তালিকা থেকে সরান"
                            confirmTitle="তালিকা থেকে সরাবেন?"
                            confirmText={`${s.email} আর নিউজলেটার পাবেন না।`}
                            className="grid h-8 w-8 place-items-center rounded-full text-rose-600 hover:bg-rose-50"
                          >
                            <Trash2 size={15} />
                          </ConfirmAction>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <Pagination
            page={page}
            totalPages={totalPages}
            basePath="/admin/subscribers"
            params={{ q: search }}
          />
        </>
      )}
    </div>
  )
}
