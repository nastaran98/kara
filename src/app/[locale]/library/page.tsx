import { Card, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { getAllJourneys } from '@/server/repositories/journey.repo'
import StartJourneyButton from '@/components/startJourneyButton'
import React from 'react'
import { auth } from '@/auth'

const Library = async () => {
  const journeys = await getAllJourneys()
  const session = await auth();

  return (
    <div>
      {
        journeys.map((journey) => {
          return (
            <Card key={journey.id}>
              <CardHeader>
                <CardTitle>
                  {journey.title}
                </CardTitle>
              </CardHeader>
              <CardFooter>
                <StartJourneyButton userId={session?.user?.id} journeyId={journey.id} />
              </CardFooter>
            </Card>
          )
        })
      }
    </div>
  )
}

export default Library