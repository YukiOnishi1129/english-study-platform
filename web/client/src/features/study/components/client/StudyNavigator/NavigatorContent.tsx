"use client";

import { BookMarked } from "lucide-react";

import { ScrollArea } from "@/shared/components/ui/scroll-area";

import type { NavigatorContentProps } from "./StudyNavigator.types";
import { UnitNavigatorNode } from "./UnitNavigatorNode";

export function NavigatorContent(props: NavigatorContentProps) {
  const {
    materialDetail,
    currentUnitId,
    currentQuestionId,
    currentUnitQuestions,
    accountId,
    expandedUnitId,
    onToggleUnit,
    onSelectQuestion,
    onNavigateUnit,
  } = props;

  if (!materialDetail) {
    return (
      <div className="rounded-lg border border-dashed border-indigo-200 p-4 text-xs text-muted-foreground">
        教材情報を読み込み中です…
      </div>
    );
  }

  const { material, chapters } = materialDetail;

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="rounded-lg border border-indigo-100 bg-indigo-50/60 p-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-indigo-500">
          教材
        </p>
        <p className="mt-1 text-sm font-semibold text-indigo-900">
          {material.name}
        </p>
        {material.description ? (
          <p className="mt-1 text-xs text-indigo-700/80">
            {material.description}
          </p>
        ) : null}
      </div>
      <ScrollArea className="flex-1 min-h-0">
        <div className="space-y-4 pr-2">
          {chapters.map((chapter) => (
            <div key={chapter.id} className="space-y-2">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                <BookMarked className="size-3.5" />
                {chapter.name}
              </div>
              <div className="space-y-2">
                {chapter.units.map((unit) => (
                  <UnitNavigatorNode
                    key={unit.id}
                    unit={unit}
                    accountId={accountId}
                    isCurrentUnit={unit.id === currentUnitId}
                    isExpanded={expandedUnitId === unit.id}
                    currentQuestionId={currentQuestionId}
                    currentUnitQuestions={currentUnitQuestions}
                    onToggle={() => onToggleUnit(unit.id)}
                    onSelectQuestion={onSelectQuestion}
                    onNavigateUnit={onNavigateUnit}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
