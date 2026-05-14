import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact Us',
  description:
    'Get in touch with ASR Divine for orders, custom enquiries, or just to say hello. Visit our studio in Pune or reach us on WhatsApp.',
}

const FAQ_ITEMS = [
  {
    q: 'Do you deliver outside Pune?',
    a: 'Yes — we ship dry chocolates and cookies pan-India via courier. Cakes and fresh items are Pune-only.',
  },
  {
    q: 'How far in advance should I order a custom cake?',
    a: 'Minimum 5 business days. For elaborate designs or large orders, 10 days is recommended.',
  },
  {
    q: 'Are eggless options available for all products?',
    a: 'Most of our chocolates are inherently eggless. Cakes and cookies have eggless variants — please mention it at checkout.',
  },
  {
    q: 'Do you do corporate gifting?',
    a: 'Absolutely. We offer bulk pricing and custom branding for corporate hampers. Email us for a quote.',
  },
]

const OPENING_HOURS = [
  { days: 'Monday – Friday', hours: '10:00 am – 7:00 pm' },
  { days: 'Saturday – Sunday', hours: '10:00 am – 8:00 pm' },
  { days: 'Public Holidays', hours: 'Closed' },
]

export default function ContactPage() {
  const address =
    process.env.NEXT_PUBLIC_BAKERY_ADDRESS ??
    '446 Shukratara Building, 3rd Floor, Flat No. 301, Shukrwar Peth, Pune – 411002'
  const phone = process.env.NEXT_PUBLIC_BAKERY_PHONE ?? '+91 70709 19197'
  const email = process.env.NEXT_PUBLIC_BAKERY_EMAIL ?? 'asrdivine2026@gmail.com'
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_BAKERY_PHONE ?? '917070919197'

  const mapsUrl = `https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? ''}&q=${encodeURIComponent(address)}`

  return (
    <div className="bg-brand-cream min-h-screen">
      {/* Header */}
      <div
        className="bg-brand-white border-b pt-14 pb-12"
        style={{ borderColor: 'rgba(44,26,14,0.08)' }}
      >
        <div className="mx-auto max-w-7xl px-6 text-center lg:px-12">
          <p className="eyebrow mb-3 justify-center">Get in Touch</p>
          <h1 className="font-display text-display-md text-brand-brown-deep italic">
            We&apos;d love to hear from you
          </h1>
          <p className="mt-4 text-base text-brand-text-secondary max-w-md mx-auto">
            For orders, custom enquiries, or corporate gifting — reach us on WhatsApp for the
            fastest response.
          </p>

          {/* WhatsApp CTA */}
          <a
            href={`https://wa.me/${whatsapp}?text=Hi%2C%20I%27d%20like%20to%20enquire%20about%20an%20order.`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary mt-8 inline-flex gap-2"
          >
            <WhatsappIcon />
            Chat on WhatsApp
          </a>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-12 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
          {/* Left — details */}
          <div className="space-y-10">
            {/* Address & hours */}
            <div>
              <h2 className="font-body font-semibold text-brand-brown-deep mb-4">
                Studio Location
              </h2>
              <address className="not-italic text-sm text-brand-text-secondary leading-relaxed mb-4">
                {address}
              </address>
              <a
                href={`tel:${phone}`}
                className="block text-sm text-brand-text-secondary hover:text-brand-brown-deep transition-colors mb-1"
              >
                {phone}
              </a>
              <a
                href={`mailto:${email}`}
                className="block text-sm text-brand-text-secondary hover:text-brand-brown-deep transition-colors"
              >
                {email}
              </a>
            </div>

            <div>
              <h2 className="font-body font-semibold text-brand-brown-deep mb-4">Opening Hours</h2>
              <div className="space-y-2">
                {OPENING_HOURS.map(({ days, hours }) => (
                  <div
                    key={days}
                    className="flex justify-between text-sm"
                    style={{
                      borderBottom: '1px solid rgba(44,26,14,0.06)',
                      paddingBottom: '0.5rem',
                    }}
                  >
                    <span className="text-brand-text-secondary">{days}</span>
                    <span className="font-medium text-brand-text-primary">{hours}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Google Maps embed */}
            {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY &&
            process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY !== 'placeholder' ? (
              <div className="overflow-hidden rounded-2xl">
                <iframe
                  src={mapsUrl}
                  width="100%"
                  height="280"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="ASR Divine location"
                />
              </div>
            ) : (
              <div
                className="rounded-2xl h-56 flex items-center justify-center text-brand-text-secondary text-sm"
                style={{ background: 'linear-gradient(135deg, #5C3D1E20, #C8973A20)' }}
              >
                Map will appear when Google Maps API key is configured
              </div>
            )}
          </div>

          {/* Right — FAQ */}
          <div>
            <h2 className="font-body font-semibold text-brand-brown-deep mb-6">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {FAQ_ITEMS.map(({ q, a }) => (
                <details
                  key={q}
                  className="card group cursor-pointer"
                  style={{ padding: '1rem 1.25rem' }}
                >
                  <summary className="flex items-center justify-between gap-3 text-sm font-medium text-brand-text-primary list-none cursor-pointer select-none">
                    {q}
                    <span className="text-brand-gold flex-shrink-0 transition-transform group-open:rotate-45 duration-200">
                      +
                    </span>
                  </summary>
                  <p className="mt-3 text-sm text-brand-text-secondary leading-relaxed">{a}</p>
                </details>
              ))}
            </div>

            {/* Contact form */}
            <div className="mt-10 card p-6">
              <h3 className="font-body font-semibold text-brand-brown-deep mb-4">
                Send us a message
              </h3>
              <form
                action={`mailto:${email}`}
                method="get"
                encType="text/plain"
                className="space-y-4"
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-xs text-brand-text-secondary mb-1.5"
                    >
                      Name
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Your name"
                      required
                      className="input"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-xs text-brand-text-secondary mb-1.5"
                    >
                      Email
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      required
                      className="input"
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="message"
                    className="block text-xs text-brand-text-secondary mb-1.5"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="body"
                    rows={4}
                    placeholder="Tell us about your order or enquiry..."
                    required
                    className="input resize-none"
                  />
                </div>
                <button type="submit" className="btn-primary w-full justify-center">
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function WhatsappIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  )
}
