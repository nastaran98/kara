import { prisma, type Db } from '@/server/db';

export const findUserJourney = (userId: string) => {
  return prisma.userJourney.findFirst({
    where: { userId },
  })
}

export const findActiveUserJourney = (userId: string) => {
  return prisma.userJourney.findFirst({
    where: {
      userId,
      status: 'active',
    },
    include: {
      journey: true,
    },
  })
}

export const createUserJourney = (
  userId: string,
  journeyId: string,
  db: Db = prisma,
) => {
  return db.userJourney.create({
    data: {
      userId,
      journeyId,
      currentIndex: 1,
      status: 'active',
    },
  })
}

export const getUserJourneys = (userId: string) => {
  return prisma.userJourney.findMany({
    where: { userId },
    include: { journey: true },
    orderBy: { startedAt: 'desc' },
  })
}

export const countCompletedUserJourneys = (userId: string) => {
  return prisma.userJourney.count({
    where: { userId, status: 'completed' },
  })
}

export const advanceUserJourney = (
  userJourneyId: string,
  db: Db = prisma,
) => {
  return db.userJourney.update({
    where: { id: userJourneyId },
    data: {
      currentIndex: { increment: 1 },
    },
  })
}
