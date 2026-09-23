import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

/** নিউজলেটার তালিকা CSV হিসেবে নামানো — শুধু লগইন করা অ্যাডমিনের জন্য */
export async function GET() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ ok: false, message: 'অনুমতি নেই।' }, { status: 401 })
  }

  const subscribers = await prisma.subscriber.findMany({
    orderBy: { createdAt: 'desc' },
    select: { email: true, createdAt: true },
  })

  // এক্সেল যেন বাংলা ঠিকভাবে দেখায় — শুরুতে BOM
  const rows = [
    'email,joined_at',
    ...subscribers.map((s) => `${s.email},${s.createdAt.toISOString()}`),
  ]
  const csv = '﻿' + rows.join('\r\n') + '\r\n'

  const stamp = new Date().toISOString().slice(0, 10)

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="sharighor-subscribers-${stamp}.csv"`,
      'Cache-Control': 'no-store',
    },
  })
}
