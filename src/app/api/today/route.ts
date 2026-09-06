import { NextRequest, NextResponse } from "next/server";

import { getUserId } from "@/server/auth/getUserId";
import { getTodayState } from "@/server/services/getTodayState";

// Thin wrapper — structurally the same shape as a Server Action: auth
// check, call the existing service, return its shape as JSON. Deliberately
// NOT calling @kara/domain's getToday()/getCurrentPhase() here: the point
// of this endpoint is to hand the client the same raw state
// today/page.tsx gets from getTodayState(), so that whichever client is
// asking (web or native) does its own dayState interpretation by calling
// the identical domain functions — the actual thing this proof of concept
// is meant to demonstrate, not just a passive JSON field.
export async function GET(request: NextRequest) {
  const userId = await getUserId(request);

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const state = await getTodayState(userId);

  if (!state) {
    return NextResponse.json({
      hadActivityToday: false,
      practice: null,
      userJourneyId: null,
      currentIndex: 0,
      phases: [],
      journey: null,
    });
  }

  return NextResponse.json({
    hadActivityToday: state.hadActivityToday,
    practice: state.practice,
    userJourneyId: state.userJourneyId,
    currentIndex: state.currentIndex,
    phases: state.phases,
    journey: {
      title: state.journey.title,
      outcomeStatement: state.journey.outcomeStatement,
    },
  });
}
