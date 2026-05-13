import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // ── Colour palette ───────────────────────────────────────────────────────
      colors: {
        brand: {
          'brown-deep': '#2C1A0E', // primary CTA, headings
          'brown-mid': '#5C3D1E', // secondary elements
          'brown-warm': '#8B5E3C', // italic accents, hover states
          choc: '#3D1F0D', // dark panels, navbar bg
          gold: '#C8973A', // accent, highlights, badges
          'gold-light': '#E8C06A', // lighter gold for dark backgrounds
          cream: '#F5EFE0', // page background
          'cream-dark': '#EDE3CC', // hover background, input bg
          white: '#FDFAF4', // card background
          blush: '#E8CDB5', // soft accents, pill text on dark
          sage: '#7A8C6E', // success states, dietary tags
          'text-primary': '#1A0F07',
          'text-secondary': '#6B4C35',
        },
      },

      // ── Typography ───────────────────────────────────────────────────────────
      fontFamily: {
        display: ['var(--font-cormorant)', 'Cormorant Garamond', 'Georgia', 'serif'],
        body: ['var(--font-dm-sans)', 'DM Sans', 'sans-serif'],
        sans: ['var(--font-dm-sans)', 'DM Sans', 'sans-serif'],
      },
      fontSize: {
        'display-xl': ['4rem', { lineHeight: '1.05', fontWeight: '300' }],
        'display-lg': ['3.25rem', { lineHeight: '1.08', fontWeight: '300' }],
        'display-md': ['2.5rem', { lineHeight: '1.1', fontWeight: '400' }],
        'display-sm': ['2rem', { lineHeight: '1.15', fontWeight: '400' }],
        label: ['0.6875rem', { lineHeight: '1.4', letterSpacing: '0.08em' }],
      },

      // ── Spacing scale ────────────────────────────────────────────────────────
      spacing: {
        '4.5': '1.125rem',
        '18': '4.5rem',
        '22': '5.5rem',
        '26': '6.5rem',
        '30': '7.5rem',
        '88': '22rem',
        '104': '26rem',
        '112': '28rem',
        '120': '30rem',
        '128': '32rem',
      },

      // ── Border radius ────────────────────────────────────────────────────────
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.25rem',
        '4xl': '1.5rem',
        pill: '999px',
      },

      // ── Box shadows ──────────────────────────────────────────────────────────
      boxShadow: {
        'card-sm': '0 4px 16px rgba(44, 26, 14, 0.08)',
        card: '0 8px 24px rgba(44, 26, 14, 0.10)',
        'card-lg': '0 12px 40px rgba(44, 26, 14, 0.14)',
        'card-hover': '0 16px 48px rgba(44, 26, 14, 0.18)',
        float: '0 12px 40px rgba(44, 26, 14, 0.25)',
        browser: '0 40px 80px rgba(0, 0, 0, 0.35)',
      },

      // ── Background image helpers ─────────────────────────────────────────────
      backgroundImage: {
        'gradient-hero': 'linear-gradient(135deg, #5C3D1E 0%, #3D1F0D 50%, #8B5E3C 100%)',
        'gradient-product-1': 'linear-gradient(135deg, #8B5E3C, #5C3D1E)',
        'gradient-product-2': 'linear-gradient(135deg, #C8973A, #8B5E3C)',
        'gradient-product-3': 'linear-gradient(135deg, #3D1F0D, #8B5E3C)',
        'gradient-product-4': 'linear-gradient(135deg, #7A8C6E, #5C3D1E)',
      },

      // ── Z-index ──────────────────────────────────────────────────────────────
      zIndex: {
        navbar: '40',
        'cart-drawer': '50',
        modal: '60',
        toast: '70',
      },
    },
  },
  plugins: [],
}

export default config
