export function FounderStory() {
  return (
    <section className="bg-brand-white py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          {/* Image placeholder */}
          <div className="order-2 lg:order-1">
            <div
              className="aspect-[4/5] w-full rounded-3xl overflow-hidden relative"
              style={{ background: 'linear-gradient(135deg, #5C3D1E 0%, #3D1F0D 60%, #8B5E3C 100%)' }}
            >
              {/* Decorative layered circles */}
              <div
                className="absolute inset-0 flex items-center justify-center"
                aria-hidden="true"
              >
                <div
                  className="w-48 h-48 rounded-full border border-brand-cream/10"
                  style={{ boxShadow: '0 0 0 32px rgba(245,239,224,0.04), 0 0 0 64px rgba(245,239,224,0.02)' }}
                />
              </div>
              <div className="absolute bottom-8 left-8 right-8">
                <p className="font-display text-2xl italic text-brand-cream/20 leading-tight">
                  &ldquo;Chocolate isn't just food.<br />It's a memory in every bite.&rdquo;
                </p>
                <p className="mt-3 text-xs text-brand-cream/30 tracking-widest uppercase">
                  — Founder, Cocoa & Crumb
                </p>
              </div>
            </div>
          </div>

          {/* Copy */}
          <div className="order-1 lg:order-2">
            <p className="eyebrow mb-6">The Beginning</p>
            <h2 className="font-display text-display-md text-brand-brown-deep italic leading-[1.1]">
              A kitchen, a dream,<br />and really good cacao.
            </h2>

            <div className="mt-8 space-y-5 text-base text-brand-text-secondary leading-relaxed">
              <p>
                It began the way most great things do — out of necessity and obsession. Our founder
                spent years working in finance, but every weekend was spent at the stove, experimenting
                with single-origin beans sourced from small farms across India, Madagascar, and Peru.
              </p>
              <p>
                The turning point came when a hand-gifted box of truffles at a friend&apos;s wedding
                led to fifty orders the following Monday. That was our sign.
              </p>
              <p>
                Today, Cocoa &amp; Crumb operates from a dedicated studio in Pune, serving over
                two hundred families each month with chocolates, custom celebration cakes, and
                curated gifting experiences — all made entirely by hand, one batch at a time.
              </p>
            </div>

            {/* Stats */}
            <div className="mt-10 grid grid-cols-3 gap-6 border-t pt-8" style={{ borderColor: 'rgba(44,26,14,0.08)' }}>
              {[
                { value: '200+', label: 'Families served monthly' },
                { value: '12+', label: 'Origin chocolates' },
                { value: '100%', label: 'Handcrafted' },
              ].map(({ value, label }) => (
                <div key={label}>
                  <p className="font-display text-3xl italic text-brand-gold">{value}</p>
                  <p className="mt-1 text-xs text-brand-text-secondary leading-snug">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
