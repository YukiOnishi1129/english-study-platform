"use client";

import { useEffect, useMemo, useRef } from "react";

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

function mapQuestionToNavigator(
  question: NavigatorQuestionSource,
): NavigatorQuestion {
  return {
    id: question.id,
    label: `Q${question.order}`,
    japanese: question.japanese,
    statistics: question.statistics ?? null,
    order: question.order,
  } satisfies NavigatorQuestion;
}

export function useUnitNavigatorNodeView(props: UnitNavigatorNodeProps) {
  const {
    unit,
    accountId,
    isCurrentUnit,
    isExpanded,
    currentQuestionId,
    currentUnitQuestions,
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
        japanese: question.navigatorLabel ?? question.japanese,
        statistics: question.statistics,
        order: extractOrderFromTitle(question.title),
      }));
    }

    if (!data) {
      return [];
    }

    return data.questions.map(mapQuestionToNavigator);
  }, [currentUnitQuestions, data, isCurrentUnit]);

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
