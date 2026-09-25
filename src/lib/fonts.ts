import { Vazirmatn, Manrope, Newsreader, Courier_Prime } from 'next/font/google'

export const vazirmatn = Vazirmatn({
  subsets: ['arabic'],
  variable: '--font-vazirmatn',
  display: 'swap',
})

export const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
})

export const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  display: "swap",
})

// The slip-box world's "typewriter citation type" — dates, sources, day
// counts, and other card metadata. A genuine typewriter-revival face, not
// a generic system mono standing in for "technical".
export const courierPrime = Courier_Prime({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-courier-prime",
  display: "swap",
})
