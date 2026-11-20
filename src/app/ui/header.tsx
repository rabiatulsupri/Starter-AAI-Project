import { logout } from '@/app/actions/auth'

// Shared shell for the role homes. Shared UI, not a security layer —
// the checks live in src/lib/dal.ts (docs/specs/02-design.md §6).
// Blue band style per docs/specs/02-design.md §8.
export default function Header({ name, role }: { name: string; role: string }) {
  return (
    <header className="bg-brand text-white">
      <div className="mx-auto flex max-w-2xl items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <span className="font-semibold">{name}</span>
          <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs uppercase tracking-wide">
            {role}
          </span>
        </div>
        <form action={logout}>
          <button
            type="submit"
            className="rounded-full bg-white px-4 py-1.5 text-sm font-medium text-brand hover:bg-blue-50"
          >
            Sign out
          </button>
        </form>
      </div>
    </header>
  )
}
