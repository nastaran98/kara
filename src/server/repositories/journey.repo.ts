import { prisma } from '@/server/db';

export const getAllJourneys = async () => {
   const journeys = await prisma.journey.findMany({
    include: {
        practices: true
    }
   })
   return journeys
}

export const getPhasesForJourney = (journeyId: string) => {
  return prisma.phase.findMany({
    where: { journeyId },
  })
}
