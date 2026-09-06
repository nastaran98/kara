import { NextRequest, NextResponse } from "next/server";

import { getToday, getCurrentPhase } from "@kara/domain";
import { getUserId } from "@/server/auth/getUserId";
import { getTodayState } from "@/server/services/getTodayState";

// Thin wrapper — structurally the same shape as a Server Action: auth
// check, call the existing service, shape the response. No business logic
// lives here; `getTodayState` and `getToday`/`getCurrentPhase` are the same
// functions the web Today page calls.
export async function GET(request: NextRequest) {
  const userId = await getUserId(request);

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const state = await getTodayState(userId);

  if (!state) {
    return NextResponse.json({ dayState: "noJourney", practice: null });
  }

  const today = getToday({
    hadActivityToday: state.hadActivityToday,
    practice: state.practice,
  });

  const currentPhase = getCurrentPhase(state.currentIndex, state.phases);

  return NextResponse.json({
    dayState: today.dayState,
    practice: today.newPractice,
    userJourneyId: state.userJourneyId,
    journey: {
      title: state.journey.title,
      outcomeStatement: state.journey.outcomeStatement,
    },
    phase: currentPhase
      ? { index: currentPhase.index, name: currentPhase.name }
      : null,
  });
}
