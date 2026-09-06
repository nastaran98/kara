"use server";
import { revalidatePath } from "next/cache";
import { CreatePracticeInput } from '@kara/domain'
import { completePractice } from '@/server/services/completePractice'
import { createPractice } from '@/server/services/createPractice'

export async function completePracticeAction(
  locale: string,
  userId: string,
  userJourneyId: string,
  practiceId: string,
) {
  await completePractice(userId, userJourneyId, practiceId);

  revalidatePath(`/${locale}/today`);
}

export async function createPracticeAction(
  userId: string, payload: CreatePracticeInput
) {
  await createPractice(userId, payload)
}
