import NextAuth from "next-auth";
import Resend from "next-auth/providers/resend";
import { PrismaAdapter } from "@auth/prisma-adapter";

import { prisma } from "@/server/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),

  session: {
    strategy: "database",
  },

  // Without these, Auth.js falls back to its own generic, unstyled pages
  // for these three steps. These paths are locale-less on purpose — Auth.js
  // has no concept of our `/[locale]` segment, so it always redirects here
  // un-prefixed and next-intl's middleware then prefixes the default
  // locale. A user mid-flow in a non-default locale lands back on that
  // default locale for this one step; that's an accepted trade-off, not
  // a bug, since a static pages config can't carry locale.
  pages: {
    signIn: "/login",
    verifyRequest: "/login/verify",
    error: "/login",
  },

  providers: [
    Resend({
      from: "Kara <onboarding@resend.dev>",
    }),
  ],

  callbacks: {
    session({ session, user }) {
      session.user.id = user.id;

      return session;
    },
  },
});