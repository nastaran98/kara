import { describe, expect, it } from 'vitest'
import {
  getCurrentStreak,
  isStreakMilestone,
  reachedMilestoneToday,
  STREAK_MILESTONES,
} from './streak'

const TODAY = '2026-02-10'

// Reads like "3 days ago" for test authors, in the same YYYY-MM-DD key
// format the service layer derives from a Date.
function daysAgo(n: number): string {
  const date = new Date(`${TODAY}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() - n)
  return date.toISOString().slice(0, 10)
}

describe('getCurrentStreak', () => {
  it('no activity ever → streak of 0', () => {
    const result = getCurrentStreak([], TODAY)

    expect(result).toEqual({ currentStreak: 0, includesToday: false })
  })

  it('only today active (first day using the app) → streak of 1', () => {
    const result = getCurrentStreak([daysAgo(0)], TODAY)

    expect(result).toEqual({ currentStreak: 1, includesToday: true })
  })

  it('a clean run of consecutive days ending today counts every day', () => {
    const activeDates = [
      daysAgo(0),
      daysAgo(1),
      daysAgo(2),
      daysAgo(3),
      daysAgo(4),
    ]

    const result = getCurrentStreak(activeDates, TODAY)

    expect(result).toEqual({ currentStreak: 5, includesToday: true })
  })

  it("today not done yet doesn't break a streak that's clean through yesterday", () => {
    const activeDates = [daysAgo(1), daysAgo(2), daysAgo(3)]

    const result = getCurrentStreak(activeDates, TODAY)

    expect(result).toEqual({ currentStreak: 3, includesToday: false })
  })

  it('a single missed day sandwiched between active days is forgiven (grace)', () => {
    // Active today and days 2-4 ago; day 1 (yesterday) was missed.
    const activeDates = [daysAgo(0), daysAgo(2), daysAgo(3), daysAgo(4)]

    const result = getCurrentStreak(activeDates, TODAY)

    // The forgiven gap still counts toward the displayed length.
    expect(result).toEqual({ currentStreak: 5, includesToday: true })
  })

  it('two misses inside the same rolling 7-day window break the streak', () => {
    // Active today; days 1 and 2 ago both missed; days 3-6 ago active.
    const activeDates = [
      daysAgo(0),
      daysAgo(3),
      daysAgo(4),
      daysAgo(5),
      daysAgo(6),
    ]

    const result = getCurrentStreak(activeDates, TODAY)

    // Two misses in a row is a real break — only today counts, the older
    // run before the break is not bridged.
    expect(result).toEqual({ currentStreak: 1, includesToday: true })
  })

  it('a lone miss with nothing behind it never manufactures a streak', () => {
    // The only activity ever logged was 10 days ago; nothing since,
    // including yesterday and today.
    const activeDates = [daysAgo(10)]

    const result = getCurrentStreak(activeDates, TODAY)

    expect(result).toEqual({ currentStreak: 0, includesToday: false })
  })

  it('two isolated misses more than 7 days apart are each forgiven', () => {
    // Miss at day 1 (within today's window) and another isolated miss at
    // day 9 (its own separate rolling window) — neither window ever sees
    // two misses, so both are forgiven and the whole span counts.
    const activeDates = [
      daysAgo(0),
      daysAgo(2),
      daysAgo(3),
      daysAgo(4),
      daysAgo(5),
      daysAgo(6),
      daysAgo(7),
      daysAgo(8),
      daysAgo(10),
    ]

    const result = getCurrentStreak(activeDates, TODAY)

    expect(result).toEqual({ currentStreak: 11, includesToday: true })
  })
})

describe('milestones', () => {
  it('7, 30, and 100 are milestones; 8 is not', () => {
    expect(STREAK_MILESTONES).toEqual([7, 30, 100])
    expect(isStreakMilestone(7)).toBe(true)
    expect(isStreakMilestone(30)).toBe(true)
    expect(isStreakMilestone(100)).toBe(true)
    expect(isStreakMilestone(8)).toBe(false)
    expect(isStreakMilestone(0)).toBe(false)
  })

  it('reaching a milestone today is a celebration', () => {
    expect(
      reachedMilestoneToday({ currentStreak: 7, includesToday: true }),
    ).toBe(true)
  })

  it('a milestone streak only carried through yesterday does not celebrate today', () => {
    // The user hasn't done anything today yet — the milestone was
    // reached, but not "today", so nothing should fire on this visit.
    expect(
      reachedMilestoneToday({ currentStreak: 7, includesToday: false }),
    ).toBe(false)
  })

  it('a day past the milestone is no longer the celebration moment', () => {
    expect(
      reachedMilestoneToday({ currentStreak: 8, includesToday: true }),
    ).toBe(false)
  })
})
