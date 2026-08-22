export type TodayState = {
  hadActivityToday: boolean;

  practice: {
    id: string;
    index: number | null;
    type: "ACT" | "SIT" | "NOTICE" | "KEEP";
    title: string;
    body: string;
    minutes: number | null;
  } | null;
};