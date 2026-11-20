import Header from '@/app/ui/header'
import { requireRole, verifySession } from '@/lib/dal'

export const metadata = { title: 'Supervisor – Budiman HRMS' }

export default async function SupervisorHomePage() {
  await verifySession()
  const user = await requireRole('Supervisor')

  return (
    <>
      <Header name={user.name} role={user.role} />
      <main className="mx-auto max-w-2xl p-8">
        <h1 className="text-2xl font-semibold text-[#333333]">Supervisor home</h1>
        <p className="mt-2">
          Signed in as {user.name} ({user.role}).
        </p>
        <p className="mt-4 text-slate-600">
          Requests to sign will show here.
        </p>
      </main>
    </>
  )
}
