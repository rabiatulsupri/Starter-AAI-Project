// Data Access Layer — the secure check every page and action goes
// through (docs/specs/02-design.md §5). The cookie only proves where
// the request came from; the role used for access control is re-read
// from the database (design rule 5).

import { cache } from 'react'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import prisma from '@/lib/db'
import { verifySessionToken } from '@/lib/session'
import { homeFor, type Role } from '@/lib/roles'

export const verifySession = cache(async () => {
  const token = (await cookies()).get('session')?.value
  const session = verifySessionToken(token)
  if (!session) {
    redirect('/login')
  }
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      name: true,
      role: true,
      divisionId: true,
      designation: true,
    },
  })
  if (!user) {
    // Account removed since sign-in — treat as signed out.
    redirect('/login')
  }
  return { user }
})

export async function getSessionUser() {
  const { user } = await verifySession()
  return user
}

// Opens the page only for its own role; anyone else is sent to their
// own home (requirements AC-02).
export async function requireRole(expected: Role) {
  const { user } = await verifySession()
  if (user.role !== expected) {
    redirect(homeFor(user.role as Role))
  }
  return user
}
