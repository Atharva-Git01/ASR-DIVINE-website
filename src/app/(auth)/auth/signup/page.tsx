import type { Metadata } from 'next'
import { SignUpForm } from '@/components/auth/SignUpForm'

export const metadata: Metadata = {
  title: 'Create Account',
  description: 'Create an ASR Divine account to place orders and track your deliveries.',
}

export default function SignUpPage() {
  return <SignUpForm />
}
