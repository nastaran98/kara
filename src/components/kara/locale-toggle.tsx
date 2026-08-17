'use client'

import { Link, usePathname } from '@/i18n/navigation'

export function LocaleToggle() {
  const pathname = usePathname()

  return (
    <nav aria-label="Language">
      <Link href={pathname} locale="en">
        EN
      </Link>

      {' / '}

      <Link href={pathname} locale="fa">
        فا
      </Link>
    </nav>
  )
}