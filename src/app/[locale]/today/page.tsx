
import { CompletePracticeButton } from "@/components/completePracticeButton";
import { getActiveJourneyForUser } from "@/server/repositories/today.repo";

export default async function TodayPage() {
  const userId = "1234";

  const today = await getActiveJourneyForUser(userId);

  if (!today || !today.practice) {
    return <main>No practice found.</main>;
  }

  return (
    <main>
        {
            !today.hadActivityToday && (
                <>
                <p>{today.journey.title}</p>

                {today.practice.phase && (
                    <p>
                    Phase {today.practice.phase.index} ·{" "}
                    {today.practice.phase.name}
                    </p>
                )}

                <p>
                    Practice {today.practice.index}
                </p>

                <p>{today.practice.type}</p>

                <h1>{today.practice.title}</h1>

                <p>{today.practice.body}</p>

                {today.practice.type === "ACT" &&
                    today.practice.minutes && (
                    <p>≈ {today.practice.minutes} min</p>
                    )}
                    <CompletePracticeButton userId={userId} userJourneyId={today.userJourneyId} practiceId={today.practice.id}/>
                </>
        )}
        {
            today.hadActivityToday && (
                <>
                <h1>Done for today</h1>
                <p>
                    Come back tomorrow for the next practice.
                </p>
                </>
            )
        }
      
    </main>
  );
}