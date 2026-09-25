export type StreakResult = {
  currentStreak: number
  includesToday: boolean
}

// At most one missed day per rolling 7-day window is auto-forgiven — no
// user action, no "freeze" inventory. This is what "gamify without shame"
// means mechanically: a single busy day never resets the count.
export const STREAK_GRACE_DAYS = 1
export const STREAK_GRACE_WINDOW_DAYS = 7

export const STREAK_MILESTONES = [7, 30, 100] as const

function addDaysToKey(dateKey: string, days: number): string {
  const date = new Date(`${dateKey}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

// Walks backward from today (or yesterday, when today hasn't happened
// yet) counting consecutive active days, forgiving at most one missed day
// per rolling 7-day window along the way.
//
// A forgiven day only counts when it's bridged by real activity on both
// sides — a walk that ends on a forgiven miss (nothing further back to
// justify it) trims that trailing miss back off, so a single stale day of
// activity years ago can never manufacture a live streak out of ongoing
// silence.
export function getCurrentStreak(
  activeDates: Iterable<string>,
  todayKey: string,
): StreakResult {
  const activeDateKeys = new Set(activeDates)

  if (activeDateKeys.size === 0) {
    return { currentStreak: 0, includesToday: false }
  }

  const minActiveKey = [...activeDateKeys].sort()[0]
  const includesToday = activeDateKeys.has(todayKey)

  // Chronological order, most recent first.
  const path: boolean[] = []
  const window: boolean[] = []

  let offset = includesToday ? 0 : 1

  while (true) {
    const dateKey = addDaysToKey(todayKey, -offset)
    if (dateKey < minActiveKey) {
      // Nothing before the first day of recorded activity can be part of
      // a streak — there's no earlier active day left to bridge a miss.
      break
    }

    const isActive = activeDateKeys.has(dateKey)
    window.push(isActive)
    if (window.length > STREAK_GRACE_WINDOW_DAYS) {
      window.shift()
    }

    if (!isActive) {
      const missesInWindow = window.filter((day) => !day).length
      if (missesInWindow > STREAK_GRACE_DAYS) {
        break
      }
    }

    path.push(isActive)
    offset += 1
  }

  while (path.length > 0 && path[path.length - 1] === false) {
    path.pop()
  }

  return { currentStreak: path.length, includesToday }
}

export function isStreakMilestone(streak: number): boolean {
  return (STREAK_MILESTONES as readonly number[]).includes(streak)
}

// A milestone only celebrates on the day it's actually reached by doing
// something — not on a later visit where the count merely still shows a
// past milestone value, and not while today's activity is still pending.
export function reachedMilestoneToday(streak: StreakResult): boolean {
  return streak.includesToday && isStreakMilestone(streak.currentStreak)
}
