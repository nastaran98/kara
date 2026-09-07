export type Grade = 'got_it' | 'almost' | 'no'

export type QuoteCardBoxState = {
  box: number
  clearedCount: number
}

export type QuoteCardGradeResult = {
  box: number
  dueAt: Date
  clearedCount: number
}

const MAX_BOX = 5

// Ready is derived, never stored — a card qualifies once it has cleared
// two clean passes at Box 5. Exported so nothing re-derives this number.
export const READY_CLEARED_COUNT = 2

export function isQuoteCardReady(clearedCount: number): boolean {
  return clearedCount >= READY_CLEARED_COUNT
}

// Days until a card next comes due, per box.
const BOX_INTERVAL_DAYS: Record<number, number> = {
  1: 1,
  2: 3,
  3: 7,
  4: 16,
  5: 35,
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setUTCDate(result.getUTCDate() + days)
  return result
}

function dueAfter(today: Date, box: number): Date {
  return addDays(today, BOX_INTERVAL_DAYS[box])
}

export function gradeQuoteCard(
  card: QuoteCardBoxState,
  grade: Grade,
  today: Date,
): QuoteCardGradeResult {
  if (grade === 'no') {
    return {
      box: 1,
      dueAt: dueAfter(today, 1),
      clearedCount: 0,
    }
  }

  if (grade === 'almost') {
    return {
      box: card.box,
      dueAt: dueAfter(today, card.box),
      clearedCount: card.clearedCount,
    }
  }

  // got_it
  const alreadyAtMaxBox = card.box >= MAX_BOX
  const newBox = alreadyAtMaxBox ? MAX_BOX : card.box + 1

  return {
    box: newBox,
    dueAt: dueAfter(today, newBox),
    // clearedCount only advances toward Ready when a card that's already
    // maxed out its box clears another clean pass — promoting through the
    // earlier boxes doesn't count.
    clearedCount: alreadyAtMaxBox ? card.clearedCount + 1 : card.clearedCount,
  }
}
