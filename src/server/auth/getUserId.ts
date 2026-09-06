import { auth } from "@/auth";

// The single place API route handlers ask "who is this?" — currently just
// the existing cookie-based session, same as every Server Component page
// already uses. Phase 3 (native client auth) extends this to also accept
// an `Authorization: Bearer <token>` header, without touching this cookie
// path or anything that already calls it.
export async function getUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}
