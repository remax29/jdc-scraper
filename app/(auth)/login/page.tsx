'use client'

import { Suspense, useActionState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { login } from './actions'

const initialState = { error: '' }

function ResetBanner() {
  const searchParams = useSearchParams()
  if (searchParams.get('reset') !== '1') return null
  return (
    <div className="mb-4 rounded-lg px-4 py-3 text-sm text-jdc-cyan"
      style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)' }}>
      Password updated successfully. Sign in with your new password.
    </div>
  )
}

function LoginForm() {
  const [state, formAction, pending] = useActionState(login, initialState)

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--gradient-hero)' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="font-display font-bold text-2xl text-white">
            JDC <span className="gradient-text">Tech Solutions</span>
          </Link>
          <p className="mt-2 text-sm text-jdc-dim">Sign in to your account</p>
        </div>

        <Suspense><ResetBanner /></Suspense>

        <div className="card-glass rounded-2xl p-8">
          <form action={formAction} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-jdc-muted mb-1">Email</label>
              <input id="email" name="email" type="email" autoComplete="email" required className="input-dark w-full" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="password" className="block text-sm font-medium text-jdc-muted">Password</label>
                <Link href="/forgot-password" className="text-xs text-jdc-cyan hover:text-jdc-cyan-l">Forgot password?</Link>
              </div>
              <input id="password" name="password" type="password" autoComplete="current-password" required className="input-dark w-full" />
            </div>
            {state?.error && <p className="text-red-400 text-sm">{state.error}</p>}
            <button type="submit" disabled={pending}
              className="btn-primary w-full py-2.5 text-sm disabled:opacity-50">
              {pending ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-jdc-dim">
            No account?{' '}
            <Link href="/signup" className="text-jdc-cyan font-medium hover:text-jdc-cyan-l">Sign up free</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() { return <LoginForm /> }
