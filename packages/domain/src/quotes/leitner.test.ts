import { describe, expect, it } from 'vitest'
import { gradeQuoteCard, isQuoteCardReady as isReady } from './leitner'

describe('gradeQuoteCard', () => {
  it('Box 1, got_it → Box 2, due in 3 days', () => {
    const today = new Date('2026-09-06T00:00:00Z')

    const result = gradeQuoteCard({ box: 1, clearedCount: 0 }, 'got_it', today)

    expect(result.box).toBe(2)
    expect(result.dueAt).toEqual(new Date('2026-09-09T00:00:00Z'))
    expect(result.clearedCount).toBe(0)
  })

  it('Box 3, almost → stays Box 3, due in 7 days', () => {
    const today = new Date('2026-09-06T00:00:00Z')

    const result = gradeQuoteCard({ box: 3, clearedCount: 0 }, 'almost', today)

    expect(result.box).toBe(3)
    expect(result.dueAt).toEqual(new Date('2026-09-13T00:00:00Z'))
    expect(result.clearedCount).toBe(0)
  })

  it('Box 4, no → Box 1, due tomorrow, clearedCount reset to 0', () => {
    const today = new Date('2026-09-06T00:00:00Z')

    const result = gradeQuoteCard({ box: 4, clearedCount: 0 }, 'no', today)

    expect(result.box).toBe(1)
    expect(result.dueAt).toEqual(new Date('2026-09-07T00:00:00Z'))
    expect(result.clearedCount).toBe(0)
  })

  it('Box 5, got_it → stays Box 5, clearedCount +1, due in 35 days', () => {
    const today = new Date('2026-09-06T00:00:00Z')

    const result = gradeQuoteCard({ box: 5, clearedCount: 0 }, 'got_it', today)

    expect(result.box).toBe(5)
    expect(result.dueAt).toEqual(new Date('2026-10-11T00:00:00Z'))
    expect(result.clearedCount).toBe(1)
  })

  it('clearedCount reaches 2 at Box 5 → card is Ready (test the condition, not a field)', () => {
    const today = new Date('2026-09-06T00:00:00Z')

    const first = gradeQuoteCard({ box: 5, clearedCount: 0 }, 'got_it', today)
    expect(isReady(first.clearedCount)).toBe(false)

    const second = gradeQuoteCard({ box: 5, clearedCount: first.clearedCount }, 'got_it', today)
    expect(second.clearedCount).toBe(2)
    expect(isReady(second.clearedCount)).toBe(true)
  })

  it('Box 5 with clearedCount 1, graded no → Box 1, clearedCount back to 0 (no grandfathering)', () => {
    const today = new Date('2026-09-06T00:00:00Z')

    const result = gradeQuoteCard({ box: 5, clearedCount: 1 }, 'no', today)

    expect(result.box).toBe(1)
    expect(result.dueAt).toEqual(new Date('2026-09-07T00:00:00Z'))
    expect(result.clearedCount).toBe(0)
    expect(isReady(result.clearedCount)).toBe(false)
  })
})
