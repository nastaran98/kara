'use client'
import { startJourneyAction } from '@/server/actions/journey.actions'
import {Button} from '@/components/ui/button'

const StartJourneyButton = ({userId, journeyId}: { userId: string; journeyId: string }) => {
  return (
    <Button onClick={() => startJourneyAction(userId, journeyId)}>
        Start Journey
    </Button>
  )
}

export default StartJourneyButton