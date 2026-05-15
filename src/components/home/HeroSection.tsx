'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-brand-brown-deep -mt-[72px] min-h-screen">
      {/* Full-section background image */}
      <Image
        src="/hero.png"
        alt="ASR Divine handcrafted sweets and chocolates"
        fill
        priority
        className="object-cover object-right-top"
        sizes="100vw"
      />
      {/* Left-to-right gradient — keeps hero text readable */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
      {/* Narrow top strip — only darkens the navbar band, fades out quickly */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/55 to-transparent" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-8 px-6 py-16 lg:grid-cols-2 lg:gap-0 lg:px-12 lg:py-0 lg:min-h-[calc(100vh-72px)]">
        {/* Left — copy */}
        <div className="lg:py-16">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="eyebrow mb-6 !text-brand-gold"
          >
            Artisan Sweets & Baked Goods · Pune
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08 }}
            className="font-display text-display-lg text-white leading-[1.05] tracking-[-0.01em]"
          >
            Crafted with
            <br />
            <span className="italic text-brand-gold">rare cacao,</span>
            <br />
            made for you.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.18 }}
            className="mt-6 max-w-md text-base text-white/75 leading-relaxed"
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
            <Link
              href="/custom-order"
              className="btn-secondary !border-brand-gold !text-brand-gold !bg-brand-brown-deep/70 hover:!bg-brand-brown-deep/90 backdrop-blur-sm"
            >
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
                <span key={badge} className="flex items-center gap-1.5 text-xs text-white/65">
                  <span className="h-1 w-1 rounded-full bg-brand-gold" />
                  {badge}
                </span>
              )
            )}
          </motion.div>
        </div>

        {/* Right — empty col keeps the 2-col grid for text alignment */}
        <div />
      </div>
    </section>
  )
}
