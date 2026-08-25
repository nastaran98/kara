import NextAuth from "next-auth";
import Resend from "next-auth/providers/resend";
import { PrismaAdapter } from "@auth/prisma-adapter";

import { prisma } from "@/server/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),

  session: {
    strategy: "database",
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