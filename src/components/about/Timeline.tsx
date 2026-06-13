const MILESTONES = [
  {
    year: '2023',
    title: 'The First Batch',
    body: 'Started experimenting with homemade chocolates and baked goods for family and friends. The response was overwhelming.',
  },
  {
    year: '2024',
    title: 'Learning & Growing',
    body: 'Enrolled in professional baking and chocolate-making courses. Completed internships to master the craft.',
  },
  {
    year: 'Early 2025',
    title: 'ASR Divine is Born',
    body: 'Launched ASR Divine officially from Shukrwar Peth, Pune, with a core menu of handcrafted sweets, cakes, and chocolates.',
  },
  {
    year: '2025',
    title: 'First 50 Customers',
    body: 'Crossed 50 happy customers through word of mouth, WhatsApp referrals, and custom gifting orders.',
  },
]

export function Timeline() {
  return (
    <section className="bg-brand-white py-20 lg:py-28">
      <div className="mx-auto max-w-5xl px-6 lg:px-12">
        <div className="mb-14 text-center">
          <p className="eyebrow mb-4 justify-center">Milestones</p>
          <h2 className="font-display text-display-sm sm:text-display-md text-brand-brown-deep italic">
            How we got here
          </h2>
        </div>

        <div className="relative">
          {/* Vertical line */}
          <div
            className="absolute left-[calc(50%-0.5px)] top-0 bottom-0 w-px hidden lg:block"
            style={{ background: 'rgba(44,26,14,0.10)' }}
            aria-hidden="true"
          />

          <div className="space-y-10">
            {MILESTONES.map(({ year, title, body }, i) => {
              const isLeft = i % 2 === 0

              return (
                <div
                  key={year}
                  className={`relative flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-0 ${
                    isLeft ? 'lg:text-right' : ''
                  }`}
                >
                  {/* Left content (even indices on desktop) */}
                  <div
                    className={`lg:w-[calc(50%-2rem)] ${isLeft ? 'lg:pr-8' : 'lg:order-3 lg:pl-8 lg:text-left'}`}
                  >
                    {isLeft ? (
                      <>
                        <p className="text-xs font-semibold text-brand-gold tracking-widest uppercase">
                          {year}
                        </p>
                        <h3 className="mt-1 font-body font-semibold text-brand-brown-deep">
                          {title}
                        </h3>
                        <p className="mt-1 text-sm text-brand-text-secondary leading-relaxed">
                          {body}
                        </p>
                      </>
                    ) : null}
                  </div>

                  {/* Center dot */}
                  <div className="hidden lg:flex lg:order-2 lg:w-16 lg:justify-center lg:flex-shrink-0">
                    <div className="h-3 w-3 rounded-full bg-brand-gold ring-4 ring-brand-cream" />
                  </div>

                  {/* Right content (odd indices on desktop) */}
                  <div
                    className={`lg:w-[calc(50%-2rem)] ${!isLeft ? 'lg:order-1 lg:pr-8 lg:text-right' : 'lg:order-3 lg:pl-8 lg:text-left'}`}
                  >
                    {!isLeft ? (
                      <>
                        <p className="text-xs font-semibold text-brand-gold tracking-widest uppercase">
                          {year}
                        </p>
                        <h3 className="mt-1 font-body font-semibold text-brand-brown-deep">
                          {title}
                        </h3>
                        <p className="mt-1 text-sm text-brand-text-secondary leading-relaxed">
                          {body}
                        </p>
                      </>
                    ) : null}
                  </div>

                  {/* Mobile: always show content */}
                  <div
                    className="lg:hidden border-l-2 pl-4"
                    style={{ borderColor: 'rgba(200,151,58,0.4)' }}
                  >
                    <p className="text-xs font-semibold text-brand-gold tracking-widest uppercase">
                      {year}
                    </p>
                    <h3 className="mt-1 font-body font-semibold text-brand-brown-deep">{title}</h3>
                    <p className="mt-1 text-sm text-brand-text-secondary leading-relaxed">{body}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
