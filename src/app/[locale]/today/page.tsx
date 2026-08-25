import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { CompletePracticeButton } from "@/components/completePracticeButton";
import { getToday } from "@/domain/daily/getToday";
import { getActiveJourneyForUser } from "@/server/repositories/today.repo";

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
    practice: state.practice,
  });

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

  return (
    <main>
      <p>{state.journey.title}</p>

      <h1>{today.newPractice.title}</h1>

      <p>{today.newPractice.body}</p>

      <CompletePracticeButton
        userId={userId}
        userJourneyId={state.userJourneyId}
        practiceId={today.newPractice.id}
      />
    </main>
  );
}