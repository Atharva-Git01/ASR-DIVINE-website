'use client'

import { useEffect, useRef } from 'react'

type Props = {
  open: boolean
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
  onConfirm: () => void
  onCancel: () => void
}

/**
 * Accessible modal dialog that replaces native confirm().
 * Traps focus, closes on Escape, and renders a branded UI.
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  onConfirm,
  onCancel,
}: Props) {
  const cancelRef = useRef<HTMLButtonElement>(null)

  // Focus cancel button when dialog opens
  useEffect(() => {
    if (open) {
      setTimeout(() => cancelRef.current?.focus(), 10)
    }
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onCancel])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onCancel}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative w-full max-w-sm rounded-2xl p-6 shadow-2xl"
        style={{ background: '#1a0f07', border: '1px solid rgba(200,151,58,0.15)' }}
      >
        <h2
          id="confirm-dialog-title"
          className="font-body font-semibold text-brand-cream text-base mb-2"
        >
          {title}
        </h2>
        {description && (
          <p className="text-sm text-brand-cream/60 mb-6 leading-relaxed">{description}</p>
        )}

        <div className="flex gap-3 justify-end">
          <button
            ref={cancelRef}
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-sm font-medium text-brand-gold/60 hover:text-brand-gold transition-colors border"
            style={{ borderColor: 'rgba(200,151,58,0.20)' }}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              destructive
                ? 'bg-red-700 hover:bg-red-600 text-white'
                : 'text-brand-choc'
            }`}
            style={!destructive ? { background: 'var(--color-gold)' } : undefined}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
