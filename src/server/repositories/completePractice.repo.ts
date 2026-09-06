import { prisma } from '@/server/db';
import { insertPracticeLog } from '@/server/repositories/practiceLog.repo';
import { advanceUserJourney } from '@/server/repositories/userJourney.repo';
import { markDayActive } from '@/server/repositories/dayActivity.repo';

// Atomic write spanning three tables — logging the practice, advancing the
// journey, and marking the day active either all happen or none do. This
// is the only place that knows HOW (one Prisma transaction, threaded
// through each single-table repo helper).
export const recordPracticeCompletion = (
  userId: string,
  userJourneyId: string,
  practiceId: string,
  completedOn: Date,
) => {
  return prisma.$transaction(async (tx) => {
    const practiceLog = await insertPracticeLog(
      userId,
      userJourneyId,
      practiceId,
      tx,
    );

    const userJourney = await advanceUserJourney(userJourneyId, tx);

    const dayActivity = await markDayActive(userId, completedOn, tx);

    return {
      practiceLog,
      userJourney,
      dayActivity,
    };
  });
}
