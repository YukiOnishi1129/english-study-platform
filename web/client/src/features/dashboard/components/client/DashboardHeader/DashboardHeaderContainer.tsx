"use client";

import { DashboardHeaderPresenter } from "./DashboardHeaderPresenter";
import { useDashboardHeader } from "./useDashboardHeader";

export interface DashboardHeaderProps {
  greetingName: string;
  totalQuestionCount: number;
}

export function DashboardHeader({
  greetingName,
  totalQuestionCount,
}: DashboardHeaderProps) {
  const { onStartStudy, isStartingStudy } = useDashboardHeader();

  return (
    <DashboardHeaderPresenter
      greetingName={greetingName}
      totalQuestionCount={totalQuestionCount}
      onStartStudy={onStartStudy}
      isStartingStudy={isStartingStudy}
    />
  );
}
