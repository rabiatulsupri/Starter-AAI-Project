// Signed session cookie, per docs/specs/02-design.md rule 4.
// Signed with Node's built-in HMAC — no session packages are added
// (design §3). Imported only by server code: pages, server actions,
// and src/proxy.ts.

import { createHmac, timingSafeEqual } from 'node:crypto'
import { cookies } from 'next/headers'

export const SESSION_COOKIE_NAME = 'session'
const SESSION_DURATION_MS = 8 * 60 * 60 * 1000

export type SessionPayload = {
  userId: number
  role: string
  expiresAt: number
}

function getSecret(): string {
  const secret = process.env.SESSION_SECRET
  if (!secret) {
    throw new Error(
      'SESSION_SECRET is not set. Copy .env.example to .env and run: openssl rand -base64 32'
    )
  }
  return secret
}

function sign(data: string): string {
  return createHmac('sha256', getSecret()).update(data).digest('base64url')
}

export async function createSession(
  userId: number,
  role: string
): Promise<void> {
  const expiresAt = Date.now() + SESSION_DURATION_MS
  const data = Buffer.from(JSON.stringify({ userId, role, expiresAt })).toString(
    'base64url'
  )
  const token = `${data}.${sign(data)}`
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    expires: new Date(expiresAt),
  })
}

// Pure check of the cookie value: signature, shape, and expiry.
// Returns null for missing, tampered, or expired tokens.
export function verifySessionToken(
  token: string | undefined
): SessionPayload | null {
  if (!token) return null
  const [data, signature] = token.split('.')
  if (!data || !signature) return null

  const expected = Buffer.from(sign(data))
  const provided = Buffer.from(signature)
  if (expected.length !== provided.length) return null
  if (!timingSafeEqual(expected, provided)) return null

  try {
    const payload = JSON.parse(
      Buffer.from(data, 'base64url').toString('utf8')
    ) as SessionPayload
    if (
      typeof payload.userId !== 'number' ||
      typeof payload.role !== 'string' ||
      typeof payload.expiresAt !== 'number'
    ) {
      return null
    }
    if (payload.expiresAt < Date.now()) return null
    return payload
  } catch {
    return null
  }
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}
