type Props = {
  address?: string
  phone?: string
  email?: string
}

export function LocalBusinessSchema({
  address = 'Cocoa & Crumb Studio, Pune, Maharashtra 411001',
  phone = '+91 98765 43210',
  email = 'orders@cocoaandcrumb.in',
}: Props) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': ['Bakery', 'LocalBusiness'],
    name: 'Cocoa & Crumb',
    description:
      'Artisan chocolatier and bakery in Pune, specialising in bean-to-bar single-origin chocolates, celebration cakes, and gifting hampers.',
    url: 'https://cocoaandcrumb.in',
    telephone: phone,
    email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: address,
      addressLocality: 'Pune',
      addressRegion: 'Maharashtra',
      postalCode: '411001',
      addressCountry: 'IN',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 18.5204,
      longitude: 73.8567,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '10:00',
        closes: '19:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Saturday', 'Sunday'],
        opens: '10:00',
        closes: '20:00',
      },
    ],
    servesCuisine: 'Confectionery',
    priceRange: '₹₹',
    image: 'https://cocoaandcrumb.in/og-image.jpg',
    sameAs: [
      'https://www.instagram.com/cocoaandcrumb',
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
