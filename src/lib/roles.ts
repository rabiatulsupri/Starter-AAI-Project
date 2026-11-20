// The four roles and where each one lands after login.
// docs/specs/02-design.md Reference A.

export const ROLES = ['Employee', 'Supervisor', 'HR', 'Admin'] as const
export type Role = (typeof ROLES)[number]

const HOME_FOR_ROLE: Record<Role, string> = {
  Employee: '/employee',
  Supervisor: '/supervisor',
  HR: '/hr',
  Admin: '/admin',
}

export function homeFor(role: Role): string {
  return HOME_FOR_ROLE[role]
}
