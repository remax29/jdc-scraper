'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { signup } from './actions'

const initialState = { error: '', sent: false, email: '' }

export default function SignupPage() {
  const [state, formAction, pending] = useActionState(signup, initialState)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const mismatch = confirm.length > 0 && password !== confirm

  if (state?.sent) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--gradient-hero)' }}>
        <div className="w-full max-w-md text-center">
          <Link href="/" className="font-display font-bold text-2xl text-white block mb-8">
            JDC <span className="gradient-text">Tech Solutions</span>
          </Link>
          <div className="card-glass rounded-2xl p-8">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)' }}>
              <svg className="w-7 h-7 text-jdc-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-white mb-2">Thank you for signing up!</h2>
            <p className="text-jdc-dim text-sm mb-1">We've sent a confirmation link to</p>
            <p className="font-medium text-jdc-cyan text-sm mb-5">{state.email}</p>
            <p className="text-jdc-dim text-xs mb-6">
              Click the link in your email to activate your account. Check your spam folder if you don't see it within a few minutes.
            </p>
            <Link href="/login" className="text-jdc-cyan text-sm font-medium hover:text-jdc-cyan-l">Back to sign in</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--gradient-hero)' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="font-display font-bold text-2xl text-white">
            JDC <span className="gradient-text">Tech Solutions</span>
          </Link>
          <p className="mt-2 text-sm text-jdc-dim">Create a free account — use your own API keys</p>
        </div>
        <div className="card-glass rounded-2xl p-8">
          <form action={formAction} className="space-y-5">
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-jdc-muted mb-1">Full name</label>
              <input id="full_name" name="full_name" type="text" autoComplete="name" required className="input-dark w-full" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-jdc-muted mb-1">Work email</label>
              <input id="email" name="email" type="email" autoComplete="email" required className="input-dark w-full" />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-jdc-muted mb-1">Password</label>
              <input id="password" name="password" type="password" autoComplete="new-password" required minLength={8}
                value={password} onChange={(e) => setPassword(e.target.value)} className="input-dark w-full" />
              <p className="text-xs text-jdc-dim mt-1">Minimum 8 characters</p>
            </div>
            <div>
              <label htmlFor="confirm_password" className="block text-sm font-medium text-jdc-muted mb-1">Confirm password</label>
              <input id="confirm_password" name="confirm_password" type="password" autoComplete="new-password" required minLength={8}
                value={confirm} onChange={(e) => setConfirm(e.target.value)}
                className={`input-dark w-full ${mismatch ? 'border-red-500' : ''}`} />
              {mismatch && <p className="text-red-400 text-xs mt-1">Passwords do not match</p>}
            </div>
            {state?.error && <p className="text-red-400 text-sm">{state.error}</p>}
            <button type="submit" disabled={pending || mismatch || password.length < 8}
              className="btn-primary w-full py-2.5 text-sm disabled:opacity-50">
              {pending ? 'Creating account…' : 'Create free account'}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-jdc-dim">
            Already have an account?{' '}
            <Link href="/login" className="text-jdc-cyan font-medium hover:text-jdc-cyan-l">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
