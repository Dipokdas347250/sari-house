import { randomUUID } from 'node:crypto'
import { writeFile, mkdir, unlink } from 'node:fs/promises'
import { join } from 'node:path'
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads')
const MAX_BYTES = 5 * 1024 * 1024 // ৫ মেগাবাইট

const ALLOWED: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
}

/** ছবি আপলোড — শুধু লগইন করা অ্যাডমিনের জন্য */
export async function POST(request: Request) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ ok: false, message: 'অনুমতি নেই।' }, { status: 401 })
  }

  const formData = await request.formData()
  const files = formData.getAll('files').filter((f): f is File => f instanceof File)

  if (files.length === 0) {
    return NextResponse.json({ ok: false, message: 'কোনো ফাইল পাওয়া যায়নি।' }, { status: 400 })
  }
  if (files.length > 8) {
    return NextResponse.json(
      { ok: false, message: 'একসাথে সর্বোচ্চ ৮টি ছবি দেওয়া যাবে।' },
      { status: 400 }
    )
  }

  await mkdir(UPLOAD_DIR, { recursive: true })

  const urls: string[] = []

  for (const file of files) {
    const ext = ALLOWED[file.type]
    if (!ext) {
      return NextResponse.json(
        { ok: false, message: 'শুধু JPG, PNG, WEBP বা AVIF ছবি দেওয়া যাবে।' },
        { status: 400 }
      )
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { ok: false, message: `"${file.name}" ফাইলটি ৫ মেগাবাইটের চেয়ে বড়।` },
        { status: 400 }
      )
    }

    const name = `${Date.now().toString(36)}-${randomUUID().slice(0, 8)}.${ext}`
    const bytes = Buffer.from(await file.arrayBuffer())
    await writeFile(join(UPLOAD_DIR, name), bytes)
    urls.push(`/uploads/${name}`)
  }

  return NextResponse.json({ ok: true, urls })
}

/** আপলোড করা ছবি মুছে ফেলা */
export async function DELETE(request: Request) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ ok: false, message: 'অনুমতি নেই।' }, { status: 401 })
  }

  const { url } = (await request.json()) as { url?: string }

  // শুধু /uploads/ এর ভেতরের ফাইলই মোছা যাবে
  if (!url || !/^\/uploads\/[A-Za-z0-9._-]+$/.test(url)) {
    return NextResponse.json({ ok: false, message: 'ভুল ঠিকানা।' }, { status: 400 })
  }

  try {
    await unlink(join(UPLOAD_DIR, url.replace('/uploads/', '')))
  } catch {
    // ফাইল আগেই মুছে গেলে সমস্যা নেই
  }

  return NextResponse.json({ ok: true })
}
