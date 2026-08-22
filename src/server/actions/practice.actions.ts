"use server";
import {completePractice} from '@/server/services/completePractice'
import { revalidatePath } from "next/cache";

export async function completePracticeAction(
  locale: string,
  userId: string,
  userJourneyId: string,
  practiceId: string,
) {
  await completePractice(userId, userJourneyId, practiceId);

  revalidatePath(`/${locale}/today`);
}