'use client'

import { useState } from 'react'

type Step = 'type' | 'details' | 'delivery' | 'confirm'

type FormData = {
  orderType: string
  occasion: string
  guestCount: string
  flavour: string
  dietaryNotes: string
  designDescription: string
  referenceImages: File[]
  deliveryDate: string
  deliveryType: string
  name: string
  phone: string
  email: string
  budget: string
}

const EMPTY: FormData = {
  orderType: '',
  occasion: '',
  guestCount: '',
  flavour: '',
  dietaryNotes: '',
  designDescription: '',
  referenceImages: [],
  deliveryDate: '',
  deliveryType: 'delivery',
  name: '',
  phone: '',
  email: '',
  budget: '',
}

const ORDER_TYPES = [
  { id: 'cake', label: 'Celebration Cake', icon: '🎂', desc: 'Custom designed for birthdays, weddings, and special events' },
  { id: 'chocolates', label: 'Chocolate Box', icon: '🍫', desc: 'Personalised assortment — flavours, packaging, and message' },
  { id: 'hamper', label: 'Gift Hamper', icon: '🎁', desc: 'Curated combination of chocolates, cookies, and treats' },
  { id: 'cookies', label: 'Custom Cookies', icon: '🍪', desc: 'Shaped, iced, or branded for corporate and personal gifting' },
]

const STEPS: Step[] = ['type', 'details', 'delivery', 'confirm']
const STEP_LABELS = { type: 'Order Type', details: 'Details', delivery: 'Delivery', confirm: 'Contact' }

