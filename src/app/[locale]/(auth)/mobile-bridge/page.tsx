import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { signMobileToken } from "@/server/auth/mobileToken";

// Where the mobile app's login flow lands after a successful magic-link
// sign-in (see /login's callbackUrl handling — this page is just an
// ordinary same-origin redirect target, nothing mobile-specific about it
// from NextAuth's point of view). By the time we're here, the magic-link
// callback has already run and set the normal cookie session; this page's
// only job is to turn that into the mobile app's Bearer token and hand
// control back to the app via a deep link.
//
// The deep link target is a fixed literal, not something read from the
// request, on purpose — a user-controlled redirect here would leak a
// freshly minted token to whatever URL an attacker put in a query param.
export default async function MobileBridgePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/mobile-bridge");
  }

  const token = await signMobileToken(session.user.id, "180d");

  redirect(`kara://auth-callback?token=${encodeURIComponent(token)}`);
}
