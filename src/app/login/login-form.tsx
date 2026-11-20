'use client'

import { useActionState, useState, type FormEvent } from 'react'
import { login, type LoginState } from '@/app/actions/auth'

const EMAIL_SUFFIX = '@budiman.com'

export default function LoginForm() {
  const [state, formAction] = useActionState<LoginState, FormData>(login, {})
  const [email, setEmail] = useState('')
  const [clientError, setClientError] = useState<string | undefined>()

  const suffixOk = email.toLowerCase().endsWith(EMAIL_SUFFIX)
  const error = clientError ?? state?.error

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    // Block the submit in the browser so a non-work email never makes
    // the round-trip (requirements AC-08). With JavaScript off this
    // never runs and the server action applies the same check.
    if (!suffixOk) {
      event.preventDefault()
      setClientError('Only @budiman.com emails can log in.')
    } else {
      setClientError(undefined)
    }
  }

  return (
    <form action={formAction} onSubmit={handleSubmit} className="space-y-5">
      <div className="relative">
        <label htmlFor="email" className="sr-only">
          Work email
        </label>
        <span
          aria-hidden
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#999999]"
        >
          <MailIcon />
        </span>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          placeholder="Email Address"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full rounded-full border border-[#cccccc] py-3.5 pl-12 pr-5 text-[#333333] placeholder:text-[#999999] focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
          required
        />
      </div>
      <div className="relative">
        <label htmlFor="password" className="sr-only">
          Password
        </label>
        <span
          aria-hidden
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#999999]"
        >
          <LockIcon />
        </span>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="Password"
          className="w-full rounded-full border border-[#cccccc] py-3.5 pl-12 pr-5 text-[#333333] placeholder:text-[#999999] focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
          required
        />
      </div>
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
      <button
        type="submit"
        className="w-full rounded-full bg-brand px-4 py-3.5 font-medium text-white hover:bg-brand-dark"
      >
        Login
      </button>
    </form>
  )
}

function MailIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  )
}
