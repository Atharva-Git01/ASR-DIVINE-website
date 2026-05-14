import type { Metadata } from 'next'
import { Cormorant_Garamond, DM_Sans } from 'next/font/google'
import { LocalBusinessSchema } from '@/components/seo/LocalBusinessSchema'
import './globals.css'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-dm-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'ASR Divine — Infinity Taste Eternal Delight',
    template: '%s | ASR Divine',
  },
  description:
    'Handcrafted sweets, cakes, chocolates & gifting experiences in Pune. 100% handcrafted. Eggless options available.',
  metadataBase: new URL('https://asrdivine.in'),
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://asrdivine.in',
    siteName: 'ASR Divine',
    title: 'ASR Divine',
    description:
      'Handcrafted sweets, cakes, chocolates & gifting experiences in Pune. 100% handcrafted. Eggless options available.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'ASR Divine handcrafted sweets and baked goods',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ASR Divine',
    description:
      'Handcrafted sweets, cakes, chocolates & gifting experiences in Pune. 100% handcrafted. Eggless options available.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${dmSans.variable}`}>
      <body>
        <LocalBusinessSchema />
        {children}
      </body>
    </html>
  )
}
