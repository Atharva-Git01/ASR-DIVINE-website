'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

export function SignInForm() {
  const router = useRouter()
  const params = useSearchParams()
  const callbackUrl = params.get('callbackUrl') ?? '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const result = await signIn('credentials', {
      email,
      password,
      callbackUrl,
      redirect: false,
    })

    setLoading(false)

    if (result?.error) {
      setError('Invalid email or password. Please try again.')
      return
    }

    router.push(callbackUrl)
    router.refresh()
  }

  async function handleGoogle() {
    await signIn('google', { callbackUrl })
  }

  return (
    <div className="w-full max-w-md">
      <div className="card p-8">
        <h1 className="font-display text-2xl italic text-brand-brown-deep mb-1">Welcome back</h1>
        <p className="text-sm text-brand-text-secondary mb-6">
          Sign in to your Cocoa & Crumb account
        </p>

        {/* Google OAuth */}
        <button
          type="button"
          onClick={handleGoogle}
          className="w-full flex items-center justify-center gap-3 border rounded-xl px-4 py-2.5 text-sm font-medium text-brand-text-primary hover:bg-brand-blush/20 transition-colors mb-4"
          style={{ borderColor: 'rgba(44,26,14,0.15)' }}
        >
          <GoogleIcon />
          Continue with Google
        </button>

        <div className="relative flex items-center gap-3 my-5">
          <div className="flex-1 border-t" style={{ borderColor: 'rgba(44,26,14,0.10)' }} />
          <span className="text-xs text-brand-text-secondary">or</span>
          <div className="flex-1 border-t" style={{ borderColor: 'rgba(44,26,14,0.10)' }} />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg px-4 py-3 text-sm bg-red-50 text-red-700 border border-red-200">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-xs text-brand-text-secondary mb-1.5">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="input"
              autoComplete="email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs text-brand-text-secondary mb-1.5">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="input"
              autoComplete="current-password"
            />
          </div>

          <div className="flex justify-end">
            <Link href="/auth/forgot-password" className="text-xs text-brand-gold hover:underline">
              Forgot password?
            </Link>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>

      <p className="mt-4 text-center text-sm text-brand-text-secondary">
        New here?{' '}
        <Link href="/auth/signup" className="text-brand-gold hover:underline font-medium">
          Create an account
        </Link>
      </p>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  )
}
