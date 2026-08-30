import "../globals.css";

import { NextIntlClientProvider } from "next-intl";
import { getLocale } from "next-intl/server";

import { AppSidebar } from "@/components/kara/app-sidebar";
import { LocaleToggle } from "@/components/kara/locale-toggle";

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

import {
  getDirection,
  getFont,
  routing,
} from "@/i18n/routing";

import {
  manrope,
  newsreader,
  vazirmatn,
} from "@/lib/fonts";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({
    locale,
  }));
}

export default async function LocaleLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <html
      lang={locale}
      dir={getDirection(locale)}
      className={`${manrope.variable} ${newsreader.variable} ${vazirmatn.variable}`}
    >
      <body className={getFont(locale)}>
        <NextIntlClientProvider>
          <SidebarProvider>
            <AppSidebar />

            <SidebarInset>
              <header className="flex h-14 shrink-0 items-center justify-between border-b border-border px-4">
                <SidebarTrigger />
              </header>

              <main className="flex-1 p-4 md:p-6">
                {children}
              </main>
            </SidebarInset>
          </SidebarProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}