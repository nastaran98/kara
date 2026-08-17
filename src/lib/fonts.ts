import { Nunito_Sans, Vazirmatn } from 'next/font/google'

export const inter = Nunito_Sans({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const vazirmatn = Vazirmatn({
  subsets: ['arabic'],
  variable: '--font-vazirmatn',
  display: 'swap',
})