"use client";

import { StudyNavigatorPresenter } from "./StudyNavigatorPresenter";
import type { StudyNavigatorProps } from "./types";
import { useStudyNavigator } from "./useStudyNavigator";

export function StudyNavigator(props: StudyNavigatorProps) {
  const { materialDetail, currentUnitId, onSelectQuestion, onNavigateUnit } =
    props;

  const navigatorState = useStudyNavigator({
    materialDetail,
    currentUnitId,
    onSelectQuestion,
    onNavigateUnit,
  });

  return (
    <StudyNavigatorPresenter
      {...props}
      isNavigatorReady={navigatorState.isNavigatorReady}
      isOpen={navigatorState.isOpen}
      onOpenChange={navigatorState.onOpenChange}
      expandedUnitId={navigatorState.expandedUnitId}
      onToggleUnit={navigatorState.onToggleUnit}
      onSelectQuestionInternal={navigatorState.onSelectQuestionInternal}
      onNavigateUnitInternal={navigatorState.onNavigateUnitInternal}
    />
  );
}
