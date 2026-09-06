"use server";
import { signIn } from "@/auth";

// `signIn` throws a redirect internally: to `pages.verifyRequest` on success,
// or back to `pages.signIn` with an `?error=` query param on failure (see
// auth.ts). There is nothing to catch here — that's the whole point of
// letting Next.js's redirect() propagate instead of wrapping it.
export async function requestMagicLinkAction(formData: FormData) {
  const email = formData.get("email") as string;
  const redirectTo = (formData.get("redirectTo") as string) || "/";

  await signIn("resend", { email, redirectTo });
}
