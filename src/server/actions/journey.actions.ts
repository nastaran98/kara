"use server";
import { startJourney } from '@/server/services/startJourney'

export async function startJourneyAction(
  userId: string,
  journeyId: string,
) {
  await startJourney(userId, journeyId);
}