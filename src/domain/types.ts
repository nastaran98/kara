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

export type Phase = {
  id: string;
  index: number;
  name: string;
  startIndex: number;
  endIndex: number;
};