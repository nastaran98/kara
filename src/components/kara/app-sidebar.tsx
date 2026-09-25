"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  CalendarCheck2,
  NotebookText,
  Quote,
  Settings2,
  UserRound,
  Library
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

const navigationItems = [
  {
    key: "today",
    segment: "today",
    icon: CalendarCheck2,
  },
  {
    key: "myLearnings",
    segment: "myLearnings",
    icon: NotebookText,
  },
  {
    key: "library",
    segment: "library",
    icon: Library,
  },
  {
    key: "quotes",
    segment: "quotes",
    icon: Quote,
  },
  {
    key: "you",
    segment: "you",
    icon: UserRound,
  },
] as const;

export function AppSidebar() {
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations("Navigation");

  const isRtl = locale === "fa";

  return (
    <Sidebar
      side={isRtl ? "right" : "left"}
      dir={isRtl ? "rtl" : "ltr"}
      variant="sidebar"
      collapsible="icon"
      className="
        border-e
        border-border
        bg-surface
        text-fg
      "
    >
      {/* ───────────────────────
          BRAND
      ─────────────────────── */}
      <SidebarHeader className="p-3">
        <Link
          href={`/${locale}/today`}
          className="
            group/brand
            flex
            h-12
            items-center
            gap-3
            rounded-md
            px-2
            transition-colors
            duration-pill
            ease-standard
            hover:bg-bg

            group-data-[collapsible=icon]:justify-center
            group-data-[collapsible=icon]:px-0
          "
        >
          {/* Logo — a wax-seal stamp, not a rounded app-icon tile. */}
          <div
            className="
              grid
              size-9
              min-w-9
              shrink-0
              place-items-center
              rounded-full
              border
              border-brass/40
              bg-brass
              font-mono
              text-sm
              font-bold
              tracking-[-0.02em]
              text-brass-fg
              shadow-accent-sm
            "
          >
            K
          </div>

          {/* Brand text */}
          <div
            className="
              min-w-0
              leading-tight
              group-data-[collapsible=icon]:hidden
            "
          >
            <p className="truncate text-sm font-semibold text-fg">
              Kara
            </p>

            <p className="mt-0.5 truncate text-xs text-fg-muted">
              {t("tagline")}
            </p>
          </div>
        </Link>
      </SidebarHeader>

      {/* ───────────────────────
          MAIN NAVIGATION
      ─────────────────────── */}
      <SidebarContent className="px-2 py-4">
        <SidebarGroup className="p-0">
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {navigationItems.map((item) => {
                const href = `/${locale}/${item.segment}`;

                const isActive =
                  pathname === href ||
                  pathname.startsWith(`${href}/`);

                const Icon = item.icon;

                return (
                  <SidebarMenuItem key={item.key}>
                    <SidebarMenuButton
                      render={<Link href={href} />}
                      isActive={isActive}
                      className={`
                        h-10
                        rounded-md
                        px-2
                        text-sm
                        transition-colors
                        duration-pill
                        ease-standard
                        hover:bg-bg

                        ${
                          isActive
                            ? "font-semibold text-fg"
                            : "font-normal text-fg-muted hover:text-fg"
                        }

                        group-data-[collapsible=icon]:mx-auto
                        group-data-[collapsible=icon]:size-10
                        group-data-[collapsible=icon]:justify-center
                        group-data-[collapsible=icon]:px-0
                      `}
                    >
                      {/* Active items sit in a small stamped block, like an
                          inked catalog marker — not a row-wide fill. */}
                      <span
                        className={`
                          grid
                          size-7
                          shrink-0
                          place-items-center
                          rounded-sm
                          ${isActive ? "bg-accent text-accent-fg" : "text-fg-muted"}
                        `}
                      >
                        <Icon className="size-4.25" strokeWidth={1.7} />
                      </span>

                      <span
                        className="
                          truncate
                          group-data-[collapsible=icon]:hidden
                        "
                      >
                        {t(item.key)}
                      </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* ───────────────────────
          FOOTER
      ─────────────────────── */}
      <SidebarFooter className="border-t border-border p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              render={
                <Link href={`/${locale}/settings`} />
              }
              isActive={
                pathname === `/${locale}/settings`
              }
              className={`
                h-10
                rounded-md
                px-2
                text-sm
                transition-colors
                duration-pill
                ease-standard
                hover:bg-bg

                ${
                  pathname === `/${locale}/settings`
                    ? "font-semibold text-fg"
                    : "font-normal text-fg-muted hover:text-fg"
                }

                group-data-[collapsible=icon]:mx-auto
                group-data-[collapsible=icon]:size-10
                group-data-[collapsible=icon]:justify-center
                group-data-[collapsible=icon]:px-0
              `}
            >
              <span
                className={`
                  grid
                  size-7
                  shrink-0
                  place-items-center
                  rounded-sm
                  ${
                    pathname === `/${locale}/settings`
                      ? "bg-accent text-accent-fg"
                      : "text-fg-muted"
                  }
                `}
              >
                <Settings2 className="size-4.25" strokeWidth={1.7} />
              </span>

              <span className="group-data-[collapsible=icon]:hidden">
                {t("settings")}
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}