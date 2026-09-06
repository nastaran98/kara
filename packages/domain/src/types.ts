export type TodayState = {
  hadActivityToday: boolean;
  practice: {
    id: string;
    index: number | null;
    type: "ACT" | "SIT" | "NOTICE" | "KEEP";
    title: string | null;
    body: string | null;
    minutes: number | null;
  } | null;
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