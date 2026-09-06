import { auth } from "@/auth";
import { verifyMobileToken } from "@/server/auth/mobileToken";

// The single place API route handlers ask "who is this?" Checks, in order:
//   1. `Authorization: Bearer <token>` — the native client's path (see
//      mobileToken.ts and scripts/mint-test-token.ts).
//   2. The existing cookie-based session — same as every Server Component
//      page already uses, unchanged.
// Pass `request` when calling this from a route handler; page/action
// callers with no request (there are none of these yet) just get (2).
export async function getUserId(request?: Request): Promise<string | null> {
  const authHeader = request?.headers.get("authorization");

  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice("Bearer ".length);
    return verifyMobileToken(token);
  }

  const session = await auth();
  return session?.user?.id ?? null;
}
