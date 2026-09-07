import { prisma, type Db } from '@/server/db'
import type { QuoteSourceType } from '@/generated/prisma/client'
import { READY_CLEARED_COUNT } from '@kara/domain'

export type NewPersonalQuoteData = {
  text: string
  author?: string | null
  sourceTitle?: string | null
  sourceType?: QuoteSourceType
  themeTags?: string[]
  note?: string | null
  clozeWords?: string[]
}

export type QuoteFilters = {
  themeTags?: string[]
  sourceType?: QuoteSourceType
  origin?: 'mine' | 'collection'
  readyOnly?: boolean
}

// Due cards, oldest-due-first, joined to the Quote they review. The hard
// cap on how many come back at once lives here (in the query), not just in
// whatever UI happens to call it — KARA-42 relies on this, not on trimming
// the array itself.
export const getDueQuoteCards = (
  userId: string,
  limit = 7,
  today: Date = new Date(),
) => {
  return prisma.quoteCard.findMany({
    where: {
      userId,
      dueAt: { lte: today },
    },
    orderBy: { dueAt: 'asc' },
    take: limit,
    include: { quote: true },
  })
}

export const countDueQuoteCards = (
  userId: string,
  today: Date = new Date(),
) => {
  return prisma.quoteCard.count({
    where: {
      userId,
      dueAt: { lte: today },
    },
  })
}

// A personal quote's Quote row and its QuoteCard are created together —
// there's no meaningful state where one exists without the other, so this
// is one atomic write, same pattern as createPracticeWithPoolEntry.
export const createPersonalQuoteAndCard = (
  userId: string,
  data: NewPersonalQuoteData,
  dueAt: Date,
) => {
  return prisma.$transaction(async (tx) => {
    const quote = await tx.quote.create({
      data: {
        userId,
        text: data.text,
        author: data.author ?? null,
        sourceTitle: data.sourceTitle ?? null,
        sourceType: data.sourceType ?? 'unknown',
        themeTags: data.themeTags ?? [],
        note: data.note ?? null,
        clozeWords: data.clozeWords ?? [],
      },
    })

    const quoteCard = await tx.quoteCard.create({
      data: {
        userId,
        quoteId: quote.id,
        box: 1,
        dueAt,
        clearedCount: 0,
      },
    })

    return { quote, quoteCard }
  })
}

// Bulk variant for KARA-40's paste import: every Quote + QuoteCard pair
// created in one transaction, so a partial paste never lands half-saved.
export const createPersonalQuotesAndCards = (
  userId: string,
  entries: NewPersonalQuoteData[],
  dueAt: Date,
) => {
  return prisma.$transaction(async (tx) => {
    const created: { quote: unknown; quoteCard: unknown }[] = []

    for (const data of entries) {
      const quote = await tx.quote.create({
        data: {
          userId,
          text: data.text,
          author: data.author ?? null,
          sourceTitle: data.sourceTitle ?? null,
          sourceType: data.sourceType ?? 'unknown',
          themeTags: data.themeTags ?? [],
          note: data.note ?? null,
          clozeWords: data.clozeWords ?? [],
        },
      })

      const quoteCard = await tx.quoteCard.create({
        data: {
          userId,
          quoteId: quote.id,
          box: 1,
          dueAt,
          clearedCount: 0,
        },
      })

      created.push({ quote, quoteCard })
    }

    return created
  })
}

// The Quote row already exists (it belongs to a seeded Collection) —
// adding it to a user's deck only ever creates a QuoteCard.
export const addCardFromCollectionQuote = (
  userId: string,
  quoteId: string,
  dueAt: Date,
  db: Db = prisma,
) => {
  return db.quoteCard.create({
    data: {
      userId,
      quoteId,
      box: 1,
      dueAt,
      clearedCount: 0,
    },
  })
}

// `[Add all]` on a collection — one QuoteCard per quote the user doesn't
// already have a card for, in one transaction.
export const addCardsForCollectionQuotes = async (
  userId: string,
  quoteIds: string[],
  dueAt: Date,
) => {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.quoteCard.findMany({
      where: { userId, quoteId: { in: quoteIds } },
      select: { quoteId: true },
    })

    const alreadyHave = new Set(existing.map((card) => card.quoteId))
    const toAdd = quoteIds.filter((id) => !alreadyHave.has(id))

    if (toAdd.length === 0) {
      return []
    }

    await tx.quoteCard.createMany({
      data: toAdd.map((quoteId) => ({
        userId,
        quoteId,
        box: 1,
        dueAt,
        clearedCount: 0,
      })),
    })

    return toAdd
  })
}

export const updateQuoteCardGrade = (
  quoteCardId: string,
  grade: { box: number; dueAt: Date; clearedCount: number },
  reviewedAt: Date = new Date(),
) => {
  return prisma.quoteCard.update({
    where: { id: quoteCardId },
    data: {
      box: grade.box,
      dueAt: grade.dueAt,
      clearedCount: grade.clearedCount,
      lastReviewedAt: reviewedAt,
    },
  })
}

export const getQuoteCardById = (quoteCardId: string) => {
  return prisma.quoteCard.findUnique({
    where: { id: quoteCardId },
    include: { quote: true },
  })
}

// The "see everything" view (KARA-44) — every QuoteCard the user holds,
// joined to its Quote, newest-added first by default. Filters are applied
// at the query level so pagination (if it ever comes) stays correct.
export const getUserQuotes = (
  userId: string,
  filters: QuoteFilters = {},
) => {
  return prisma.quoteCard.findMany({
    where: {
      userId,
      clearedCount: filters.readyOnly
        ? { gte: READY_CLEARED_COUNT }
        : undefined,
      quote: {
        themeTags: filters.themeTags?.length
          ? { hasSome: filters.themeTags }
          : undefined,
        sourceType: filters.sourceType,
        userId:
          filters.origin === 'mine'
            ? userId
            : filters.origin === 'collection'
              ? null
              : undefined,
      },
    },
    include: { quote: true },
    orderBy: { createdAt: 'desc' },
  })
}

export const getUserQuoteCard = (userId: string, quoteCardId: string) => {
  return prisma.quoteCard.findFirst({
    where: { id: quoteCardId, userId },
    include: { quote: true },
  })
}
