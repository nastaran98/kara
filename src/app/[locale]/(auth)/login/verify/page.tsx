import Link from "next/link";
import { getLocale } from "next-intl/server";
import { MailCheck } from "lucide-react";

export default async function VerifyRequestPage() {
  const locale = await getLocale();

  return (
    <div
      className="
        rounded-lg
        border border-border
        bg-surface
        px-7
        py-8
        text-center
        shadow-[0_18px_50px_rgba(50,46,42,0.07)]
      "
    >
      <div className="mx-auto flex size-11 items-center justify-center rounded-full bg-accent/10">
        <MailCheck className="size-5 text-accent" strokeWidth={1.6} />
      </div>

      <h1 className="mt-5 font-display text-2xl font-medium tracking-[-0.02em] text-fg">
        Check your email
      </h1>

      <p className="mt-2 text-sm leading-6 text-fg-muted">
        We sent you a sign-in link. Open it on this device to continue —
        it expires after a day and can only be used once.
      </p>

      <Link
        href={`/${locale}/login`}
        className="mt-6 inline-block text-sm text-accent underline-offset-4 hover:underline"
      >
        Use a different email
      </Link>
    </div>
  );
}
