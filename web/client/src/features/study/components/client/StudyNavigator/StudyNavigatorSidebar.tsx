"use client";

import { Library } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { ScrollArea } from "@/shared/components/ui/scroll-area";

import { NavigatorContent } from "./NavigatorContent";
import type { NavigatorContentProps, StudyNavigatorProps } from "./types";

interface StudyNavigatorSidebarProps
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

export function StudyNavigatorSidebar({
  materialDetail,
  currentUnitId,
  currentQuestionId,
  currentUnitQuestions,
  accountId,
  onSelectQuestion,
  onNavigateUnit,
  maxHeight = "calc(100vh - 12rem)",
}: StudyNavigatorSidebarProps) {
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

  const navigatorProps: NavigatorContentProps = useMemo(
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

  return (
    <Card
      className="flex h-full flex-col border border-indigo-100 bg-white/95 shadow-sm"
      style={{ maxHeight }}
    >
      <CardHeader className="flex flex-row items-center gap-2 border-b border-indigo-50 pb-3">
        <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
          <Library className="size-4" />
        </div>
        <CardTitle className="text-base font-semibold text-slate-900">
          学習マップ
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea
          className="h-full"
          style={{ maxHeight: `calc(${maxHeight} - 3.5rem)` }}
        >
          <div className="p-3">
            <NavigatorContent {...navigatorProps} />
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
