import {
  findUserJourney,
  createUserJourney,
} from '@/server/repositories/userJourney.repo';

export async function startJourney(
  userId: string,
  journeyId: string
) {
  // Business rule: a user only ever has one journey. If they already
  // started one (any status), reuse it instead of creating another.
  const existingJourney = await findUserJourney(userId);

  if (existingJourney) {
    return existingJourney;
  }

  return createUserJourney(userId, journeyId);
}
