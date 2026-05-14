'use client'

import { Component, type ReactNode } from 'react'
import * as Sentry from '@sentry/nextjs'

type Props = { children: ReactNode; fallback?: ReactNode }
type State = { error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  override state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  override componentDidCatch(error: Error) {
    Sentry.captureException(error)
  }

  override render() {
    if (this.state.error) {
      return (
        this.props.fallback ?? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-6">
            <p className="text-4xl mb-4">😕</p>
            <h2 className="font-display text-xl text-brand-cream mb-2">Something went wrong</h2>
            <p className="text-sm text-brand-gold/60 mb-6">
              We&apos;ve been notified and are looking into it.
            </p>
            <button
              onClick={() => {
                this.setState({ error: null })
                window.location.reload()
              }}
              className="px-5 py-2 rounded-xl text-sm font-medium text-brand-choc"
              style={{ background: 'var(--color-gold)' }}
            >
              Reload page
            </button>
          </div>
        )
      )
    }
    return this.props.children
  }
}
