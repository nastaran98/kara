import { prisma, type Db } from '@/server/db';

export const getDayActivity = (userId: string, date: Date) => {
  return prisma.dayActivity.findUnique({
    where: {
      userId_date: { userId, date },
    },
  })
}

export const markDayActive = (
  userId: string,
  date: Date,
  db: Db = prisma,
) => {
  return db.dayActivity.upsert({
    where: {
      userId_date: { userId, date },
    },
    update: {
      hadActivity: true,
    },
    create: {
      userId,
      date,
      hadActivity: true,
    },
  })
}

// Every active day the user has ever logged — the raw material the
// streak domain logic walks backward over. One row per active day for
// the lifetime of the account is a small table; no date-range filter is
// needed to keep this cheap.
export const listActiveDates = (userId: string) => {
  return prisma.dayActivity.findMany({
    where: { userId, hadActivity: true },
    select: { date: true },
    orderBy: { date: 'desc' },
  })
}
