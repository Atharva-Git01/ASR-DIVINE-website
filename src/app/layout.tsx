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
    default: 'Cocoa & Crumb — Artisan Bakery & Chocolates, Pune',
    template: '%s | Cocoa & Crumb',
  },
  description:
    'Small-batch artisan baking and premium handcrafted chocolates in Pune. Custom cakes, chocolate gift boxes, fresh pastries — made with love every day.',
  metadataBase: new URL('https://cocoaandcrumb.in'),
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://cocoaandcrumb.in',
    siteName: 'Cocoa & Crumb',
    title: 'Cocoa & Crumb — Artisan Bakery & Chocolates, Pune',
    description:
      'Handcrafted chocolates, custom cakes, and fresh pastries from our artisan kitchen in Pune.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Cocoa & Crumb artisan bakery and chocolates',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cocoa & Crumb — Artisan Bakery & Chocolates, Pune',
    description:
      'Handcrafted chocolates, custom cakes, and fresh pastries from our artisan kitchen in Pune.',
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
