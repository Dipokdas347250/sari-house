import { cookies } from 'next/headers'
import { SignJWT, jwtVerify } from 'jose'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export const SESSION_COOKIE = 'sharighor_admin'
const MAX_AGE = 60 * 60 * 24 * 7 // ৭ দিন

function secretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET
  if (!secret || secret.length < 16) {
    throw new Error('AUTH_SECRET এনভায়রনমেন্ট ভেরিয়েবলটি সেট করা নেই।')
  }
  return new TextEncoder().encode(secret)
}

export type AdminSession = {
  id: string
  name: string
  email: string
  role: string
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10)
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash)
}

export async function createSessionToken(session: AdminSession): Promise<string> {
  return new SignJWT({ ...session })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secretKey())
}

export async function readSessionToken(token: string): Promise<AdminSession | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey())
    if (!payload.id || !payload.email) return null
    return {
      id: String(payload.id),
      name: String(payload.name ?? ''),
      email: String(payload.email),
      role: String(payload.role ?? 'STAFF'),
    }
  } catch {
    return null
  }
}

/** লগইন সফল হলে কুকি বসানো */
export async function startSession(session: AdminSession): Promise<void> {
  const token = await createSessionToken(session)
  const store = await cookies()
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: MAX_AGE,
  })
}

export async function endSession(): Promise<void> {
  const store = await cookies()
  store.delete(SESSION_COOKIE)
}

/** বর্তমান অ্যাডমিন — লগইন না থাকলে null */
export async function getSession(): Promise<AdminSession | null> {
  const store = await cookies()
  const token = store.get(SESSION_COOKIE)?.value
  if (!token) return null
  return readSessionToken(token)
}

/** সার্ভার অ্যাকশন / রুট হ্যান্ডলারে ব্যবহারের জন্য — লগইন না থাকলে এরর */
export async function requireAdmin(): Promise<AdminSession> {
  const session = await getSession()
  if (!session) throw new Error('অনুমতি নেই — আগে লগইন করুন।')
  return session
}

/** ইমেইল ও পাসওয়ার্ড মিলিয়ে দেখা */
export async function authenticate(
  email: string,
  password: string
): Promise<AdminSession | null> {
  const admin = await prisma.admin.findUnique({
    where: { email: email.trim().toLowerCase() },
  })
  if (!admin) return null
  const ok = await verifyPassword(password, admin.password)
  if (!ok) return null
  return { id: admin.id, name: admin.name, email: admin.email, role: admin.role }
}
