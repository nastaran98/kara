'use client'

import { useState, useTransition } from 'react'
import { useLocale } from 'next-intl'
import { Loader2, Save } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Field, FieldGroup } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateProfileAction } from '@/server/actions/user.actions'

type Props = {
  userId: string
  name: string
  timezone: string
  reminderTime: string
  eveningReminderTime: string
}

// Common IANA zones only — a full tz list is a directory nobody wants to
// scroll. "Other" leaves the field free-text via the browser's own list
// isn't available without a picker, so we keep this short and honest.
const TIMEZONES = [
  'UTC',
  'Asia/Tehran',
  'Europe/Copenhagen',
  'Europe/London',
  'Europe/Berlin',
  'America/New_York',
  'America/Los_Angeles',
  'Asia/Dubai',
  'Asia/Kolkata',
]

export function SettingsForm({
  userId,
  name,
  timezone,
  reminderTime,
  eveningReminderTime,
}: Props) {
  const locale = useLocale()
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)

  function handleSubmit(formData: FormData) {
    setSaved(false)
    startTransition(async () => {
      await updateProfileAction(locale, userId, formData)
      setSaved(true)
    })
  }

  return (
    <form action={handleSubmit}>
      <FieldGroup>
        <Field>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            defaultValue={name}
            placeholder="Your name"
          />
        </Field>

        <Field>
          <Label htmlFor="timezone">Timezone</Label>
          <select
            id="timezone"
            name="timezone"
            defaultValue={timezone}
            className="
              h-9
              w-full
              rounded-[10px]
              border border-input
              bg-transparent
              px-3
              text-sm
            "
          >
            {TIMEZONES.map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
          </select>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field>
            <Label htmlFor="reminderTime">Morning reminder</Label>
            <Input
              id="reminderTime"
              name="reminderTime"
              type="time"
              defaultValue={reminderTime}
            />
          </Field>

          <Field>
            <Label htmlFor="eveningReminderTime">Evening reminder</Label>
            <Input
              id="eveningReminderTime"
              name="eveningReminderTime"
              type="time"
              defaultValue={eveningReminderTime}
            />
          </Field>
        </div>

        <div className="flex items-center gap-3 pt-1">
          <Button
            type="submit"
            disabled={isPending}
            className="
              h-11
              rounded-md
              bg-accent
              px-5
              text-sm
              font-medium
              text-accent-fg
              shadow-[0_5px_14px_rgba(172,116,89,0.16)]
              hover:bg-accent/90
              disabled:opacity-60
            "
          >
            {isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" strokeWidth={1.7} />
            )}
            Save changes
          </Button>

          {saved && !isPending && (
            <span className="text-xs text-fg-muted">Saved.</span>
          )}
        </div>
      </FieldGroup>
    </form>
  )
}
