'use server'

import bcrypt from 'bcryptjs'
import { redirect } from 'next/navigation'
import prisma from '@/lib/db'
import { verifySession } from '@/lib/dal'
import { createSession, deleteSession } from '@/lib/session'
import { homeFor, type Role } from '@/lib/roles'

const EMAIL_SUFFIX = '@budiman.com'
const GENERIC_ERROR = 'Invalid email or password'

export type LoginState = { error?: string }

export async function login(
  _state: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const password = String(formData.get('password') ?? '')

  if (!email.endsWith(EMAIL_SUFFIX)) {
    return { error: 'Only @budiman.com emails can log in.' }
  }
  if (password.length === 0) {
    return { error: 'Please enter your password.' }
  }

  // Unknown email and wrong password get one and the same message
  // (requirements U5, AC-04) — never say which one failed.
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    return { error: GENERIC_ERROR }
  }
  const passwordOk = await bcrypt.compare(password, user.password)
  if (!passwordOk) {
    return { error: GENERIC_ERROR }
  }

  await createSession(user.id, user.role)
  redirect(homeFor(user.role as Role))
}

export async function logout(): Promise<void> {
  // Secure check first (design §6): the action needs a session;
  // without one verifySession sends the caller to /login anyway.
  await verifySession()
  await deleteSession()
  redirect('/login')
}
