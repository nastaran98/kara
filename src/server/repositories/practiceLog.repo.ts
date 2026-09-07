import { prisma, type Db } from '@/server/db';

export const countCompletedPracticeLogs = (userId: string) => {
  return prisma.practiceLog.count({
    where: { userId, status: 'done' },
  })
}

export const insertPracticeLog = (
  userId: string,
  userJourneyId: string,
  practiceId: string,
  db: Db = prisma,
) => {
  return db.practiceLog.create({
    data: {
      userId,
      userJourneyId,
      practiceId,
      status: 'done',
      completedAt: new Date(),
    },
  })
}
