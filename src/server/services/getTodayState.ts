import { findActiveUserJourney } from '@/server/repositories/userJourney.repo';
import { getPhasesForJourney } from '@/server/repositories/journey.repo';
import { getPracticeForJourneyIndex } from '@/server/repositories/practice.repo';
import { getDayActivity } from '@/server/repositories/dayActivity.repo';

// Composes the "Today" screen's state out of several independent reads.
// This orchestration — which entities to fetch and how to shape them
// together — belongs here rather than in a repository, which only knows
// how to fetch one thing at a time.
export const getTodayState = async (userId: string) => {
  const activeJourney = await findActiveUserJourney(userId);

  if (!activeJourney) {
    return null;
  }

  const [phases, practice, dayActivity] = await Promise.all([
    getPhasesForJourney(activeJourney.journeyId),
    getPracticeForJourneyIndex(
      activeJourney.journeyId,
      activeJourney.currentIndex,
    ),
    getDayActivity(userId, new Date()),
  ]);

  return {
    hadActivityToday: dayActivity?.hadActivity ?? false,
    userJourneyId: activeJourney.id,
    currentIndex: activeJourney.currentIndex,
    journey: activeJourney.journey,
    phases,
    practice,
  };
};
