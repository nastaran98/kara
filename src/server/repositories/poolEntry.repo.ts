import { prisma, type Db } from '@/server/db';

export const countPoolEntries = (userId: string) => {
  return prisma.poolEntry.count({
    where: { userId },
  })
}

export const insertPoolEntry = (
  userId: string,
  practiceId: string,
  db: Db = prisma,
) => {
  return db.poolEntry.create({
    data: {
      userId,
      practiceId,
    },
  })
}
