import { redirect } from 'next/navigation'
import { verifySession } from '@/lib/dal'
import { homeFor, type Role } from '@/lib/roles'

export default async function Home() {
  // No page of its own: signed in → role home, signed out → /login
  // (verifySession redirects there itself). docs/specs/02-design.md §4.
  const { user } = await verifySession()
  redirect(homeFor(user.role as Role))
}
