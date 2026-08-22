import { prisma } from "@/server/db";

export async function completePractice(
  userId: string,
  userJourneyId: string,
  practiceId: string,
) {
  const today = new Date();

  return prisma.$transaction(async (tx) => {
    // 1. Record that this user completed this practice
    const practiceLog = await tx.practiceLog.create({
      data: {
        userId,
        userJourneyId,
        practiceId,
        status: "done",
        completedAt: new Date(),
      },
    });

    // 2. Advance the user's journey to the next practice
    const userJourney = await tx.userJourney.update({
      where: {
        id: userJourneyId,
      },
      data: {
        currentIndex: {
          increment: 1,
        },
      },
    });

    // 3. Mark today as a day where the user showed up
    const dayActivity = await tx.dayActivity.upsert({
      where: {
        userId_date: {
          userId,
          date: today,
        },
      },

      update: {
        hadActivity: true,
      },

      create: {
        userId,
        date: today,
        hadActivity: true,
      },
    });

    return {
      practiceLog,
      userJourney,
      dayActivity,
    };
  });
}