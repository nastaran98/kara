import { findUserById } from '@/server/repositories/user.repo';
import {
  findActiveUserJourney,
  getUserJourneys,
  countCompletedUserJourneys,
} from '@/server/repositories/userJourney.repo';
import { countCompletedPracticeLogs } from '@/server/repositories/practiceLog.repo';
import { countPoolEntries } from '@/server/repositories/poolEntry.repo';
import { listActiveDates } from '@/server/repositories/dayActivity.repo';
import { getCurrentStreak, reachedMilestoneToday } from '@kara/domain';

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
    activeDates,
  ] = await Promise.all([
    findUserById(userId),
    findActiveUserJourney(userId),
    getUserJourneys(userId),
    countCompletedUserJourneys(userId),
    countCompletedPracticeLogs(userId),
    countPoolEntries(userId),
    listActiveDates(userId),
  ]);

  // Same "no timezone conversion" simplification getTodayState and
  // completePractice already use for DayActivity — a date key is derived
  // straight off the stored @db.Date value / server instant, not through
  // the user's timezone.
  const todayKey = new Date().toISOString().slice(0, 10);
  const activeDateKeys = activeDates.map((row) =>
    row.date.toISOString().slice(0, 10),
  );

  const streak = getCurrentStreak(activeDateKeys, todayKey);

  return {
    user,
    activeJourney,
    journeys,
    stats: {
      journeysCompleted: completedJourneyCount,
      practicesCompleted,
      learningsSaved,
      streak: streak.currentStreak,
    },
    streakMilestoneReachedToday: reachedMilestoneToday(streak),
  };
};
