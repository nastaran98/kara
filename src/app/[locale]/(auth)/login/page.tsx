import { getLocale } from "next-intl/server";

import { requestMagicLinkAction } from "@/server/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Auth.js redirects failures back here with `?error=<code>` (see
// `pages.error` in auth.ts) — map the codes worth explaining, and fall back
// to a neutral message for the rest rather than leaking internals.
const ERROR_MESSAGES: Record<string, string> = {
  AccessDenied: "That email address can't sign in right now.",
  Verification: "That link has expired. Request a new one below.",
  EmailSignInError: "We couldn't send the email. Try again in a moment.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; callbackUrl?: string }>;
}) {
  const locale = await getLocale();
  const { error, callbackUrl } = await searchParams;
  const redirectTo = callbackUrl ?? `/${locale}/today`;

  return (
    <div
      className="
        rounded-lg
        border border-border
        bg-surface
        px-7
        py-8
        shadow-[0_18px_50px_rgba(50,46,42,0.07)]
      "
    >
      <h1 className="font-display text-2xl font-medium tracking-[-0.02em] text-fg">
        Sign in
      </h1>

      <p className="mt-2 text-sm leading-6 text-fg-muted">
        Enter your email and we&apos;ll send you a link to sign in — no
        password needed.
      </p>

      <form action={requestMagicLinkAction} className="mt-7">
        <input type="hidden" name="redirectTo" value={redirectTo} />

        <FieldGroup>
          <Field>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              required
            />
          </Field>

          {error && (
            <p className="text-sm text-accent">
              {ERROR_MESSAGES[error] ??
                "Something went wrong. Please try again."}
            </p>
          )}
        </FieldGroup>

        <Button type="submit" className="mt-6 h-11 w-full rounded-md text-sm">
          Send magic link
        </Button>
      </form>
    </div>
  );
}
