type Props = {
  label: string
  value: string | number
  sub?: string
  accent?: boolean
}

export function StatCard({ label, value, sub, accent }: Props) {
  return (
    <div
      className="rounded-2xl p-5 border"
      style={{
        background: accent ? 'rgba(200,151,58,0.10)' : 'rgba(255,255,255,0.04)',
        borderColor: accent ? 'rgba(200,151,58,0.25)' : 'rgba(200,151,58,0.08)',
      }}
    >
      <p className="text-xs text-brand-gold/50 uppercase tracking-widest mb-2">{label}</p>
      <p className={`text-2xl font-semibold ${accent ? 'text-brand-gold' : 'text-brand-cream'}`}>
        {value}
      </p>
      {sub && <p className="mt-1 text-xs text-brand-gold/40">{sub}</p>}
    </div>
  )
}
