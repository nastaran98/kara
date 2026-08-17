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

export const getFont = (locale: string) => {
   if (locale == 'fa') {
    return 'font-fa text-[1.0625rem] leading-[1.75]'
   }
   return 'font-sans'
}