export function CustomOrderForm() {
  const [step, setStep] = useState<Step>('type')
  const [form, setForm] = useState<FormData>(EMPTY)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  function set(field: keyof FormData, value: string | File[]) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const stepIndex = STEPS.indexOf(step)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)

    const payload = new FormData()
    Object.entries(form).forEach(([k, v]) => {
      if (k === 'referenceImages') {
        ;(v as File[]).forEach((f) => payload.append('images', f))
      } else {
        payload.append(k, v as string)
      }
    })

    try {
      await fetch('/api/custom-order', { method: 'POST', body: payload })
    } catch {
      // fire-and-forget — show success regardless
    }

    setSubmitting(false)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="text-center py-10 space-y-4">
        <div className="w-14 h-14 rounded-full bg-brand-sage/20 flex items-center justify-center mx-auto">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7A8C6E" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
        <h2 className="font-display text-2xl italic text-brand-brown-deep">Request received!</h2>
        <p className="text-sm text-brand-text-secondary max-w-sm mx-auto">
          Thanks {form.name}! We&apos;ll review your request and get back to you at <strong>{form.email}</strong> within 24 hours.
        </p>
        <a href="/" className="btn-primary inline-flex">Back to home</a>
      </div>
    )
  }

  return (
    <div>
      {/* Step progress */}
      <div className="flex items-center gap-0 mb-10">
        {STEPS.map((s, i) => {
          const done = stepIndex > i
          const active = step === s
          return (
            <div key={s} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold"
                  style={{
                    background: done ? 'var(--color-brown-deep)' : active ? 'var(--color-gold)' : 'rgba(44,26,14,0.08)',
                    color: done || active ? 'white' : 'rgba(44,26,14,0.35)',
                  }}
                >
                  {done ? '✓' : i + 1}
                </div>
                <span className={`mt-1 text-[10px] ${active ? 'text-brand-brown-deep font-medium' : 'text-brand-text-secondary'}`}>
                  {STEP_LABELS[s]}
                </span>
              </div>
              {i < 3 && (
                <div className="flex-1 h-px mx-2 mt-[-10px]" style={{ background: stepIndex > i ? 'var(--color-brown-deep)' : 'rgba(44,26,14,0.10)' }} />
              )}
            </div>
          )
        })}
      </div>

      {/* Step 1 — Order type */}
      {step === 'type' && (
        <div>
          <h2 className="font-body font-semibold text-brand-brown-deep mb-4">What would you like?</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {ORDER_TYPES.map(({ id, label, icon, desc }) => (
              <button
                key={id}
                onClick={() => set('orderType', id)}
                className={`text-left card p-4 transition-all ${form.orderType === id ? 'ring-2 ring-brand-gold' : 'hover:shadow-md'}`}
              >
                <span className="text-2xl mb-2 block">{icon}</span>
                <p className="text-sm font-semibold text-brand-text-primary mb-0.5">{label}</p>
                <p className="text-xs text-brand-text-secondary leading-relaxed">{desc}</p>
              </button>
            ))}
          </div>
          <button
            disabled={!form.orderType}
            onClick={() => setStep('details')}
            className="btn-primary mt-6 w-full justify-center"
          >
            Continue →
          </button>
        </div>
      )}

      {/* Step 2 — Details */}
      {step === 'details' && (
        <div className="space-y-5">
          <h2 className="font-body font-semibold text-brand-brown-deep">Tell us more</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs text-brand-text-secondary mb-1.5">Occasion</label>
              <input type="text" value={form.occasion} onChange={(e) => set('occasion', e.target.value)} className="input" placeholder="Birthday, Wedding, Corporate…" />
            </div>
            <div>
              <label className="block text-xs text-brand-text-secondary mb-1.5">Approx. guest count</label>
              <input type="text" value={form.guestCount} onChange={(e) => set('guestCount', e.target.value)} className="input" placeholder="e.g. 20 people" />
            </div>
          </div>

          <div>
            <label className="block text-xs text-brand-text-secondary mb-1.5">Preferred flavour</label>
            <input type="text" value={form.flavour} onChange={(e) => set('flavour', e.target.value)} className="input" placeholder="Chocolate, Red Velvet, Mixed…" />
          </div>

          <div>
            <label className="block text-xs text-brand-text-secondary mb-1.5">Design / theme description *</label>
            <textarea value={form.designDescription} onChange={(e) => set('designDescription', e.target.value)} rows={4} required className="input resize-none" placeholder="Describe what you have in mind — colours, style, personalisation, text…" />
          </div>

          <div>
            <label className="block text-xs text-brand-text-secondary mb-1.5">Dietary requirements</label>
            <input type="text" value={form.dietaryNotes} onChange={(e) => set('dietaryNotes', e.target.value)} className="input" placeholder="Eggless, nut-free, sugar-free…" />
          </div>

          <div>
            <label className="block text-xs text-brand-text-secondary mb-1.5">Reference images (optional)</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => set('referenceImages', Array.from(e.target.files ?? []))}
              className="block w-full text-sm text-brand-text-secondary file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-medium file:bg-brand-blush file:text-brand-brown-deep cursor-pointer"
            />
            {form.referenceImages.length > 0 && (
              <p className="mt-1 text-xs text-brand-text-secondary">{form.referenceImages.length} file(s) selected</p>
            )}
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep('type')} className="btn-ghost">← Back</button>
            <button disabled={!form.designDescription} onClick={() => setStep('delivery')} className="btn-primary flex-1 justify-center">Continue →</button>
          </div>
        </div>
      )}

      {/* Step 3 — Delivery */}
      {step === 'delivery' && (
        <div className="space-y-5">
          <h2 className="font-body font-semibold text-brand-brown-deep">When & how</h2>

          <div>
            <label className="block text-xs text-brand-text-secondary mb-1.5">Requested date *</label>
            <input
              type="date"
              value={form.deliveryDate}
              onChange={(e) => set('deliveryDate', e.target.value)}
              min={new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0]}
              required
              className="input"
            />
            <p className="mt-1 text-xs text-brand-text-secondary">Minimum 5 business days. For elaborate designs, allow 10+ days.</p>
          </div>

          <div>
            <label className="block text-xs text-brand-text-secondary mb-2">Fulfillment</label>
            <div className="flex gap-3">
              {['delivery', 'pickup'].map((type) => (
                <button
                  key={type}
                  onClick={() => set('deliveryType', type)}
                  className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                    form.deliveryType === type ? 'bg-brand-brown-deep text-brand-cream border-brand-brown-deep' : 'text-brand-text-secondary'
                  }`}
                  style={form.deliveryType !== type ? { borderColor: 'rgba(44,26,14,0.20)' } : undefined}
                >
                  {type === 'delivery' ? '🚚 Delivery' : '🏪 Studio pickup'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs text-brand-text-secondary mb-1.5">Approximate budget</label>
            <select value={form.budget} onChange={(e) => set('budget', e.target.value)} className="input">
              <option value="">Select a range</option>
              <option value="under-1000">Under ₹1,000</option>
              <option value="1000-3000">₹1,000 – ₹3,000</option>
              <option value="3000-7000">₹3,000 – ₹7,000</option>
              <option value="7000-15000">₹7,000 – ₹15,000</option>
              <option value="above-15000">Above ₹15,000</option>
            </select>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep('details')} className="btn-ghost">← Back</button>
            <button disabled={!form.deliveryDate} onClick={() => setStep('confirm')} className="btn-primary flex-1 justify-center">Continue →</button>
          </div>
        </div>
      )}

      {/* Step 4 — Contact */}
      {step === 'confirm' && (
        <form onSubmit={handleSubmit} className="space-y-5">
          <h2 className="font-body font-semibold text-brand-brown-deep">Your contact details</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs text-brand-text-secondary mb-1.5">Full name *</label>
              <input type="text" value={form.name} onChange={(e) => set('name', e.target.value)} required className="input" placeholder="Priya Sharma" />
            </div>
            <div>
              <label className="block text-xs text-brand-text-secondary mb-1.5">Phone *</label>
              <input type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} required className="input" placeholder="+91 98765 43210" />
            </div>
          </div>

          <div>
            <label className="block text-xs text-brand-text-secondary mb-1.5">Email *</label>
            <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} required className="input" placeholder="you@example.com" />
          </div>

          {/* Summary */}
          <div className="card p-4 text-sm space-y-1.5" style={{ background: 'rgba(44,26,14,0.02)' }}>
            <p className="text-xs font-medium text-brand-text-secondary uppercase tracking-wide mb-2">Order summary</p>
            <p><span className="text-brand-text-secondary">Type:</span> {ORDER_TYPES.find((t) => t.id === form.orderType)?.label}</p>
            {form.occasion && <p><span className="text-brand-text-secondary">Occasion:</span> {form.occasion}</p>}
            <p><span className="text-brand-text-secondary">Date:</span> {new Date(form.deliveryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <p><span className="text-brand-text-secondary">Fulfillment:</span> {form.deliveryType === 'delivery' ? 'Delivery' : 'Studio pickup'}</p>
            {form.budget && <p><span className="text-brand-text-secondary">Budget:</span> {form.budget.replace(/-/g, ' ')}</p>}
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={() => setStep('delivery')} className="btn-ghost">← Back</button>
            <button type="submit" disabled={submitting} className="btn-primary flex-1 justify-center">
              {submitting ? 'Sending…' : 'Submit Request'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
