"use client";

import { useEffect, useMemo, useRef } from "react";
import type { UnitDetailQuestionStatisticsDto } from "@/external/dto/unit/unit.query.dto";
import { mapStatistics } from "@/features/study/components/client/UnitStudyContent/utils";
import { useUnitDetailQuery } from "@/features/units/queries/useUnitDetailQuery";

import type {
  NavigatorQuestion,
  NavigatorQuestionSource,
  UnitNavigatorNodeProps,
} from "./types";

function extractOrderFromTitle(title: string): number {
  const match = title.match(/\d+/);
  return match ? Number.parseInt(match[0], 10) : 0;
}

function buildNavigatorText(question: NavigatorQuestionSource): string {
  if (question.questionType === "en_to_jp") {
    return (
      question.headword ??
      question.correctAnswers[0]?.answerText ??
      question.japanese
    );
  }
  return question.japanese;
}

function mapQuestionToNavigator(
  question: NavigatorQuestionSource,
): NavigatorQuestion {
  return {
    id: question.id,
    label: `Q${question.order}`,
    displayText: buildNavigatorText(question),
    statistics: mapStatistics(question.statistics, question.modeStatistics),
    modeStatistics: null,
    mode: null,
    order: question.order,
  } satisfies NavigatorQuestion;
}

function transformModeStats(
  stats: UnitDetailQuestionStatisticsDto,
): NavigatorQuestion["modeStatistics"] {
  return {
    totalAttempts: stats.totalAttempts,
    correctCount: stats.correctCount,
    incorrectCount: stats.incorrectCount,
    accuracy: stats.accuracy,
    lastAttemptedAt: stats.lastAttemptedAt,
  };
}

export function useUnitNavigatorNodeView(props: UnitNavigatorNodeProps) {
  const {
    unit,
    accountId,
    isCurrentUnit,
    isExpanded,
    currentQuestionId,
    currentUnitQuestions,
    displayMode,
  } = props;

  const containerRef = useRef<HTMLDivElement | null>(null);

  const { data, isLoading } = useUnitDetailQuery(unit.id, accountId, {
    enabled: isExpanded && !isCurrentUnit,
  });

  useEffect(() => {
    if (isCurrentUnit && containerRef.current) {
      containerRef.current.scrollIntoView({ block: "start" });
    }
  }, [isCurrentUnit]);

  const questionItems = useMemo<NavigatorQuestion[]>(() => {
    if (isCurrentUnit) {
      return currentUnitQuestions.map((question) => ({
        id: question.id,
        label: question.title,
        displayText: question.navigatorLabel ?? question.japanese,
        statistics: question.statistics,
        modeStatistics: question.activeModeStatistics,
        mode: question.activeMode,
        order: extractOrderFromTitle(question.title),
      }));
    }

    if (!data) {
      return [];
    }

    const targetMode = displayMode;

    return data.questions.map((question) => {
      const base = mapQuestionToNavigator(question);
      const modeStats = question.modeStatistics?.[targetMode] ?? null;

      const displayText =
        targetMode === "en_to_jp"
          ? (question.headword ??
            question.correctAnswers[0]?.answerText ??
            question.japanese)
          : question.japanese;

      return {
        ...base,
        displayText,
        mode: targetMode,
        modeStatistics: modeStats ? transformModeStats(modeStats) : null,
      };
    });
  }, [currentUnitQuestions, data, displayMode, isCurrentUnit]);

  const solvedRate =
    unit.questionCount > 0
      ? Math.round((unit.solvedQuestionCount / unit.questionCount) * 100)
      : 0;

  const view = {
    questionItems,
    isLoading,
    solvedRate,
    containerRef,
    currentQuestionId,
  };

  return view;
}
