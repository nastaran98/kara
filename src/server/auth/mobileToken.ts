import { SignJWT, jwtVerify } from "jose";

// A minimal Bearer-token scheme for the native client — cookie sessions
// don't work for a mobile app. POC shortcut: signed with AUTH_SECRET, the
// same secret NextAuth already requires, so no new env var needs adding to
// either .env.local or Vercel. Before this goes beyond a proof of concept,
// give it its own dedicated secret instead of sharing NextAuth's.
function getSecretKey() {
  const secret = process.env.AUTH_SECRET;

  if (!secret) {
    throw new Error("AUTH_SECRET is not set");
  }

  return new TextEncoder().encode(secret);
}

export async function signMobileToken(
  userId: string,
  expiresIn: string = "180d",
): Promise<string> {
  return new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(getSecretKey());
}

// Returns the user id the token was signed for, or null if it's missing,
// malformed, expired, or signed with a different secret — every failure
// mode collapses to "not authenticated" rather than throwing, since this
// sits on the same call path as an absent Authorization header.
export async function verifyMobileToken(
  token: string,
): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}
