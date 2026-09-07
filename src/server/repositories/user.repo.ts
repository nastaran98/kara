import { prisma } from '@/server/db';

export const findUserById = (userId: string) => {
  return prisma.user.findUnique({
    where: { id: userId },
  })
}

export const updateUserProfile = (
  userId: string,
  data: {
    name?: string | null
    timezone?: string
    reminderTime?: string | null
    eveningReminderTime?: string | null
  },
) => {
  return prisma.user.update({
    where: { id: userId },
    data,
  })
}
