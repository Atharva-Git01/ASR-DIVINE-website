'use client'

import { forwardRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { MENU_CATEGORIES, MENU_NAV, type MenuCategory } from '@/data/menu'

// Rich dark accent per category (hex, for inline styles — avoids dynamic Tailwind class purging)
const CAT_ACCENT: Record<string, string> = {
  breads: '#78350f',
  cookies: '#92400e',
  chocolates: '#292524',
  'panni-chocolates': '#431407',
  cakes: '#881337',
  sponge: '#b45309',
  'dry-cakes': '#7c2d12',
  spreads: '#451a03',
  'puffs-croissants': '#854d0e',
  'tarts-pies': '#450a0a',
  'mousse-cheesecake': '#500724',
  'granola-health': '#14532d',
  'cashews-crackers': '#713f12',
  savouries: '#7f1d1d',
  signature: '#1c1917',
}

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
  signature: '★',
}

const TOTAL_ITEMS = MENU_CATEGORIES.reduce(
  (acc, c) =>
    acc +
    (c.items?.length ?? 0) +
    (c.subSections?.reduce((a, s) => a + s.items.length, 0) ?? 0),
  0
)

function getCatItemCount(cat: MenuCategory) {
  return (
    (cat.items?.length ?? 0) +
    (cat.subSections?.reduce((a, s) => a + s.items.length, 0) ?? 0)
  )
}

