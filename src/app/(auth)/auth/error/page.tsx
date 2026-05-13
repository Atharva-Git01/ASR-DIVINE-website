import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Authentication Error' }

const MESSAGES: Record<string, string> = {
  OAuthAccountNotLinked:
    'This email is already linked to a different sign-in method. Please use the original method.',
  OAuthSignin: 'Could not connect to the sign-in provider. Please try again.',
  OAuthCallback: 'Sign-in failed during OAuth callback. Please try again.',
  EmailSignin: 'Could not send the sign-in email. Please try again.',
  CredentialsSignin: 'Invalid email or password.',
  Default: 'An unexpected error occurred during sign-in.',
}

export default function AuthErrorPage({
  searchParams,
}: {
  searchParams: { error?: string }
}) {
  const message = MESSAGES[searchParams.error ?? 'Default'] ?? MESSAGES.Default

  return (
    <div className="w-full max-w-md text-center card p-8">
      <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <h1 className="font-display text-xl italic text-brand-brown-deep mb-2">Sign-in failed</h1>
      <p className="text-sm text-brand-text-secondary mb-6">{message}</p>
      <Link href="/auth/signin" className="btn-primary justify-center">
        Try again
      </Link>
    </div>
  )
}
