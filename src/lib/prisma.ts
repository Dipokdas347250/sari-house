import path from 'node:path'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { PrismaClient } from '@/generated/prisma/client'

const createPrismaClient = () => {
  // Vercel এর ফাইল সিস্টেম রিড-অনলি, তাই বান্ডেলের সাথে যাওয়া dev.db শুধু পড়ার জন্য খোলা হয়
  const adapter = process.env.VERCEL
    ? new PrismaBetterSqlite3({
        url: path.join(process.cwd(), 'dev.db'),
        readonly: true,
      })
    : new PrismaBetterSqlite3({
        url: process.env.DATABASE_URL ?? 'file:./dev.db',
      })

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  })
}

// ডেভেলপমেন্টে হট-রিলোডের সময় যেন বারবার নতুন কানেকশন তৈরি না হয়
const globalForPrisma = globalThis as unknown as {
  prisma?: ReturnType<typeof createPrismaClient>
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
