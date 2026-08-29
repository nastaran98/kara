import type { TodayState, Phase } from "@/domain/types";

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



export function getCurrentPhase(
  currentIndex: number,
  phases: readonly Phase[]
): Phase | null {
  return (
    phases.find(
      (phase) =>
        currentIndex >= phase.startIndex &&
        currentIndex <= phase.endIndex
    ) ?? null
  );
}