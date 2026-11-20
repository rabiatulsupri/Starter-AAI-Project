import Header from '@/app/ui/header'
import { requireRole, verifySession } from '@/lib/dal'

export const metadata = { title: 'Admin – Budiman HRMS' }

export default async function AdminHomePage() {
  await verifySession()
  const user = await requireRole('Admin')

  return (
    <>
      <Header name={user.name} role={user.role} />
      <main className="mx-auto max-w-2xl p-8">
        <h1 className="text-2xl font-semibold text-[#333333]">Admin home</h1>
        <p className="mt-2">
          Signed in as {user.name} ({user.role}).
        </p>
        <p className="mt-4 text-slate-600">
          The view-everything list will show here.
        </p>
      </main>
    </>
  )
}
