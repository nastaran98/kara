import { NextRequest, NextResponse } from "next/server";

import { getUserId } from "@/server/auth/getUserId";
import { completePractice } from "@/server/services/completePractice";

// Same service the web app's completePracticeAction calls — this route
// just skips the revalidatePath() call, which is a Next.js web-app cache
// concern with no native-client equivalent.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await getUserId(request);

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: practiceId } = await params;
  const { userJourneyId } = await request.json();

  if (!userJourneyId || typeof userJourneyId !== "string") {
    return NextResponse.json(
      { error: "userJourneyId is required" },
      { status: 400 },
    );
  }

  await completePractice(userId, userJourneyId, practiceId);

  return NextResponse.json({ ok: true });
}
