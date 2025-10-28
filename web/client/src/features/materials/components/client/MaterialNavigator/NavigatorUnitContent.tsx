"use client";

import { ChevronRight, Star } from "lucide-react";

import type { MaterialNavigatorUnitView } from "./useMaterialNavigator";

interface NavigatorUnitContentProps {
  unit: MaterialNavigatorUnitView;
}

export function NavigatorUnitContent({ unit }: NavigatorUnitContentProps) {
  return (
    <>
      <div className="flex flex-col">
        <span className="font-semibold text-slate-900">{unit.name}</span>
        <span className="text-xs text-muted-foreground">
          {unit.questionCount}問中 {unit.solvedQuestionCount}問クリア
        </span>
      </div>
      <div className="flex items-center gap-2 text-xs text-indigo-500">
        {!unit.isPlayable ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-500">
            準備中
          </span>
        ) : unit.isCompleted ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2 py-1 text-[11px] font-semibold text-indigo-600">
            <Star className="size-3" /> コンプリート
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-indigo-600">
            残り {unit.remainingCount}問
            <ChevronRight className="size-3" />
          </span>
        )}
      </div>
    </>
  );
}
