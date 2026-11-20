// Early redirects (docs/specs/03-tasks.md Task 6). Optimistic checks
// only: the cookie is verified, but the database is never touched
// here. The real security lives in src/lib/dal.ts, which every page
// and action calls itself.

import { NextResponse, type NextRequest } from 'next/server'
import { verifySessionToken, SESSION_COOKIE_NAME } from '@/lib/session'
import { homeFor, type Role } from '@/lib/roles'

const ROLE_ROUTES: Record<string, Role> = {
  '/employee': 'Employee',
  '/supervisor': 'Supervisor',
  '/hr': 'HR',
  '/admin': 'Admin',
}

export default function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname
  const session = verifySessionToken(
    request.cookies.get(SESSION_COOKIE_NAME)?.value
  )

  if (!session) {
    if (path in ROLE_ROUTES) {
      return NextResponse.redirect(new URL('/login', request.nextUrl))
    }
    return NextResponse.next()
  }

  // Signed in: never see /login or /, and never another role's home.
  if (path === '/login' || path === '/') {
    return NextResponse.redirect(
      new URL(homeFor(session.role as Role), request.nextUrl)
    )
  }
  const owner = ROLE_ROUTES[path]
  if (owner && session.role !== owner) {
    return NextResponse.redirect(
      new URL(homeFor(session.role as Role), request.nextUrl)
    )
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)',
}
