import "../globals.css";

import { NextIntlClientProvider } from "next-intl";
import { getLocale } from "next-intl/server";

import { getDirection, getFont, routing } from "@/i18n/routing";

import { manrope, newsreader, vazirmatn } from "@/lib/fonts";

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
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
