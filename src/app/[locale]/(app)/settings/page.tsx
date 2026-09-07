import { redirect } from 'next/navigation'
import { getLocale } from 'next-intl/server'
import { Globe, Mail } from 'lucide-react'

import { auth } from '@/auth'
import { findUserById } from '@/server/repositories/user.repo'
import { LocaleToggle } from '@/components/kara/locale-toggle'
import { SettingsForm } from '@/components/settingsForm'
import { SignOutButton } from '@/components/signOutButton'

const Settings = async () => {
  const session = await auth()
  const locale = await getLocale()

  if (!session?.user?.id) {
    redirect(`/${locale}/login`)
  }

  const userId = session.user.id
  const user = await findUserById(userId)

  return (
    <main className="flex w-full justify-center px-4 py-6 md:px-6 lg:py-8">
      <div className="w-full max-w-[640px]">
        <header className="mb-7">
          <h1
            className="
              font-display
              text-2xl
              font-medium
              tracking-[-0.02em]
              text-fg
            "
          >
            Settings
          </h1>

          <p className="mt-1.5 text-sm text-fg-muted">
            Your account, language and reminders.
          </p>
        </header>

        <div className="flex flex-col gap-5">
          {/* Account */}
          <section
            className="
              overflow-hidden
              rounded-lg
              border border-border
              bg-surface
              shadow-[0_18px_50px_rgba(50,46,42,0.07)]
            "
          >
            <div className="border-b border-border px-7 py-5">
              <h2 className="text-sm font-medium text-fg">Account</h2>
            </div>

            <div className="flex items-center gap-3 px-7 py-5 text-sm text-fg-muted">
              <Mail className="size-4 shrink-0" strokeWidth={1.6} />
              {user?.email}
            </div>
          </section>

          {/* Profile & reminders */}
          <section
            className="
              overflow-hidden
              rounded-lg
              border border-border
              bg-surface
              shadow-[0_18px_50px_rgba(50,46,42,0.07)]
            "
          >
            <div className="border-b border-border px-7 py-5">
              <h2 className="text-sm font-medium text-fg">Profile</h2>
              <p className="mt-1 text-xs text-fg-muted">
                Reminders are a convenience — nothing in Kara depends on
                them firing.
              </p>
            </div>

            <div className="px-7 py-6">
              <SettingsForm
                userId={userId}
                name={user?.name ?? ''}
                timezone={user?.timezone ?? 'UTC'}
                reminderTime={user?.reminderTime ?? ''}
                eveningReminderTime={user?.eveningReminderTime ?? ''}
              />
            </div>
          </section>

          {/* Language */}
          <section
            className="
              flex
              items-center
              justify-between
              gap-4
              overflow-hidden
              rounded-lg
              border border-border
              bg-surface
              px-7
              py-5
              shadow-[0_18px_50px_rgba(50,46,42,0.07)]
            "
          >
            <div className="flex items-center gap-3">
              <Globe
                className="size-4 shrink-0 text-fg-muted"
                strokeWidth={1.6}
              />
              <div>
                <h2 className="text-sm font-medium text-fg">Language</h2>
                <p className="mt-0.5 text-xs text-fg-muted">
                  English or Persian, right to left.
                </p>
              </div>
            </div>

            <LocaleToggle />
          </section>

          {/* Sign out */}
          <section
            className="
              overflow-hidden
              rounded-lg
              border border-border
              bg-surface
              px-7
              py-5
              shadow-[0_18px_50px_rgba(50,46,42,0.07)]
            "
          >
            <h2 className="mb-4 text-sm font-medium text-fg">Session</h2>
            <SignOutButton />
          </section>
        </div>
      </div>
    </main>
  )
}

export default Settings
