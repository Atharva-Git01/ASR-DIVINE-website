import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { CartDrawer } from '@/components/layout/CartDrawer'
import { resolvePublicRootImage } from '@/lib/resolve-asset'

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  const logoSrc = resolvePublicRootImage('logo')

  return (
    <>
      <Navbar logoSrc={logoSrc} />
      <main className="pt-[72px]">{children}</main>
      <Footer logoSrc={logoSrc} />
      <CartDrawer />
    </>
  )
}
