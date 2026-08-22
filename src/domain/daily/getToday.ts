import type { TodayState } from "@/domain/daily/types";

export function getToday(state: TodayState) {
  if (state.hadActivityToday) {
    return {
      dayState: "satisfied" as const,
      newPractice: null,
    };
  }

  if (state.practice) {
    return {
      dayState: "pending" as const,
      newPractice: state.practice,
    };
  }

  return {
    dayState: "empty" as const,
    newPractice: null,
  };
}