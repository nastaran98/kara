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

// Today's completed practice, if any — lets the Today screen keep
// showing the filed card instead of swapping to a generic empty state
// the moment the day is satisfied. Same "no timezone conversion"
// simplification as dayActivity.repo (UTC day boundary off the server
// instant, not the user's timezone).
export const getTodayCompletedPracticeLog = (
  userId: string,
  today: Date = new Date(),
) => {
  const startOfDay = new Date(today)
  startOfDay.setUTCHours(0, 0, 0, 0)

  const endOfDay = new Date(today)
  endOfDay.setUTCHours(23, 59, 59, 999)

  return prisma.practiceLog.findFirst({
    where: {
      userId,
      status: 'done',
      completedAt: { gte: startOfDay, lte: endOfDay },
    },
    orderBy: { completedAt: 'desc' },
    include: { practice: true },
  })
}
