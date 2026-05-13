'use client'

type Variant = { label: string; priceDelta: number }

type Props = {
  variants: Variant[]
  basePrice: number
  selected: number | null
  onChange: (index: number | null) => void
}

export function ProductVariantSelector({ variants, basePrice, selected, onChange }: Props) {
  if (variants.length === 0) return null

  return (
    <div>
      <p className="text-xs font-medium text-brand-text-secondary uppercase tracking-wider mb-2">
        Size / Option
      </p>
      <div className="flex flex-wrap gap-2">
        {variants.map((v, i) => {
          const price = basePrice + v.priceDelta
          const isActive = selected === i
          return (
            <button
              key={i}
              onClick={() => onChange(isActive ? null : i)}
              className={`px-4 py-2 rounded-xl border text-sm transition-all ${
                isActive
                  ? 'bg-brand-brown-deep text-brand-cream border-brand-brown-deep'
                  : 'text-brand-text-secondary hover:border-brand-brown-deep hover:text-brand-brown-deep'
              }`}
              style={!isActive ? { borderColor: 'rgba(44,26,14,0.20)' } : undefined}
            >
              <span className="font-medium">{v.label}</span>
              <span className={`ml-2 text-xs ${isActive ? 'text-brand-cream/70' : 'text-brand-text-secondary'}`}>
                ₹{price.toLocaleString('en-IN')}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
