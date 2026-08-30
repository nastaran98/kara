import {defineRouting} from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['en', 'fa'],
  defaultLocale: 'en',
})
export const localeDirection = { en: 'ltr', fa: 'rtl' } as const
export const getDirection = (locale: string) => {
   if (locale == 'fa') {
    return 'rtl'
   }
   return 'ltr'
}

export function getFont(locale: string) {
  return locale === "fa"
    ? "font-fa"
    : "font-sans";
}