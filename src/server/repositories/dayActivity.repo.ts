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
