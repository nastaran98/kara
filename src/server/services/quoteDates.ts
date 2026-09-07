// Box 1's interval (KARA-37) is 1 day — every freshly-added card, personal
// or from a collection, is due tomorrow. Shared so the "tomorrow" rule
// lives in exactly one place across the add-quote services.
const BOX_1_INTERVAL_DAYS = 1

export function tomorrow(today: Date = new Date()): Date {
  const due = new Date(today)
  due.setUTCDate(due.getUTCDate() + BOX_1_INTERVAL_DAYS)
  return due
}
