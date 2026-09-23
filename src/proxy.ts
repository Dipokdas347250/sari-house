import { NextResponse, type NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const SESSION_COOKIE = 'sharighor_admin'

/**
 * অ্যাডমিন এলাকার পাহারাদার।
 * লগইন না থাকলে সরাসরি লগইন পাতায় পাঠিয়ে দেয়।
 * (আসল যাচাই প্রতিটি সার্ভার অ্যাকশনেও আবার করা হয়।)
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isLoginPage = pathname === '/admin/login'
  const token = request.cookies.get(SESSION_COOKIE)?.value

  let valid = false
  if (token) {
    try {
      const secret = process.env.AUTH_SECRET
      if (secret) {
        await jwtVerify(token, new TextEncoder().encode(secret))
        valid = true
      }
    } catch {
      valid = false
    }
  }

  if (!valid && !isLoginPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/admin/login'
    url.search = pathname === '/admin' ? '' : `?next=${encodeURIComponent(pathname)}`
    return NextResponse.redirect(url)
  }

  // লগইন থাকা অবস্থায় আবার লগইন পাতায় গেলে ড্যাশবোর্ডে পাঠানো
  if (valid && isLoginPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/admin'
    url.search = ''
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
