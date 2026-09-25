export type TodayPractice = {
  id: string;
  index: number | null;
  type: "ACT" | "SIT" | "NOTICE" | "KEEP";
  title: string | null;
  body: string | null;
  minutes: number | null;
  // Already present on every Practice row fetched by the repository —
  // this just lets the type describe what the object actually carries,
  // so the UI's citation line can read it without an `any` escape.
  sourceTitle: string | null;
  sourceAuthor: string | null;
};

export type TodayState = {
  hadActivityToday: boolean;
  practice: TodayPractice | null;
  // Today's already-completed practice, when one exists — lets the UI
  // keep showing the filed card instead of replacing it with a blank
  // "come back tomorrow" screen the moment the day is satisfied.
  completedPractice: TodayPractice | null;
};

export type Phase = {
  id: string;
  index: number;
  name: string;
  startIndex: number;
  endIndex: number;
};

export type CreatePracticeInput = {
    type: "ACT" | "SIT" | "NOTICE" | "KEEP";
    themeTags: Array<string>;
    sourceType?: string | null;
    sourceTitle?: string | null;
    sourceAuthor?: string | null;
    title?: string | null;
    body?: string | undefined;
    minutes?: number | null;
    requiresOther?: boolean | null;
    suggestedMinutes?: number;
    revisitAfterDays?: number | null;
    noticeFor?: string | null;
    tallyLabel?: string | null;
    cue?: string | null;
    behavior?: string | null;
    polarity?: "do" | "avoid" | null;
    targetDays?: number | null;
}