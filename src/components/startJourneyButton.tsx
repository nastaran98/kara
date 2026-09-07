'use client'

import Link from 'next/link'
import { useLocale } from 'next-intl'
import { useTransition } from 'react'
import { ArrowRight, CheckCircle2, Loader2 } from 'lucide-react'

import { startJourneyAction } from '@/server/actions/journey.actions'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type Props = {
  userId: string
  journeyId: string
  status?: 'active' | 'completed' | 'abandoned' | 'queued'
}

const StartJourneyButton = ({ userId, journeyId, status }: Props) => {
  const locale = useLocale()
  const [isPending, startTransition] = useTransition()

  if (status === 'completed') {
    return (
      <div
        className="
          flex
          h-11
          w-full
          items-center
          justify-center
          gap-2
          rounded-md
          bg-accent/10
          text-sm
          font-medium
          text-accent
        "
      >
        <CheckCircle2 className="size-4" strokeWidth={1.7} />
        Completed
      </div>
    )
  }

  if (status === 'active') {
    return (
      <Button
        type="button"
        render={<Link href={`/${locale}/today`} />}
        className="
          h-11
          w-full
          rounded-md
          bg-accent
          text-sm
          font-medium
          text-accent-fg
          shadow-[0_5px_14px_rgba(172,116,89,0.16)]
          hover:bg-accent/90
        "
      >
        Continue
        <ArrowRight className="size-4" strokeWidth={1.7} />
      </Button>
    )
  }

  return (
    <Button
      type="button"
      disabled={isPending}
      onClick={() =>
        startTransition(() => startJourneyAction(userId, journeyId))
      }
      className={cn(
        `
          h-11
          w-full
          rounded-md
          bg-accent
          text-sm
          font-medium
          text-accent-fg
          shadow-[0_5px_14px_rgba(172,116,89,0.16)]
          transition
          hover:bg-accent/90
          disabled:opacity-60
        `
      )}
    >
      {isPending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : status === 'abandoned' || status === 'queued' ? (
        'Start over'
      ) : (
        'Start journey'
      )}
    </Button>
  )
}

export default StartJourneyButton
