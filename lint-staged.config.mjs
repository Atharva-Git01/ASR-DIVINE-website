// lint-staged: only run prettier pre-commit to avoid Windows "command line too long".
// ESLint runs in CI (GitHub Actions) where paths are shorter.
export default {
  '*.{ts,tsx,js,jsx,json,md,css}': ['prettier --write'],
}
