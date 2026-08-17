// src/domain/shared/to-local-date-key.test.ts

import { describe, expect, it } from 'vitest'
import { toLocalDateKey } from './to-local-date-key'

describe('toLocalDateKey', () => {
  it('maps the same late UTC instant to different calendar days by timezone', () => {
    const instant = new Date('2026-08-16T21:00:00Z')

    expect(toLocalDateKey(instant, 'Asia/Tehran')).toBe('2026-08-17')
    expect(toLocalDateKey(instant, 'Europe/Copenhagen')).toBe('2026-08-16')
  })

  it('returns the correct local date across midnight and DST boundaries', () => {
    expect(
      toLocalDateKey(new Date('2026-08-16T20:31:00Z'), 'Asia/Tehran'),
    ).toBe('2026-08-17')

    expect(
      toLocalDateKey(
        new Date('2026-10-24T22:30:00Z'),
        'Europe/Copenhagen',
      ),
    ).toBe('2026-10-25')
  })

  it('handles half-hour offset timezones', () => {
    const instant = new Date('2026-08-16T20:45:00Z')

    expect(toLocalDateKey(instant, 'Asia/Tehran')).toBe('2026-08-17')
  })

  it('throws for an invalid date', () => {
    expect(() =>
      toLocalDateKey(new Date('invalid'), 'Europe/Copenhagen'),
    ).toThrow()
  })

  it('throws for an invalid timezone', () => {
    expect(() =>
      toLocalDateKey(new Date('2026-08-16T21:00:00Z'), 'Invalid/Timezone'),
    ).toThrow()
  })
})