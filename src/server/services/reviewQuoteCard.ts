import { gradeQuoteCard, type Grade } from "@kara/domain"
import {
  getUserQuoteCard,
  updateQuoteCardGrade,
} from "@/server/repositories/quote.repo"

// Grading a card touches two layers that must agree: the domain rule
// (KARA-37, which box/dueAt/clearedCount come next) and the write itself.
// The service is what knows both steps have to happen together, scoped to
// a card the user actually owns.
export async function reviewQuoteCard(
  userId: string,
  quoteCardId: string,
  grade: Grade,
  today: Date = new Date(),
) {
  const card = await getUserQuoteCard(userId, quoteCardId)

  if (!card) {
    return { ok: false as const, error: "Card not found." }
  }

  const result = gradeQuoteCard(
    { box: card.box, clearedCount: card.clearedCount },
    grade,
    today,
  )

  await updateQuoteCardGrade(quoteCardId, result, today)

  return { ok: true as const, ...result }
}
