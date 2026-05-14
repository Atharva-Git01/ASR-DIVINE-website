export function AboutHero() {
  return (
    <section className="relative overflow-hidden bg-brand-choc py-24 lg:py-32">
      {/* Subtle grid texture */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(245,239,224,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(245,239,224,0.5) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      <div className="relative mx-auto max-w-4xl px-6 text-center lg:px-12">
        <p className="eyebrow mb-6 justify-center" style={{ color: 'var(--color-gold)' }}>
          Our Story
        </p>
        <h1 className="font-display text-display-lg text-brand-cream italic leading-[1.06] tracking-[-0.01em]">
          Made with intention,
          <br />
          shared with love.
        </h1>
        <p className="mt-6 text-base text-brand-cream/70 max-w-2xl mx-auto leading-relaxed">
          Infinity Taste Eternal Delight — what started as a home kitchen passion in Pune has grown
          into ASR Divine, Pune&apos;s beloved home bakery dedicated to handcrafted sweets, cakes,
          and chocolates.
        </p>
      </div>
    </section>
  )
}
