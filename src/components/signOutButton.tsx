"use client";

import { useTransition } from "react";
import { useLocale } from "next-intl";
import { LogOut, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { signOutAction } from "@/server/actions/user.actions";

export function SignOutButton() {
  const locale = useLocale();
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="outline"
      disabled={isPending}
      onClick={() => startTransition(() => signOutAction(locale))}
      className="
        h-11
        w-full
        rounded-md
        border-border
        bg-transparent
        text-sm
        font-medium
        text-fg
        shadow-none
        hover:bg-bg
      "
    >
      {isPending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <LogOut className="size-4" strokeWidth={1.7} />
      )}
      Sign out
    </Button>
  );
}
