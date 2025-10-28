"use client";

import { ErrorState } from "../DashboardErrorState";
import { DashboardHeader } from "../DashboardHeader";
import { LoadingSkeleton } from "../DashboardLoadingSkeleton";
import { DashboardStudyCalendar } from "../DashboardStudyCalendar";
import { MaterialsSection } from "../MaterialsSection";
import { StatsSummary } from "../StatsSummary";
import type { DashboardContentViewModel } from "./useDashboardContent";

export function DashboardContentPresenter(props: DashboardContentViewModel) {
  const {
    isLoading,
    isError,
    loadingMessage,
    header,
    statsCards,
    materials,
    calendar,
  } = props;

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-[992px] px-6">
        <LoadingSkeleton message={loadingMessage} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto w-full max-w-[992px] px-6">
        <ErrorState message="学習データの取得中に問題が発生しました。" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[992px] space-y-6 px-4 sm:px-6">
      <DashboardHeader
        greetingName={header.greetingName}
        totalQuestionCount={header.totalQuestionCount}
      />
      <section className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <StatsSummary cards={statsCards} />
        <MaterialsSection items={materials} />
      </section>
      <DashboardStudyCalendar calendar={calendar} />
    </div>
  );
}
