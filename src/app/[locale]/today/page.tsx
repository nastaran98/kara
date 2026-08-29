import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { CompletePracticeButton } from "@/components/completePracticeButton";
import { getToday, getCurrentPhase } from "@/domain/daily/getToday";
import { getActiveJourneyForUser } from "@/server/repositories/today.repo";
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar } from "@/components/ui/avatar";
import { Calendar, Sprout, Clock } from 'lucide-react'
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";


export default async function TodayPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/en/login");
  }

  const userId = session.user.id;

  const state = await getActiveJourneyForUser(userId);

  if (!state) {
    return <main>No active journey found.</main>;
  }

  const today = getToday({
    hadActivityToday: state.hadActivityToday,
    practice: state.practice
  });

  const currentPhase = getCurrentPhase(state.currentIndex, state.phases)

  if (today.dayState === "satisfied") {
    return (
      <main>
        <h1>Done for today</h1>
        <p>Come back tomorrow for the next practice.</p>
      </main>
    );
  }

  if (!today.newPractice) {
    return <main>No practice found.</main>;
  }

  const currentDate = new Date().toLocaleDateString();
  const totalPractices = state.phases.reduce((sum, current) => {
    const practicesForCurrentPhase = current.endIndex - current.startIndex + 1;
    return sum + practicesForCurrentPhase;
  }, 0);
  const progressValue = (state.currentIndex / totalPractices) * 100

  return (
    <>
      <div className="w-full flex items-center">
        <Card className="w-full">
            {
              state.journey && (
                <CardHeader className="border-b">
                  <div className="flex items-center gap-2">
                    <Avatar >
                      <Sprout />
                    </Avatar>
                    <CardTitle>{state.journey.title}</CardTitle>
                  </div>
                  <CardDescription>
                    {state.journey.outcomeStatement}
                  </CardDescription>
                  <CardAction>
                    <Calendar /> 
                    {currentDate}
                  </CardAction>
                </CardHeader>
              )
            }
          <CardContent>
            <div className="grid grid-cols-3 gap-0">
              <div className="col-start-1">
                {currentPhase && (<span>{`Phase ${currentPhase.index}: ${currentPhase.name}`}</span>)}
                <h1 className="mb-2">
                  {today.newPractice.title}
                </h1>
                <p className="mb-4">
                  {today.newPractice.body}
                </p>
                <div className="flex items-center gap-2">
                  <Clock width={16} height={16}/>
                  {`${today.newPractice.minutes} min`}
                </div>
              
                
              </div>
              <div className="col-start-3">

                {
                state.phases.length > 0 && (
                <>
                <span>
                  Practice Progress
                </span>
                <h4>
                  {`Phase ${currentPhase?.index} of ${state.phases.length}`}
                </h4>
                <Progress value={progressValue} className="mb-4"/>
                <Badge>
                  {state.practice?.type}
                </Badge>
                </>
                )
                }
                <div>
                  <CompletePracticeButton
                    userId={userId}
                    userJourneyId={state.userJourneyId}
                    practiceId={today.newPractice.id}
                  />
                  <Button type="submit" className="w-full">
                    Not Today
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

    </>
  );
}