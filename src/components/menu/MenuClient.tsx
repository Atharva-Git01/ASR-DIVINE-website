'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { MENU_CATEGORIES, MENU_NAV, type MenuCategory } from '@/data/menu'

const TAG_STYLES: Record<string, string> = {
  eggless: 'bg-emerald-900/60 text-emerald-200 border-emerald-700/40',
  vegan: 'bg-green-900/60 text-green-200 border-green-700/40',
  'gluten-free': 'bg-sky-900/60 text-sky-200 border-sky-700/40',
  'sugar-free': 'bg-violet-900/60 text-violet-200 border-violet-700/40',
  signature: 'bg-amber-900/60 text-amber-200 border-amber-700/40',
}

const TAG_LABELS: Record<string, string> = {
  eggless: 'Eggless',
  vegan: 'Vegan',
  'gluten-free': 'GF',
  'sugar-free': 'Sugar-Free',
  signature: '★ Signature',
}

export function MenuClient() {
  const [activeId, setActiveId] = useState(MENU_CATEGORIES[0]?.id ?? '')
  const [query, setQuery] = useState('')
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({})

  // Scrollspy — highlight active category on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        }
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: 0 }
    )
    Object.values(sectionRefs.current).forEach((el) => el && observer.observe(el))
    return () => observer.disconnect()
  }, [])

  function scrollTo(id: string) {
    const el = document.getElementById(id)
    if (el) {
      const offset = 80
      const y = el.getBoundingClientRect().top + window.scrollY - offset
      window.scrollTo({ top: y, behavior: 'smooth' })
    }
    setActiveId(id)
  }

  // Filter by search query
  const filtered = query.trim()
    ? MENU_CATEGORIES.map((cat) => {
        const q = query.toLowerCase()

        const filteredItems = (cat.items ?? []).filter((item) =>
          item.name.toLowerCase().includes(q)
        )

        const filteredSubs = (cat.subSections ?? [])
          .map((sub) => ({
            ...sub,
            items: sub.items.filter((item) => item.name.toLowerCase().includes(q)),
          }))
          .filter((sub) => sub.items.length > 0)

        return { ...cat, items: filteredItems, subSections: filteredSubs }
      }).filter(
        (cat) =>
          (cat.items?.length ?? 0) +
            (cat.subSections?.reduce((a, s) => a + s.items.length, 0) ?? 0) >
          0
      )
    : MENU_CATEGORIES

  return (
    <div className="bg-brand-cream min-h-screen">
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-brand-brown-deep -mt-[72px] min-h-[360px] flex items-end">
        <Image
          src="https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=1600&q=80"
          alt="ASR Divine menu"
          fill
          className="object-cover object-center opacity-30"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-brown-deep via-brand-brown-deep/60 to-transparent" />
        <div className="relative mx-auto max-w-7xl w-full px-6 lg:px-12 pb-12 pt-32">
          <p className="eyebrow mb-3 text-brand-gold">Our Offerings</p>
          <h1 className="font-display text-display-lg text-white italic leading-tight">
            The ASR Divine Menu
          </h1>
          <p className="mt-3 text-brand-cream/70 max-w-xl text-sm leading-relaxed">
            14 categories, hundreds of handcrafted creations — from artisan breads to luxury
            chocolates. Everything made in-house with rare cacao and finest ingredients.
          </p>
        </div>
      </div>

      {/* ── Sticky category nav + search ────────────────────────────────── */}
      <div
        className="sticky top-[72px] z-30 bg-brand-white/95 backdrop-blur-sm border-b shadow-sm"
        style={{ borderColor: 'rgba(44,26,14,0.10)' }}
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          {/* Search */}
          <div className="py-3 flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text-secondary w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                viewBox="0 0 24 24"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search menu items..."
                className="w-full pl-9 pr-4 py-2 text-sm rounded-full border bg-brand-cream/60 focus:outline-none focus:border-brand-brown-deep/40 placeholder:text-brand-text-secondary/50"
                style={{ borderColor: 'rgba(44,26,14,0.15)' }}
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-text-secondary hover:text-brand-brown-deep"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            <span className="text-xs text-brand-text-secondary hidden sm:block">
              {MENU_CATEGORIES.reduce(
                (acc, c) =>
                  acc +
                  (c.items?.length ?? 0) +
                  (c.subSections?.reduce((a, s) => a + s.items.length, 0) ?? 0),
                0
              )}{' '}
              items across {MENU_CATEGORIES.length} categories
            </span>
          </div>

          {/* Category tabs — horizontal scroll */}
          <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-none -mx-1 px-1">
            {MENU_NAV.map(({ id, name }) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs tracking-wide transition-all whitespace-nowrap ${
                  activeId === id
                    ? 'bg-brand-brown-deep text-brand-cream'
                    : 'text-brand-text-secondary hover:text-brand-brown-deep hover:bg-brand-cream'
                }`}
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Category sections ────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-6 lg:px-12 py-10 space-y-16">
        {filtered.map((cat) => (
          <CategorySection
            key={cat.id}
            cat={cat}
            ref={(el) => {
              sectionRefs.current[cat.id] = el
            }}
          />
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-24">
            <p className="text-brand-text-secondary text-sm">
              No items found for &quot;{query}&quot;
            </p>
            <button
              onClick={() => setQuery('')}
              className="mt-3 text-xs text-brand-gold underline underline-offset-2"
            >
              Clear search
            </button>
          </div>
        )}
      </div>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <div className="bg-brand-brown-deep py-16 text-center">
        <p className="eyebrow text-brand-gold mb-3">
          Can&apos;t find what you&apos;re looking for?
        </p>
        <h2 className="font-display text-display-sm text-white italic mb-6">We make it custom.</h2>
        <Link href="/custom-order" className="btn-primary">
          Place a Custom Order
        </Link>
      </div>
    </div>
  )
}

// ── Category section ──────────────────────────────────────────────────────────

import { forwardRef } from 'react'

const CategorySection = forwardRef<HTMLElement, { cat: MenuCategory }>(function CategorySection(
  { cat },
  ref
) {
  const allItems = cat.items ?? []
  const subs = cat.subSections ?? []

  return (
    <section id={cat.id} ref={ref} className="scroll-mt-40">
      {/* Section header */}
      <div className="relative overflow-hidden rounded-2xl mb-6 h-44 flex items-end">
        <Image
          src={cat.image}
          alt={cat.name}
          fill
          className="object-cover object-center"
          sizes="(max-width: 768px) 100vw, 1200px"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-transparent" />
        <div className="relative px-6 pb-6">
          <h2 className="font-display text-display-sm text-white italic">{cat.name}</h2>
          <p className="text-white/65 text-xs mt-1 max-w-lg">{cat.description}</p>
        </div>
      </div>

      {/* Items */}
      {allItems.length > 0 && <ItemGrid items={allItems} />}

      {subs.map((sub) => (
        <div key={sub.title} className="mt-6">
          <h3 className="text-xs font-semibold tracking-widest text-brand-text-secondary uppercase mb-3">
            {sub.title}
          </h3>
          <ItemGrid items={sub.items} />
        </div>
      ))}
    </section>
  )
})

// ── Item grid ─────────────────────────────────────────────────────────────────

function ItemGrid({ items }: { items: { name: string; tags?: string[] }[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
      {items.map((item) => (
        <div
          key={item.name}
          className="bg-brand-white rounded-xl px-4 py-3 flex flex-col gap-1.5 border hover:border-brand-gold/40 hover:shadow-sm transition-all group"
          style={{ borderColor: 'rgba(44,26,14,0.08)' }}
        >
          <span className="text-xs font-medium text-brand-text-primary leading-snug group-hover:text-brand-brown-deep transition-colors">
            {item.name}
          </span>
          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className={`inline-flex items-center text-[9px] font-medium px-1.5 py-0.5 rounded border ${TAG_STYLES[tag] ?? 'bg-gray-800/40 text-gray-300 border-gray-600/40'}`}
                >
                  {TAG_LABELS[tag] ?? tag}
                </span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
