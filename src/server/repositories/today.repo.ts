import { prisma } from '@/server/db';
export const getActiveJourneyForUser = async (userId: string) => {
  const activeJourney = await prisma.userJourney.findFirst(
        {
            where: {
                userId: userId,
                status: 'active'
            },
            include: {
                journey: true,
            }
        },
    )

      if (!activeJourney) {
    return null;
  }
  const journeyPhases = await prisma.phase.findMany(
    {
      where: {
          journeyId: activeJourney.journeyId
      },
    }
  )
  const practice = await prisma.practice.findFirst({
    where: {
      journeyId: activeJourney.journeyId,
      index: activeJourney.currentIndex,
    },

    include: {
      phase: true,
    },
  });

  const dayActivity =
    await prisma.dayActivity.findUnique({
        where: {
        userId_date: {
            userId,
            date: new Date(),
        },
        },
   });

  return {
    hadActivityToday:dayActivity?.hadActivity ?? false,
    userJourneyId: activeJourney.id,
    currentIndex: activeJourney.currentIndex,
    journey: activeJourney.journey,
    phases: journeyPhases,
    practice,
  };


}
