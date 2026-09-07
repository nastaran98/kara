"use server";
import { revalidatePath } from "next/cache";
import { signOut } from "@/auth";
import { updateUserProfile } from "@/server/repositories/user.repo";

export async function updateProfileAction(
  locale: string,
  userId: string,
  formData: FormData,
) {
  const name = ((formData.get("name") as string) || "").trim();
  const timezone = ((formData.get("timezone") as string) || "UTC").trim();
  const reminderTime = (formData.get("reminderTime") as string) || null;
  const eveningReminderTime =
    (formData.get("eveningReminderTime") as string) || null;

  await updateUserProfile(userId, {
    name: name || null,
    timezone,
    reminderTime,
    eveningReminderTime,
  });

  revalidatePath(`/${locale}/settings`);
  revalidatePath(`/${locale}/you`);
}

// `signOut` throws a redirect internally, same pattern as
// requestMagicLinkAction — nothing to catch here.
export async function signOutAction(locale: string) {
  await signOut({ redirectTo: `/${locale}/login` });
}
