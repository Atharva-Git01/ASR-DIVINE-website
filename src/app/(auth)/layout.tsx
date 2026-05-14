export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-brand-cream flex flex-col items-center justify-center px-4 py-16">
      <a href="/" className="mb-10 font-display text-2xl italic text-brand-brown-deep">
        ASR Divine
      </a>
      {children}
    </div>
  )
}
