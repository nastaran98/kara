import { findUserById } from '@/server/repositories/user.repo';
import {
  findActiveUserJourney,
  getUserJourneys,
  countCompletedUserJourneys,
} from '@/server/repositories/userJourney.repo';
import { countCompletedPracticeLogs } from '@/server/repositories/practiceLog.repo';
import { countPoolEntries } from '@/server/repositories/poolEntry.repo';

// Composes the "You" screen's state out of several independent reads —
// same orchestration pattern as getTodayState: repos fetch one thing each,
// this stitches them together for the page.
export const getProfileState = async (userId: string) => {
  const [
    user,
    activeJourney,
    journeys,
    completedJourneyCount,
    practicesCompleted,
    learningsSaved,
  ] = await Promise.all([
    findUserById(userId),
    findActiveUserJourney(userId),
    getUserJourneys(userId),
    countCompletedUserJourneys(userId),
    countCompletedPracticeLogs(userId),
    countPoolEntries(userId),
  ]);

  return {
    user,
    activeJourney,
    journeys,
    stats: {
      journeysCompleted: completedJourneyCount,
      practicesCompleted,
      learningsSaved,
    },
  };
};
