import DeskIllustration from '@/app/ui/desk-illustration'
import LoginForm from './login-form'

export const metadata = { title: 'Log in – Budiman HRMS' }

const DEMO_ACCOUNTS = [
  'employee-1@budiman.com',
  'supervisor-1@budiman.com',
  'supervisor-2@budiman.com',
  'hr-1@budiman.com',
  'hr-2@budiman.com',
  'admin@budiman.com',
]

export default function LoginPage() {
  return (
    <main className="flex min-h-screen bg-white">
      <div className="hidden w-1/2 items-center justify-center p-8 lg:flex">
        <DeskIllustration />
      </div>
      <div className="relative flex flex-1 items-center justify-center overflow-hidden rounded-l-3xl bg-brand p-4 sm:p-8">
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-40 -right-24 h-96 w-96 rounded-full border border-white/50"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-56 -right-10 h-[28rem] w-[28rem] rounded-full border border-white/40"
        />
        <div className="relative w-full max-w-md rounded-2xl bg-white p-10 shadow-xl">
          <h1 className="text-4xl font-bold text-[#333333]">Hello!</h1>
          <p className="mt-6 text-xl text-[#333333]">Sign in to get started</p>
          <div className="mt-8">
            <LoginForm />
          </div>
          <div className="mt-8 border-t border-slate-200 pt-4 text-sm text-slate-500">
            <p className="font-medium text-slate-700">Demo accounts</p>
            <ul className="mt-1 space-y-0.5">
              {DEMO_ACCOUNTS.map((account) => (
                <li key={account}>{account}</li>
              ))}
            </ul>
            <p className="mt-2">Password for all of them: password123</p>
          </div>
        </div>
      </div>
    </main>
  )
}
