# Contributing to Cocoa & Crumb

## Prerequisites

| Tool    | Version    |
| ------- | ---------- |
| Node.js | 24.x       |
| pnpm    | 10.x       |
| Python  | 3.11+      |
| Git     | any recent |

---

## JavaScript / TypeScript

```bash
# Install dependencies
pnpm install

# Start dev server (http://localhost:3000)
pnpm dev

# Type-check
pnpm typecheck

# Unit tests (Vitest)
pnpm test

# Linting
pnpm lint
```

---

## Python Developer Tooling

All Python scripts live in `scripts/`. They use a local virtualenv named
`asrdivine` (the venv folder is git-ignored).

### First-time setup

```powershell
# Windows (PowerShell)
python -m venv asrdivine
asrdivine\Scripts\python.exe -m pip install -r requirements.txt
```

```bash
# macOS / Linux
python3 -m venv asrdivine
asrdivine/bin/pip install -r requirements.txt
```

### Activate the venv

```powershell
# Windows
.\asrdivine\Scripts\activate
```

```bash
# macOS / Linux
source asrdivine/bin/activate
```

### Available scripts

| Script                     | Purpose                                        |
| -------------------------- | ---------------------------------------------- |
| `scripts/seed.py`          | Seed Supabase with realistic test data         |
| `scripts/export_orders.py` | Export orders to CSV                           |
| `scripts/health_check.py`  | Hit all tRPC / API endpoints and report status |
| `scripts/validate_env.py`  | Validate `.env.local` before deploy            |

#### Seed the database

```bash
python scripts/seed.py                       # 20 products, 15 orders
python scripts/seed.py --products 30 --orders 20
python scripts/seed.py --clear               # clear old seed data first
```

#### Export orders to CSV

```bash
python scripts/export_orders.py             # last 30 days → orders.csv
python scripts/export_orders.py --days 90 --out report.csv
python scripts/export_orders.py --status delivered
python scripts/export_orders.py --all
```

#### Health check

```bash
python scripts/health_check.py                          # localhost:3000
python scripts/health_check.py --base-url https://cocoaandcrumb.in
```

#### Validate environment variables

```bash
python scripts/validate_env.py               # checks .env.local
python scripts/validate_env.py --strict      # also fail on missing optional vars
```

---

## Supabase migrations

Migrations live in `supabase/migrations/` and are numbered sequentially.

Apply them in order against your local or remote project:

```bash
# Using the Supabase CLI
supabase db push

# Or apply manually via Supabase SQL editor / psql
```

---

## Environment variables

Copy `.env.local.example` to `.env.local` and fill in all values.
Run `python scripts/validate_env.py` before deploying to catch missing vars.

Required vars are documented in `scripts/validate_env.py` and validated at
module load time via `src/lib/env.ts` (Zod schema).

---

## Commit conventions

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add gift-wrap option to checkout
fix: correct delivery charge threshold
chore: update dependencies
docs: add CONTRIBUTING guide
```
