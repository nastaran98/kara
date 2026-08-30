"use client";

import { useLocale } from "next-intl";

import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export function LocaleToggle() {
  const pathname = usePathname();
  const locale = useLocale();

  const locales = [
    { value: "en", label: "EN" },
    { value: "fa", label: "فا" },
  ] as const;

  return (
    <nav
      aria-label="Language"
      className="
        inline-flex
        items-center
        rounded-full
        border-b
        border-border
        bg-surface
        p-1
      "
    >
      {locales.map((item) => {
        const isActive = locale === item.value;

        return (
          <Link
            key={item.value}
            href={pathname}
            locale={item.value}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              `
                flex
                h-7
                min-w-9
                items-center
                justify-center
                rounded-full
                px-2
                text-xs
                font-medium
                transition-colors
                duration-pill
                ease-standard
              `,
              isActive
                ? "bg-accent/10 text-accent"
                : "text-fg-muted hover:bg-bg hover:text-fg"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}