"use client";

import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { completePracticeAction } from "@/server/actions/practice.actions";

type CompletePracticeButtonProps = {
  userId: string;
  userJourneyId: string;
  practiceId: string;
};

export function CompletePracticeButton({
  userId,
  userJourneyId,
  practiceId,
}: CompletePracticeButtonProps) {
  const locale = useLocale()
  const t = useTranslations()
  
  const handleClick = async () => {
    await completePracticeAction(
      locale,
      userId,
      userJourneyId,
      practiceId,
    );
  };

  return (
    <Button
      variant="outline"
      onClick={handleClick}
    >
      {t('Practice.markAsDone')}
    </Button>
  );
}