import type { Metadata } from 'next'
import { Suspense } from 'react'
import { SignInForm } from '@/components/auth/SignInForm'

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to your ASR Divine account.',
}

export default function SignInPage() {
  return (
    <Suspense>
      <SignInForm />
    </Suspense>
  )
}
