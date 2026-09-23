import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { AdminShell } from '@/components/admin/AdminShell'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: { default: 'অ্যাডমিন প্যানেল', template: '%s | শাড়িঘর অ্যাডমিন' },
  robots: { index: false, follow: false },
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()
  if (!session) redirect('/admin/login')

  const [orders, reviews, messages] = await Promise.all([
    prisma.order.count({ where: { status: 'pending' } }),
    prisma.review.count({ where: { isApproved: false } }),
    prisma.message.count({ where: { isRead: false } }),
  ])

  return (
    <AdminShell
      admin={{ name: session.name, email: session.email, role: session.role }}
      badges={{ orders, reviews, messages }}
    >
      {children}
    </AdminShell>
  )
}
