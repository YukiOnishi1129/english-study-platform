"use client";

import { StudyNavigator, StudyNavigatorSidebar } from "../StudyNavigator";
import { UnitStudyBreadcrumb } from "../UnitStudyBreadcrumb";
import { UnitStudyHeaderCard } from "../UnitStudyHeaderCard";
import { UnitStudyNoQuestion } from "../UnitStudyNoQuestion";
import { UnitStudyQuestionCard } from "../UnitStudyQuestionCard";
import { UnitStudyStatisticsCard } from "../UnitStudyStatisticsCard";
import { UnitStudyContentError } from "./UnitStudyContentError";
import { UnitStudyContentLoading } from "./UnitStudyContentLoading";
import type { UseUnitStudyContentResult } from "./useUnitStudyContent";

export function UnitStudyContentPresenter(props: UseUnitStudyContentResult) {
  const {
    isLoading,
    isError,
    unit,
    material,
    materialDetail,
    breadcrumb,
    questionCount,
    currentQuestion,
    currentStatistics,
    questions,
    accountId,
    progressLabel,
    answeredCount,
    correctCount,
    accuracyRate,
    encouragement,
    answerInputId,
    inputValue,
    onInputChange,
    onSubmit,
    onNext,
    onReset,
    onRetryCurrent,
    disableSubmit,
    disableNext,
    status,
    statusLabel,
    isHintVisible,
    onToggleHint,
    errorMessage,
    isAnswerVisible,
    speakingAnswer,
    onSpeakAnswer,
    remainingCount,
    isSubmitting,
    onSelectQuestion,
    onNavigateUnit,
    availableModes,
    selectedMode,
    onChangeMode,
  } = props;

  if (isLoading) {
    return <UnitStudyContentLoading />;
  }

  if (isError || !unit || !material) {
    return <UnitStudyContentError />;
  }

  if (!currentQuestion) {
    return (
      <div className="space-y-6">
        <UnitStudyBreadcrumb items={breadcrumb} />
        <UnitStudyNoQuestion />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <UnitStudyBreadcrumb items={breadcrumb} />

      <div className="flex flex-col gap-6 xl:grid xl:grid-cols-[320px,minmax(0,1fr)] xl:items-start xl:gap-6">
        <aside className="hidden xl:sticky xl:top-24 xl:flex xl:h-[calc(100vh-12rem)] xl:w-92 xl:self-start">
          <StudyNavigatorSidebar
            materialDetail={materialDetail}
            currentUnitId={unit.id}
            currentQuestionId={currentQuestion.id}
            currentUnitQuestions={questions}
            accountId={accountId}
            onSelectQuestion={onSelectQuestion}
            onNavigateUnit={onNavigateUnit}
            maxHeight="calc(100vh - 12rem)"
          />
        </aside>

        <div className="space-y-6 xl:col-start-2">
          <UnitStudyHeaderCard
            materialName={material.name}
            unitName={unit.name}
            encouragement={encouragement}
            progressLabel={progressLabel}
            answeredCount={answeredCount}
            questionCount={questionCount}
            correctCount={correctCount}
            accuracyRate={accuracyRate}
          />

          <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
            <UnitStudyQuestionCard
              progressLabel={progressLabel}
              question={currentQuestion}
              answerInputId={answerInputId}
              inputValue={inputValue}
              onInputChange={onInputChange}
              onSubmit={onSubmit}
              disableSubmit={disableSubmit}
              onNext={onNext}
              disableNext={disableNext}
              onRetryCurrent={onRetryCurrent}
              onRestartUnit={onReset}
              status={status}
              statusLabel={statusLabel}
              answeredCount={answeredCount}
              correctCount={correctCount}
              isHintVisible={isHintVisible}
              onToggleHint={onToggleHint}
              errorMessage={errorMessage}
              isAnswerVisible={isAnswerVisible}
              currentStatistics={currentStatistics}
              speakingAnswer={speakingAnswer}
              onSpeakAnswer={onSpeakAnswer}
              remainingCount={remainingCount}
              isSubmitting={isSubmitting}
              availableModes={availableModes}
              selectedMode={selectedMode}
              onChangeMode={onChangeMode}
            />

            <UnitStudyStatisticsCard statistics={currentStatistics} />
          </div>
        </div>
      </div>

      <div className="xl:hidden">
        <StudyNavigator
          materialDetail={materialDetail}
          currentUnitId={unit.id}
          currentQuestionId={currentQuestion.id}
          questions={questions}
          accountId={accountId}
          onSelectQuestion={onSelectQuestion}
          onNavigateUnit={onNavigateUnit}
        />
      </div>
    </div>
  );
}
