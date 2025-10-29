"use client";

import Link from "next/link";
import { ReviewSessionCompletedState } from "./components/CompletedState";
import { ReviewSessionEmptyState } from "./components/EmptyState";
import { SessionHeaderCard } from "./components/SessionHeaderCard";
import { SessionQuestionCard } from "./components/SessionQuestionCard";
import type { UseReviewStudySessionResult } from "./useReviewStudySession";

export interface ReviewStudySessionPresenterProps
  extends UseReviewStudySessionResult {}

export function ReviewStudySessionPresenter({
  hasQuestions,
  isCompleted,
  status,
  encouragement,
  isAnswered,
  materialName,
  groupLabel,
  remainingCount,
  currentIndex,
  currentQuestion,
  inputValue,
  isSubmitting,
  errorMessage,
  isHintVisible,
  speakingAnswer,
  onInputChange,
  onSubmit,
  onFillReferenceAnswer,
  onToggleHint,
  onRetryCurrent,
  onNextQuestion,
  onSpeakAnswer,
}: ReviewStudySessionPresenterProps) {
  if (!hasQuestions) {
    return <ReviewSessionEmptyState />;
  }

  if (isCompleted) {
    return <ReviewSessionCompletedState />;
  }

  if (!currentQuestion) {
    return null;
  }

  return (
    <div className="space-y-6">
      <SessionHeaderCard
        materialName={materialName}
        groupLabel={groupLabel}
        remainingCount={remainingCount}
        currentQuestion={currentQuestion}
      />

      <SessionQuestionCard
        currentQuestion={currentQuestion}
        currentIndex={currentIndex}
        status={status}
        encouragement={encouragement}
        isSubmitting={isSubmitting}
        isAnswered={isAnswered}
        isHintVisible={isHintVisible}
        speakingAnswer={speakingAnswer}
        inputValue={inputValue}
        errorMessage={errorMessage}
        onSubmit={onSubmit}
        onInputChange={onInputChange}
        onFillReferenceAnswer={onFillReferenceAnswer}
        onToggleHint={onToggleHint}
        onRetryCurrent={onRetryCurrent}
        onNextQuestion={onNextQuestion}
        onSpeakAnswer={onSpeakAnswer}
      />

      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <Link
          href="/review"
          className="font-semibold text-indigo-600 transition hover:text-indigo-500"
        >
          復習ページへ戻る
        </Link>
        <span>・</span>
        <span>残り {remainingCount} 問</span>
      </div>
    </div>
  );
}
