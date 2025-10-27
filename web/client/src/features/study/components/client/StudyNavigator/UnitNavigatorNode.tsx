"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";

import { useUnitDetailQuery } from "@/features/units/queries/useUnitDetailQuery";
import { cn } from "@/shared/lib/utils";

import type {
  NavigatorQuestion,
  NavigatorQuestionSource,
  UnitNavigatorNodeProps,
} from "./StudyNavigator.types";

export function UnitNavigatorNode(props: UnitNavigatorNodeProps) {
  const {
    unit,
    accountId,
    isCurrentUnit,
    isExpanded,
    currentQuestionId,
    currentUnitQuestions,
    onToggle,
    onSelectQuestion,
    onNavigateUnit,
  } = props;

  const { data, isLoading } = useUnitDetailQuery(unit.id, accountId, {
    enabled: isExpanded && !isCurrentUnit,
  });

  const containerRef = useRef<HTMLDivElement | null>(null);

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
        japanese: question.japanese,
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

  return (
    <div
      ref={containerRef}
      className="rounded-lg border border-slate-200/70 bg-white/90 shadow-sm"
    >
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          "flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left transition hover:bg-indigo-50/60",
          isCurrentUnit && "border-l-4 border-indigo-400 bg-indigo-50/70",
        )}
      >
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900">
            {unit.name}
          </p>
          <p className="text-xs text-muted-foreground">
            {unit.solvedQuestionCount}/{unit.questionCount} 問正解 ({solvedRate}
            %)
          </p>
        </div>
        {isExpanded ? (
          <ChevronDown className="size-4 text-indigo-500" />
        ) : (
          <ChevronRight className="size-4 text-slate-400" />
        )}
      </button>
      {isExpanded ? (
        <div className="border-t border-slate-200/60 bg-slate-50/70">
          {isLoading && !isCurrentUnit ? (
            <div className="px-3 py-4 text-xs text-muted-foreground">
              問題一覧を読み込んでいます…
            </div>
          ) : questionItems.length > 0 ? (
            <ul className="space-y-1 px-3 py-3">
              {questionItems.map((question) => (
                <li key={question.id}>
                  <button
                    type="button"
                    onClick={() =>
                      isCurrentUnit
                        ? onSelectQuestion(question.id)
                        : onNavigateUnit(unit.id, question.id)
                    }
                    className={cn(
                      "flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs transition hover:bg-indigo-100/80",
                      isCurrentUnit && currentQuestionId === question.id
                        ? "bg-indigo-100 text-indigo-700"
                        : "text-slate-600",
                    )}
                  >
                    <span className="min-w-0 flex-1 truncate">
                      <span className="font-semibold text-indigo-600">
                        {question.label}
                      </span>
                      <span className="ml-2 text-[11px] text-slate-500">
                        {question.japanese}
                      </span>
                    </span>
                    <span className="ml-auto whitespace-nowrap text-[11px] text-slate-400">
                      {formatAccuracy(question.statistics?.accuracy)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-3 py-4 text-xs text-muted-foreground">
              このUNITにはまだ問題がありません。
            </div>
          )}
          {!isCurrentUnit ? (
            <div className="flex items-center justify-end gap-2 border-t border-slate-200/60 bg-white px-3 py-2">
              <button
                type="button"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                onClick={() => onNavigateUnit(unit.id)}
              >
                このUNITに移動
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function mapQuestionToNavigator(
  question: NavigatorQuestionSource,
): NavigatorQuestion {
  return {
    id: question.id,
    label: `Q${question.order}`,
    japanese: question.japanese,
    statistics: question.statistics,
    order: question.order,
  };
}

function extractOrderFromTitle(title: string) {
  const match = title.match(/^Q(\d+)/);
  return match ? Number.parseInt(match[1], 10) : 0;
}

function formatAccuracy(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return "--";
  }
  return `${Math.round(value * 100)}%`;
}