export function MenuClient() {
  const [activeFilter, setActiveFilter] = useState<string>('all')
  const [query, setQuery] = useState('')

  const visibleCategories =
    activeFilter === 'all'
      ? MENU_CATEGORIES
      : MENU_CATEGORIES.filter((c) => c.id === activeFilter)

  const displayed = query.trim()
    ? visibleCategories
        .map((cat) => {
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
        })
        .filter(
          (cat) =>
            (cat.items?.length ?? 0) +
              (cat.subSections?.reduce((a, s) => a + s.items.length, 0) ?? 0) >
            0
        )
    : visibleCategories

  const totalShown = displayed.reduce(
    (acc, cat) =>
      acc +
      (cat.items?.length ?? 0) +
      (cat.subSections?.reduce((a, s) => a + s.items.length, 0) ?? 0),
    0
  )

  function handleFilterClick(id: string) {
    setActiveFilter(id)
    setQuery('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="bg-brand-cream min-h-screen">
      {/* ── Content Area ──────────────────────────────────────────────────── */}
      <div className="flex items-start">

          {/* ── Desktop Sidebar ──────────────────────────────────────────── */}
          <aside className="hidden lg:flex flex-col w-48 xl:w-56 shrink-0 sticky top-[calc(72px)] self-start min-h-[calc(100vh-72px)] pt-6 border-r" style={{ borderColor: 'rgba(44,26,14,0.10)' }}>
            <p className="text-[9px] font-bold tracking-[0.18em] uppercase text-brand-text-secondary mb-2.5 pl-5">
              Categories
            </p>

            <nav className="flex flex-col gap-0.5">
              {/* All */}
              <button
                onClick={() => handleFilterClick('all')}
                className={`w-full pl-5 pr-3 py-2 text-left text-[11px] font-medium transition-all ${
                  activeFilter === 'all'
                    ? 'bg-brand-brown-deep/8 text-brand-brown-deep border-l-2 border-brand-brown-deep'
                    : 'text-brand-text-secondary hover:text-brand-brown-deep hover:bg-brand-brown-deep/[0.05] border-l-2 border-transparent'
                }`}
              >
                All
              </button>

              {MENU_NAV.map(({ id, name }) => {
                const cat = MENU_CATEGORIES.find((c) => c.id === id)
                const accent = CAT_ACCENT[id] ?? '#2c1a0e'
                return (
                  <button
                    key={id}
                    onClick={() => handleFilterClick(id)}
                    className={`w-full pl-5 pr-3 py-2 text-left text-[11px] font-medium transition-all ${
                      activeFilter === id
                        ? 'bg-brand-brown-deep/8 text-brand-brown-deep border-l-2 border-brand-brown-deep'
                        : 'text-brand-text-secondary hover:text-brand-brown-deep hover:bg-brand-brown-deep/[0.05] border-l-2 border-transparent'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ backgroundColor: activeFilter === id ? '#2c1a0e' : accent }}
                      />
                      {name}
                    </span>
                  </button>
                )
              })}
            </nav>

            {/* Custom order mini CTA */}
            <div
              className="mt-5 pt-4 border-t px-5"
              style={{ borderColor: 'rgba(44,26,14,0.10)' }}
            >
              <p className="text-[9px] leading-relaxed text-brand-text-secondary mb-2">
                Don&apos;t see what you need?
              </p>
              <Link
                href="/custom-order"
                className="block text-center text-[10px] font-semibold tracking-wide py-2 px-3 rounded-lg bg-brand-brown-deep/8 text-brand-brown-deep hover:bg-brand-brown-deep hover:text-brand-cream transition-all border border-brand-brown-deep/18 hover:border-brand-brown-deep"
              >
                Custom Order ↗
              </Link>
            </div>
          </aside>

          {/* ── Main Content ─────────────────────────────────────────────── */}
          <div className="flex-1 min-w-0 py-6 px-6 lg:px-8">

            {/* Mobile category pills */}
            <div className="lg:hidden flex gap-1.5 overflow-x-auto pb-3 mb-3 scrollbar-none -mx-1 px-1">
              <button
                onClick={() => handleFilterClick('all')}
                className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-[11px] font-medium tracking-wide transition-all whitespace-nowrap border ${
                  activeFilter === 'all'
                    ? 'bg-brand-brown-deep text-brand-cream border-brand-brown-deep shadow-sm'
                    : 'text-brand-text-secondary border-brand-brown-deep/15 hover:text-brand-brown-deep hover:bg-brand-brown-deep/[0.07]'
                }`}
              >
                All
              </button>
              {MENU_NAV.map(({ id, name }) => (
                <button
                  key={id}
                  onClick={() => handleFilterClick(id)}
                  className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-[11px] font-medium tracking-wide transition-all whitespace-nowrap border ${
                    activeFilter === id
                      ? 'bg-brand-brown-deep text-brand-cream border-brand-brown-deep shadow-sm'
                      : 'text-brand-text-secondary border-brand-brown-deep/15 hover:text-brand-brown-deep hover:bg-brand-brown-deep/[0.07]'
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>

            {/* Results meta */}
            {(query.trim() || activeFilter !== 'all') && (
              <div className="mb-4 flex items-center justify-between">
                <p className="text-[11px] text-brand-text-secondary">
                  {query.trim() ? (
                    <>
                      <span className="font-medium text-brand-brown-deep">{totalShown}</span>{' '}
                      result{totalShown !== 1 ? 's' : ''} for &ldquo;{query}&rdquo;
                    </>
                  ) : (
                    <>
                      Showing{' '}
                      <span className="font-medium text-brand-brown-deep">
                        {MENU_NAV.find((n) => n.id === activeFilter)?.name}
                      </span>{' '}
                      &mdash; {totalShown} items
                    </>
                  )}
                </p>
                <button
                  onClick={() => {
                    setQuery('')
                    setActiveFilter('all')
                  }}
                  className="text-[10px] text-brand-gold hover:underline underline-offset-2"
                >
                  Clear
                </button>
              </div>
            )}

            {/* Category sections */}
            <div className="space-y-8">
              {displayed.map((cat) => (
                <CategorySection key={cat.id} cat={cat} />
              ))}

              {displayed.length === 0 && (
                <div className="text-center py-24">
                  <p className="text-2xl mb-3">🔍</p>
                  <p className="text-brand-text-secondary text-sm">
                    No items match &ldquo;{query}&rdquo;
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
          </div>
      </div>

      {/* ── Footer CTA ────────────────────────────────────────────────────── */}
      <div className="bg-brand-brown-deep py-14 text-center mt-6">
        <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-brand-gold mb-3">
          Can&apos;t find what you&apos;re looking for?
        </p>
        <h2 className="font-display text-[1.5rem] sm:text-display-sm text-white italic mb-6">
          We make it custom.
        </h2>
        <Link href="/custom-order" className="btn-primary">
          Place a Custom Order
        </Link>
      </div>
    </div>
  )
}

// ── Category Section ──────────────────────────────────────────────────────────

const CategorySection = forwardRef<HTMLElement, { cat: MenuCategory }>(
  function CategorySection({ cat }, ref) {
    const allItems = cat.items ?? []
    const subs = cat.subSections ?? []
    const accent = CAT_ACCENT[cat.id] ?? '#2c1a0e'
    const totalCount = getCatItemCount(cat)

    return (
      <section id={cat.id} ref={ref} className="scroll-mt-20">

        {/* Category header — image with gradient overlay */}
        <div className="relative rounded-xl overflow-hidden mb-4 h-[5.5rem] sm:h-[6.5rem]">
          <Image
            src={cat.image}
            alt={cat.name}
            fill
            className="object-cover object-center"
            sizes="(max-width: 1024px) 100vw, calc(100vw - 12rem)"
          />
          {/* Rich left-to-right gradient */}
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(105deg, ${accent}f2 0%, ${accent}cc 50%, ${accent}66 100%)`,
            }}
          />
          {/* Gold accent bar on left edge */}
          <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-brand-gold opacity-70" />

          <div className="absolute inset-0 flex items-center px-5 sm:px-6">
            <div className="flex-1 min-w-0">
              <h2 className="font-display text-lg sm:text-xl md:text-2xl text-white italic leading-tight truncate">
                {cat.name}
              </h2>
              <p className="text-white/65 text-[10px] sm:text-xs mt-0.5 leading-relaxed line-clamp-1 max-w-xs sm:max-w-sm">
                {cat.description}
              </p>
            </div>
            <div className="ml-4 shrink-0 text-right hidden sm:block">
              <span className="inline-flex items-center gap-1 text-[10px] text-white/50 bg-white/10 px-2 py-1 rounded-full">
                <svg
                  className="w-3 h-3 opacity-60"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" />
                </svg>
                {totalCount} items
              </span>
            </div>
          </div>
        </div>

        {/* Flat items */}
        {allItems.length > 0 && <ItemGrid items={allItems} accent={accent} />}

        {/* Sub-sections */}
        {subs.map((sub) => (
          <div key={sub.title} className="mt-5">
            <div
              className="flex items-center gap-2 mb-3 pb-1.5 border-b"
              style={{ borderColor: 'rgba(44,26,14,0.10)' }}
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: accent }}
              />
              <h3 className="text-[10px] font-bold tracking-[0.15em] uppercase text-brand-text-secondary">
                {sub.title}
              </h3>
              <span className="text-[9px] text-brand-text-secondary/50 tabular-nums">
                ({sub.items.length})
              </span>
            </div>
            <ItemGrid items={sub.items} accent={accent} />
          </div>
        ))}
      </section>
    )
  }
)

// ── Item Grid & Card ──────────────────────────────────────────────────────────

function ItemGrid({
  items,
  accent,
}: {
  items: { name: string; tags?: string[] }[]
  accent: string
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-2">
      {items.map((item) => (
        <ItemCard key={item.name} item={item} accent={accent} />
      ))}
    </div>
  )
}

function ItemCard({
  item,
  accent,
}: {
  item: { name: string; tags?: string[] }
  accent: string
}) {
  const isSignature = item.tags?.includes('signature')
  const otherTags = (item.tags ?? []).filter((t) => t !== 'signature')

  return (
    <div
      className="bg-brand-white rounded-lg overflow-hidden border hover:shadow-md hover:border-brand-gold/30 transition-all duration-200 group cursor-default"
      style={{ borderColor: 'rgba(44,26,14,0.07)' }}
    >
      {/* Coloured accent strip at top */}
      <div className="h-[3px]" style={{ backgroundColor: accent }} />

      <div className="px-3 py-2.5">
        {/* Name row */}
        <div className="flex items-start gap-1 mb-1.5">
          <span className="flex-1 text-[11px] font-medium text-brand-text-primary leading-snug group-hover:text-brand-brown-deep transition-colors min-w-0">
            {item.name}
          </span>
          {isSignature && (
            <span
              className="text-[10px] shrink-0 mt-px leading-none"
              title="Signature item"
              style={{ color: '#d97706' }}
            >
              ★
            </span>
          )}
        </div>

        {/* Tag badges */}
        {otherTags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {otherTags.map((tag) => (
              <span
                key={tag}
                className={`inline-flex items-center text-[8px] font-semibold px-1.5 py-[2px] rounded-sm border tracking-wide ${
                  TAG_STYLES[tag] ?? 'bg-gray-800/40 text-gray-300 border-gray-600/40'
                }`}
              >
                {TAG_LABELS[tag] ?? tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
