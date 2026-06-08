import type { Metadata } from 'next'
import { MenuClient } from '@/components/menu/MenuClient'

export const metadata: Metadata = {
  title: 'Menu — ASR Divine',
  description:
    'Browse the full ASR Divine menu — artisan breads, handcrafted chocolates, celebration cakes, cookies, puffs, savouries and more. All made fresh in Pune.',
}

export default function MenuPage() {
  return <MenuClient />
}
