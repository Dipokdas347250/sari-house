/**
 * ডেভেলপমেন্টে পরীক্ষার জন্য অ্যাডমিন সেশন টোকেন তৈরি করে।
 * ব্যবহার:  npx tsx scripts/dev-token.ts
 */
import 'dotenv/config'
import { SignJWT } from 'jose'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { PrismaClient } from '../src/generated/prisma/client'

async function main() {
  const adapter = new PrismaBetterSqlite3({
    url: process.env.DATABASE_URL ?? 'file:./dev.db',
  })
  const prisma = new PrismaClient({ adapter })

  const admin = await prisma.admin.findFirst()
  if (!admin) throw new Error('কোনো অ্যাডমিন অ্যাকাউন্ট নেই — আগে seed চালান।')

  const token = await new SignJWT({
    id: admin.id,
    name: admin.name,
    email: admin.email,
    role: admin.role,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(new TextEncoder().encode(process.env.AUTH_SECRET!))

  console.log(token)
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
