import { recordPracticeCompletion } from '@/server/repositories/completePractice.repo';

export async function completePractice(
  userId: string,
  userJourneyId: string,
  practiceId: string,
) {
  return recordPracticeCompletion(userId, userJourneyId, practiceId, new Date());
}
