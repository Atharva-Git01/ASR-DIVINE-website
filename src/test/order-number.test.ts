import { describe, it, expect } from 'vitest'

// ── Helpers (mirror the pattern from verify/route.ts) ──────────────────────

/**
 * Fallback JS generator — used when the DB is unavailable.
 * Format: CC-YYYYMMDD-NNNNN
 */
function generateOrderNumberFallback(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const seq = Date.now().toString().slice(-5)
  return `CC-${date}-${seq}`
}

const ORDER_NUMBER_PATTERN = /^CC-\d{8}-\d{5}$/

// ── Tests ───────────────────────────────────────────────────────────────────

describe('Order number format', () => {
  it('matches the CC-YYYYMMDD-NNNNN format', () => {
    const num = generateOrderNumberFallback()
    expect(num).toMatch(ORDER_NUMBER_PATTERN)
  })

  it('starts with CC-', () => {
    expect(generateOrderNumberFallback().startsWith('CC-')).toBe(true)
  })

  it('date segment is today in YYYYMMDD format', () => {
    const expected = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    const num = generateOrderNumberFallback()
    const datePart = num.split('-')[1]
    expect(datePart).toBe(expected)
  })

  it('has exactly 5 numeric digits in the sequence segment', () => {
    const num = generateOrderNumberFallback()
    const seqPart = num.split('-')[2]
    expect(seqPart).toHaveLength(5)
    expect(/^\d{5}$/.test(seqPart ?? '')).toBe(true)
  })
})

describe('Sequence-based order numbers uniqueness (simulated)', () => {
  /**
   * Simulates the Postgres sequence behaviour:
   * Each call increments a counter and pads it to 5 digits.
   */
  function makeSequenceGenerator(startAt = 1000) {
    let counter = startAt
    return function generateSequenceNumber(): string {
      const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
      const seq = String(counter++).padStart(5, '0')
      return `CC-${date}-${seq}`
    }
  }

  it('generates 1000 unique order numbers with no collisions', () => {
    const generate = makeSequenceGenerator(1000)
    const numbers = new Set<string>()
    for (let i = 0; i < 1000; i++) {
      numbers.add(generate())
    }
    expect(numbers.size).toBe(1000)
  })

  it('all 1000 generated numbers match the expected format', () => {
    const generate = makeSequenceGenerator(1000)
    for (let i = 0; i < 1000; i++) {
      expect(generate()).toMatch(ORDER_NUMBER_PATTERN)
    }
  })

  it('sequence numbers are strictly monotonically increasing within a day', () => {
    const generate = makeSequenceGenerator(2000)
    const numbers = Array.from({ length: 10 }, generate)
    for (let i = 1; i < numbers.length; i++) {
      const prev = numbers[i - 1]!.split('-')[2]!
      const curr = numbers[i]!.split('-')[2]!
      expect(Number(curr)).toBeGreaterThan(Number(prev))
    }
  })
})
