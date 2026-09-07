import { prisma } from '@/server/db';

// When `userId` is passed, each journey comes back with that user's own
// UserJourney row (if any) under `userJourneys[0]` — one query instead of
// N — so the library can render "Start" vs "Continue" vs "Completed"
// without a second round trip.
export const getAllJourneys = async (userId?: string) => {
   const journeys = await prisma.journey.findMany({
    include: {
        practices: true,
        userJourneys: userId ? { where: { userId } } : false,
    }
   })
   return journeys
}

export const getPhasesForJourney = (journeyId: string) => {
  return prisma.phase.findMany({
    where: { journeyId },
  })
}
