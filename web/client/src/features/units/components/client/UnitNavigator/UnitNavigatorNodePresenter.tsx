import { ChevronDown, ChevronRight } from "lucide-react";

import type { StudyMode } from "@/external/dto/study/submit-unit-answer.dto";
import { cn } from "@/shared/lib/utils";

import type { UnitNavigatorNodeProps } from "./types";
import type { useUnitNavigatorNodeView } from "./useUnitNavigatorNode";

type UnitNavigatorNodeView = ReturnType<typeof useUnitNavigatorNodeView>;

interface UnitNavigatorNodePresenterProps extends UnitNavigatorNodeProps {
  view: UnitNavigatorNodeView;
}

function formatAccuracy(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return "-";
  }
  return `${Math.round(value * 100)}%`;
}

const MODE_LABEL: Record<StudyMode, string> = {
  jp_to_en: "日→英",
  en_to_jp: "英→日",
  sentence: "英作文",
  default: "標準",
};

export function UnitNavigatorNodePresenter({
  unit,
  isCurrentUnit,
  isExpanded,
  currentQuestionId,

  onToggle,
  onSelectQuestion,
  onNavigateUnit,
  view,
}: UnitNavigatorNodePresenterProps) {
  const { questionItems, isLoading, solvedRate, containerRef } = view;

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
                        {question.displayText}
                      </span>
                    </span>
                    <span className="ml-auto whitespace-nowrap text-[11px] text-slate-400">
                      {question.mode ? `${MODE_LABEL[question.mode]} ` : ""}
                      {formatAccuracy(
                        (question.modeStatistics ?? question.statistics)
                          ?.accuracy ?? null,
                      )}
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
