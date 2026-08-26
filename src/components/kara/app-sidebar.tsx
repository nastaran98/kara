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
    key: "journal",
    segment: "journal",
    icon: NotebookText,
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
      variant="inset"
      collapsible="icon"
    >
        <SidebarHeader className="p-2">
            <Link
                href={`/${locale}/today`}
                className="
                flex h-10 items-center gap-2 rounded-md px-2
                group-data-[collapsible=icon]:justify-center
                group-data-[collapsible=icon]:px-0
                "
            >
                {/* Logo — never collapses */}
                <div
                className="
                    grid size-8 min-w-8 shrink-0 place-items-center
                    rounded-lg bg-primary
                    font-semibold text-primary-foreground
                "
                >
                K
                </div>

                {/* Text — disappears when collapsed */}
                <div
                className="
                    min-w-0
                    group-data-[collapsible=icon]:hidden
                "
                >
                <p className="truncate text-sm font-semibold">
                    Kara
                </p>

                <p className="truncate text-xs text-muted-foreground">
                    {t("tagline")}
                </p>
                </div>
            </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
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
                    >
                      <Icon />
                      <span>{t(item.key)}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              render={
                <Link href={`/${locale}/settings`} />
              }
              isActive={pathname === `/${locale}/settings`}
            >
              <Settings2 />
              <span>{t("settings")}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}