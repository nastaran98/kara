import '../globals.css'

import { NextIntlClientProvider } from 'next-intl'
import { getLocale } from 'next-intl/server'

import { LocaleToggle } from '@/components/kara/locale-toggle'
import { getDirection, getFont, routing } from '@/i18n/routing'
import { inter, vazirmatn } from '@/lib/fonts'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const locale = await getLocale()

  return (
    <html
      lang={locale}
      dir={getDirection(locale)}
      className={`${inter.variable} ${vazirmatn.variable}`}
    >
      <body className={getFont(locale)}>
        <NextIntlClientProvider>
          <LocaleToggle />

          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}