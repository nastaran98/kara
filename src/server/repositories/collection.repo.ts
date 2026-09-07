import { prisma } from "@/server/db"

// Seeded via the content pipeline (KARA-46), same pattern as journey
// content — never typed into Prisma Studio.
export const getAllCollections = () => {
  return prisma.collection.findMany({
    include: { quotes: { select: { id: true } } },
    orderBy: { title: "asc" },
  })
}

// When `userId` is passed, each quote comes back with that user's own
// QuoteCard (if any) under `quoteCards[0]` — lets the detail page render
// "Add" vs "Added" without a second round trip, same trick as
// getAllJourneys.
export const getCollectionBySlug = (slug: string, userId?: string) => {
  return prisma.collection.findUnique({
    where: { slug },
    include: {
      quotes: {
        include: {
          quoteCards: userId ? { where: { userId } } : false,
        },
      },
    },
  })
}
