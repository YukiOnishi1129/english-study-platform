"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import type {
  NavigatorContentProps,
  StudyNavigatorProps,
} from "../StudyNavigator/types";

export interface UseStudyNavigatorSidebarOptions
  extends Pick<
      NavigatorContentProps,
      | "materialDetail"
      | "currentUnitId"
      | "currentQuestionId"
      | "currentUnitQuestions"
      | "accountId"
    >,
    Pick<StudyNavigatorProps, "onSelectQuestion" | "onNavigateUnit"> {
  maxHeight?: string;
}

export interface UseStudyNavigatorSidebarResult {
  maxHeight: string;
  navigatorProps: NavigatorContentProps;
}

export function useStudyNavigatorSidebar(
  options: UseStudyNavigatorSidebarOptions,
): UseStudyNavigatorSidebarResult {
  const {
    materialDetail,
    currentUnitId,
    currentQuestionId,
    currentUnitQuestions,
    accountId,
    onSelectQuestion,
    onNavigateUnit,
    maxHeight = "calc(100vh - 12rem)",
  } = options;

  const [expandedUnitId, setExpandedUnitId] = useState<string | null>(
    currentUnitId,
  );

  useEffect(() => {
    setExpandedUnitId(currentUnitId);
  }, [currentUnitId]);

  const handleToggleUnit = useCallback((unitId: string) => {
    setExpandedUnitId((prev) => (prev === unitId ? null : unitId));
  }, []);

  const handleSelectQuestion = useCallback(
    (questionId: string) => {
      onSelectQuestion(questionId);
    },
    [onSelectQuestion],
  );

  const handleNavigateUnit = useCallback(
    (unitId: string, questionId?: string) => {
      onNavigateUnit(unitId, questionId);
      setExpandedUnitId(unitId);
    },
    [onNavigateUnit],
  );

  const navigatorProps = useMemo<NavigatorContentProps>(
    () => ({
      materialDetail,
      currentUnitId,
      currentQuestionId,
      currentUnitQuestions,
      accountId,
      expandedUnitId,
      onToggleUnit: handleToggleUnit,
      onSelectQuestion: handleSelectQuestion,
      onNavigateUnit: handleNavigateUnit,
    }),
    [
      materialDetail,
      currentUnitId,
      currentQuestionId,
      currentUnitQuestions,
      accountId,
      expandedUnitId,
      handleToggleUnit,
      handleSelectQuestion,
      handleNavigateUnit,
    ],
  );

  return {
    maxHeight,
    navigatorProps,
  } satisfies UseStudyNavigatorSidebarResult;
}
