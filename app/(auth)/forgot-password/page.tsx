'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { forgotPassword } from './actions'

const initial = { error: '', sent: false }

export default function ForgotPasswordPage() {
  const [state, formAction, pending] = useActionState(forgotPassword, initial)

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--gradient-hero)' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="font-display font-bold text-2xl text-white">
            JDC <span className="gradient-text">Tech Solutions</span>
          </Link>
          <p className="mt-2 text-sm text-jdc-dim">Reset your password</p>
        </div>

        <div className="card-glass rounded-2xl p-8">
          {state.sent ? (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto"
                style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)' }}>
                <svg className="w-6 h-6 text-jdc-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-white">Check your email</h2>
              <p className="text-jdc-dim text-sm">
                If an account exists for that email, we sent a password reset link. Check your inbox and spam folder.
              </p>
              <Link href="/login" className="inline-block mt-2 text-jdc-cyan text-sm font-medium hover:text-jdc-cyan-l">
                ← Back to sign in
              </Link>
            </div>
          ) : (
            <form action={formAction} className="space-y-5">
              <p className="text-sm text-jdc-muted">
                Enter the email address on your account and we'll send you a reset link.
              </p>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-jdc-muted mb-1">Email address</label>
                <input id="email" name="email" type="email" autoComplete="email" required className="input-dark w-full" />
              </div>
              {state.error && <p className="text-red-400 text-sm">{state.error}</p>}
              <button type="submit" disabled={pending} className="btn-primary w-full py-2.5 text-sm disabled:opacity-50">
                {pending ? 'Sending…' : 'Send reset link'}
              </button>
              <p className="text-center text-sm text-jdc-dim">
                <Link href="/login" className="text-jdc-cyan font-medium hover:text-jdc-cyan-l">← Back to sign in</Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
