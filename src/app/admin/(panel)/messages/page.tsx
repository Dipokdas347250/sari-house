import Link from 'next/link'
import { Mail, MailOpen, Trash2, Phone, Inbox } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { ActionButton, ConfirmAction } from '@/components/admin/ActionButton'
import { setMessageRead, deleteMessage } from '@/actions/admin'
import { EmptyState } from '@/components/ui/kit'
import { toBn, formatDateTime, cn } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export const metadata = { title: 'বার্তা' }

type SearchParams = Record<string, string | string[] | undefined>
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)

export default async function AdminMessagesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const sp = await searchParams
  const filter = one(sp.filter) ?? 'all'

  const where = filter === 'unread' ? { isRead: false } : {}

  const [messages, unreadCount, totalCount, subscribers] = await Promise.all([
    prisma.message.findMany({ where, orderBy: { createdAt: 'desc' }, take: 60 }),
    prisma.message.count({ where: { isRead: false } }),
    prisma.message.count(),
    prisma.subscriber.count(),
  ])

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          {[
            { key: 'all', label: `সব (${toBn(totalCount)})` },
            { key: 'unread', label: `অপঠিত (${toBn(unreadCount)})` },
          ].map((t) => (
            <Link
              key={t.key}
              href={`/admin/messages?filter=${t.key}`}
              className={cn(
                'rounded-full px-4 py-2 text-sm font-medium transition-colors',
                filter === t.key
                  ? 'bg-brand-700 text-white'
                  : 'bg-white text-ink hover:bg-cream-50'
              )}
            >
              {t.label}
            </Link>
          ))}
        </div>

        <Link
          href="/admin/subscribers"
          className="rounded-full bg-white px-4 py-2 text-sm text-muted transition-colors hover:text-brand-700"
        >
          নিউজলেটারে <strong className="text-ink">{toBn(subscribers)}</strong> জন
        </Link>
      </div>

      {messages.length === 0 ? (
        <EmptyState
          icon={<Inbox size={44} />}
          title="কোনো বার্তা নেই"
          description="যোগাযোগ ফর্ম থেকে বার্তা এলে এখানে দেখা যাবে।"
        />
      ) : (
        <ul className="space-y-3">
          {messages.map((m) => (
            <li
              key={m.id}
              className={cn(
                'rounded-2xl border bg-white p-5',
                m.isRead ? 'border-brand-100' : 'border-brand-300 bg-brand-50/30'
              )}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="flex items-center gap-2 font-semibold text-ink">
                    {!m.isRead && (
                      <span className="h-2 w-2 shrink-0 rounded-full bg-brand-600" aria-label="অপঠিত" />
                    )}
                    {m.name}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                    <a
                      href={`tel:${m.phone}`}
                      className="flex items-center gap-1 hover:text-brand-700"
                    >
                      <Phone size={11} />
                      {m.phone}
                    </a>
                    {m.email && (
                      <a href={`mailto:${m.email}`} className="hover:text-brand-700">
                        {m.email}
                      </a>
                    )}
                    <span>{formatDateTime(m.createdAt)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <ActionButton
                    action={setMessageRead.bind(null, m.id, !m.isRead)}
                    title={m.isRead ? 'অপঠিত করুন' : 'পঠিত করুন'}
                    ariaLabel={m.isRead ? 'অপঠিত করুন' : 'পঠিত করুন'}
                    className="grid h-8 w-8 place-items-center rounded-full text-brand-700 hover:bg-brand-50"
                  >
                    {m.isRead ? <Mail size={15} /> : <MailOpen size={15} />}
                  </ActionButton>

                  <ConfirmAction
                    action={deleteMessage.bind(null, m.id)}
                    ariaLabel="বার্তা মুছে ফেলুন"
                    confirmTitle="বার্তাটি মুছে ফেলবেন?"
                    confirmText={`${m.name} এর পাঠানো বার্তাটি মুছে যাবে।`}
                    className="grid h-8 w-8 place-items-center rounded-full text-rose-600 hover:bg-rose-50"
                  >
                    <Trash2 size={15} />
                  </ConfirmAction>
                </div>
              </div>

              {m.subject && (
                <p className="mt-3 text-sm font-medium text-brand-900">{m.subject}</p>
              )}
              <p className="mt-1.5 text-sm leading-relaxed whitespace-pre-line text-ink">
                {m.body}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
