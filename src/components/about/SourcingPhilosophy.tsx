const PILLARS = [
  {
    icon: '🌱',
    title: 'Single-Origin',
    body: 'We work directly with small farms in Kerala, Coorg, Madagascar, and Peru — each with traceable, ethical supply chains.',
  },
  {
    icon: '✋',
    title: 'Small-Batch',
    body: 'Every product is made in batches of 50 or fewer. No shortcuts, no preservatives, no compromises on quality.',
  },
  {
    icon: '🥚',
    title: 'Eggless Options',
    body: "Most of our products are available eggless without substitutes — because great chocolate doesn't need eggs.",
  },
  {
    icon: '📦',
    title: 'Sustainable Packaging',
    body: 'All packaging is either recyclable, biodegradable, or reusable. We ship with minimal plastic.',
  },
]

export function SourcingPhilosophy() {
  return (
    <section className="bg-brand-cream py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <div className="mb-14 text-center">
          <p className="eyebrow mb-4 justify-center">How We Work</p>
          <h2 className="font-display text-display-md text-brand-brown-deep italic">
            Principles before profit
          </h2>
          <p className="mt-4 text-base text-brand-text-secondary max-w-xl mx-auto leading-relaxed">
            Our sourcing philosophy is simple: know where everything comes from, and make sure
            everyone in the chain is treated fairly.
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
