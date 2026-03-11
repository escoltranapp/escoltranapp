import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

const protectedRoutes = [
  '/dashboard',
  '/pipeline',
  '/contacts',
  '/lead-search',
  '/listas-disparo',
  '/activities',
  '/utm-analytics',
  '/ai-insights',
  '/settings',
]

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth

  const isProtected = protectedRoutes.some((route) =>
    nextUrl.pathname.startsWith(route)
  )

  if (isProtected && !isLoggedIn) {
    return NextResponse.redirect(new URL('/auth', req.url))
  }

  if (isLoggedIn && nextUrl.pathname === '/auth') {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
