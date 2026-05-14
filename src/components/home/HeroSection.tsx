'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

const REVIEW = {
  quote: 'Every bite is pure love and craft. The chocolate cake was absolutely divine!',
  author: 'Priya S.',
  rating: 5,
}

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-brand-white">
      <div className="mx-auto grid max-w-7xl items-center gap-8 px-6 py-16 lg:grid-cols-2 lg:gap-0 lg:px-12 lg:py-0 lg:min-h-[calc(100vh-72px)]">
        {/* Left — copy */}
        <div className="lg:py-24">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="eyebrow mb-6"
          >
            Artisan Sweets & Baked Goods · Pune
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08 }}
            className="font-display text-display-lg text-brand-brown-deep leading-[1.05] tracking-[-0.01em]"
          >
            Crafted with
            <br />
            <span className="italic text-brand-brown-warm">rare cacao,</span>
            <br />
            made for you.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.18 }}
            className="mt-6 max-w-md text-base text-brand-text-secondary leading-relaxed"
          >
            Small-batch bean-to-bar chocolates, celebration cakes, and gifting hampers — each piece
            made by hand in our Pune studio.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.28 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <Link href="/shop" className="btn btn-primary">
              Shop Now
            </Link>
            <Link href="/custom" className="btn btn-secondary">
              Custom Orders
            </Link>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2"
          >
            {['100% Handcrafted', 'Eggless Options Available', 'Custom Orders Welcome'].map(
              (badge) => (
                <span
                  key={badge}
                  className="flex items-center gap-1.5 text-xs text-brand-text-secondary"
                >
                  <span className="h-1 w-1 rounded-full bg-brand-gold" />
                  {badge}
                </span>
              )
            )}
          </motion.div>
        </div>

        {/* Right — visual panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="relative lg:h-full lg:min-h-[calc(100vh-72px)]"
        >
          {/* Hero image / gradient placeholder */}
          <div className="relative h-[480px] w-full overflow-hidden rounded-3xl bg-gradient-hero lg:h-full lg:rounded-none lg:rounded-l-[2.5rem]">
            {/* Texture overlay */}
            <div className="absolute inset-0 bg-brand-brown-deep/10" />

            {/* Decorative grid lines */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(245,239,224,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(245,239,224,0.3) 1px, transparent 1px)',
                backgroundSize: '40px 40px',
              }}
            />

            {/* Center emblem */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="font-display text-[2.75rem] italic text-brand-cream/15 leading-none select-none">
                  ASR Divine
                </p>
                <p className="mt-2 text-xs uppercase tracking-[0.2em] text-brand-cream/30">
                  Est. 2025 · Pune
                </p>
              </div>
            </div>

            {/* Floating review card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="absolute bottom-6 left-6 right-6 rounded-2xl bg-brand-white/95 backdrop-blur-sm p-4 shadow-float lg:right-auto lg:max-w-[280px]"
            >
              {/* Stars */}
              <div className="flex gap-0.5 mb-2">
                {Array.from({ length: REVIEW.rating }).map((_, i) => (
                  <StarIcon key={i} />
                ))}
              </div>
              <p className="text-sm text-brand-text-primary leading-snug">
                &ldquo;{REVIEW.quote}&rdquo;
              </p>
              <p className="mt-2 text-xs text-brand-text-secondary font-medium">
                — {REVIEW.author}
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function StarIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="#C8973A" aria-hidden="true">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}
