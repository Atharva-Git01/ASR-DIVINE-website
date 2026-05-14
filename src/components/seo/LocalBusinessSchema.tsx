type Props = {
  address?: string
  phone?: string
  email?: string
}

export function LocalBusinessSchema({
  address = '446 Shukratara Building, 3rd Floor, Flat No. 301, Shukrwar Peth, Pune – 411002',
  phone = '+91 70709 19197',
  email = 'asrdivine2026@gmail.com',
}: Props) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': ['Bakery', 'LocalBusiness'],
    name: 'ASR Divine',
    description:
      'Handcrafted sweets, cakes, chocolates & gifting experiences in Pune. 100% handcrafted. Eggless options available.',
    url: 'https://asrdivine.in',
    telephone: phone,
    email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: address,
      addressLocality: 'Pune',
      addressRegion: 'Maharashtra',
      postalCode: '411002',
      addressCountry: 'IN',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 18.505658,
      longitude: 73.858131,
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
    image: 'https://asrdivine.in/og-image.jpg',
    sameAs: [
      'https://www.instagram.com/asr_divine',
      'https://www.facebook.com/share/17hvB5JEBx/',
      'https://x.com/ASRDivine2026',
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
