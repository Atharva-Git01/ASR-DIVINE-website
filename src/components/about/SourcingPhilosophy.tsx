const PILLARS = [
  {
    icon: '🌱',
    title: 'Quality Ingredients',
    body: 'We source the finest ingredients from trusted suppliers — a blend of premium local produce from across Maharashtra and carefully selected imported chocolate couvertures.',
  },
  {
    icon: '✋',
    title: 'Small-Batch',
    body: 'Every product is made in small batches. No shortcuts, no preservatives, no compromises on quality or flavour.',
  },
  {
    icon: '🥚',
    title: 'Eggless Options',
    body: 'Most of our products are available eggless — because great sweets and chocolates should be enjoyed by everyone.',
  },
  {
    icon: '🎁',
    title: 'Gifting First',
    body: 'Every ingredient is chosen for quality, taste, and the love it brings to every creation — from single boxes to bespoke corporate hampers.',
  },
]

export function SourcingPhilosophy() {
  return (
    <section className="bg-brand-cream py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <div className="mb-14 text-center">
          <p className="eyebrow mb-4 justify-center">How We Work</p>
          <h2 className="font-display text-display-sm sm:text-display-md text-brand-brown-deep italic">
            Principles before profit
          </h2>
          <p className="mt-4 text-base text-brand-text-secondary max-w-xl mx-auto leading-relaxed">
            We source the finest ingredients from trusted suppliers — a curated mix of premium local
            and imported ingredients, chosen for quality, taste, and the love it brings to every
            creation.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map(({ icon, title, body }) => (
            <div key={title} className="card p-7 flex flex-col gap-4">
              <span className="text-3xl" role="img" aria-label={title}>
                {icon}
              </span>
              <h3 className="font-body font-semibold text-brand-brown-deep text-base">{title}</h3>
              <p className="text-sm text-brand-text-secondary leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
