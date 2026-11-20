// Seed the fixed choice lists and the demo people from
// docs/specs/02-design.md Reference A and B. Idempotent: safe to re-run.
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const DIVISIONS: Record<string, string[]> = {
  Finance: ['Finance Manager', 'Accountant', 'Accounts Clerk'],
  'Human Resources': ['HR Manager', 'HR Officer', 'HR Assistant'],
  'Information Technology': [
    'IT Manager',
    'Software Developer',
    'IT Support Officer',
  ],
  Operations: [
    'Operations Manager',
    'Operations Supervisor',
    'Operations Executive',
  ],
  Marketing: [
    'Marketing Manager',
    'Marketing Executive',
    'Marketing Assistant',
  ],
  // Not in the brief's fixed list; added so the admin's division field
  // can be filled (see design Reference B footnote).
  Admin: ['Admin Manager'],
}

const DEMO_USERS = [
  {
    name: 'Employee 1',
    icNo: '00-148888',
    email: 'employee-1@budiman.com',
    role: 'Employee',
    division: 'Finance',
    designation: 'Accounts Clerk',
  },
  {
    name: 'Supervisor 1',
    icNo: '00-157777',
    email: 'supervisor-1@budiman.com',
    role: 'Supervisor',
    division: 'Finance',
    designation: 'Finance Manager',
  },
  {
    name: 'Supervisor 2',
    icNo: '00-166666',
    email: 'supervisor-2@budiman.com',
    role: 'Supervisor',
    division: 'Finance',
    designation: 'Accountant',
  },
  {
    name: 'HR 1',
    icNo: '00-175555',
    email: 'hr-1@budiman.com',
    role: 'HR',
    division: 'Human Resources',
    designation: 'HR Officer',
  },
  {
    name: 'HR 2',
    icNo: '00-184444',
    email: 'hr-2@budiman.com',
    role: 'HR',
    division: 'Human Resources',
    designation: 'HR Officer',
  },
  {
    name: 'Admin',
    icNo: '00-193333',
    email: 'admin@budiman.com',
    role: 'Admin',
    division: 'Admin',
    designation: 'Admin Manager',
  },
]

async function main() {
  const hash = await bcrypt.hash('password123', 10)

  for (const [divisionName, designations] of Object.entries(DIVISIONS)) {
    const division = await prisma.division.upsert({
      where: { name: divisionName },
      update: {},
      create: { name: divisionName },
    })
    for (const name of designations) {
      await prisma.designation.upsert({
        where: { divisionId_name: { divisionId: division.id, name } },
        update: {},
        create: { name, divisionId: division.id },
      })
    }
  }

  for (const user of DEMO_USERS) {
    const division = await prisma.division.findUniqueOrThrow({
      where: { name: user.division },
    })
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        name: user.name,
        icNo: user.icNo,
        email: user.email,
        password: hash,
        role: user.role,
        divisionId: division.id,
        designation: user.designation,
      },
    })
  }

  const count = await prisma.user.count()
  console.log(`Seed complete: ${count} users, 6 divisions`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
