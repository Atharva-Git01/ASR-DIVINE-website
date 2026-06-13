/**
 * Ensures NODE_ENV is "development" before Next.js starts.
 * Needed because pnpm 10+ injects NODE_ENV=production for lifecycle scripts,
 * which breaks next-flight-css-loader (it returns raw CSS in production mode
 * instead of the JS hash module webpack expects).
 */
if (!process.env.NODE_ENV || process.env.NODE_ENV !== 'development') {
  process.env.NODE_ENV = 'development'
}
