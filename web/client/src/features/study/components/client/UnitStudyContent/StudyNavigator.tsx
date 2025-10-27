"use client";

import {
  BookMarked,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Library,
  ListTree,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import type { MaterialDetailDto } from "@/external/dto/material/material.detail.dto";
import type { UnitDetailQuestionDto } from "@/external/dto/unit/unit.query.dto";
import { useUnitDetailQuery } from "@/features/units/queries/useUnitDetailQuery";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/components/ui/sheet";
import { cn } from "@/shared/lib/utils";
import type { UnitStudyQuestionViewModel } from "./useUnitStudyContent";

interface StudyNavigatorProps {
  materialDetail: MaterialDetailDto | null;
  currentUnitId: string;
  currentQuestionId: string | null;
  questions: UnitStudyQuestionViewModel[];
  accountId: string | null;
  onSelectQuestion: (questionId: string) => void;
  onNavigateUnit: (unitId: string, questionId?: string) => void;
}

export function StudyNavigator(props: StudyNavigatorProps) {
  const {
    materialDetail,
    currentUnitId,
    currentQuestionId,
    questions,
    accountId,
    onSelectQuestion,
    onNavigateUnit,
  } = props;

  const [isOpen, setIsOpen] = useState(false);
  const [expandedUnitId, setExpandedUnitId] = useState<string | null>(
    currentUnitId,
  );

  useEffect(() => {
    setExpandedUnitId(currentUnitId);
  }, [currentUnitId]);

  const toggleUnit = useCallback((unitId: string) => {
    setExpandedUnitId((prev) => (prev === unitId ? null : unitId));
  }, []);

  const navigatorContent = (
    <NavigatorContent
      materialDetail={materialDetail}
      currentUnitId={currentUnitId}
      currentQuestionId={currentQuestionId}
      currentUnitQuestions={questions}
      accountId={accountId}
      expandedUnitId={expandedUnitId}
      onToggleUnit={toggleUnit}
      onSelectQuestion={(questionId) => {
        onSelectQuestion(questionId);
        setIsOpen(false);
      }}
      onNavigateUnit={(unitId, questionId) => {
        onNavigateUnit(unitId, questionId);
        setIsOpen(false);
      }}
    />
  );

  const isNavigatorReady = Boolean(materialDetail);

  return (
    <div className="flex flex-col gap-4 xl:flex-row xl:items-start">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="flex w-full items-center justify-center gap-2 rounded-xl border-indigo-200 bg-white/80 px-4 py-2 text-sm text-indigo-600 hover:bg-indigo-50 xl:hidden"
            disabled={!isNavigatorReady}
          >
            <ListTree className="size-4" />
            学習マップを開く
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-full max-w-sm bg-white/95 p-0">
          <SheetHeader className="border-b border-indigo-100 bg-indigo-50/60">
            <SheetTitle className="flex items-center gap-2 text-base text-indigo-700">
              <BookOpen className="size-4" />
              学習マップ
            </SheetTitle>
          </SheetHeader>
          <div className="flex h-full flex-col overflow-hidden p-4">
            {navigatorContent}
          </div>
        </SheetContent>
      </Sheet>

      <div className="hidden w-64 shrink-0 xl:block">
        <Card className="border border-indigo-100 bg-white/95 shadow-sm">
          <CardHeader className="flex flex-row items-center gap-2 border-b border-indigo-50 pb-3">
            <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
              <Library className="size-4" />
            </div>
            <CardTitle className="text-base font-semibold text-slate-900">
              学習マップ
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="p-3">{navigatorContent}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface NavigatorContentProps {
  materialDetail: MaterialDetailDto | null;
  currentUnitId: string;
  currentQuestionId: string | null;
  currentUnitQuestions: UnitStudyQuestionViewModel[];
  accountId: string | null;
  expandedUnitId: string | null;
  onToggleUnit: (unitId: string) => void;
  onSelectQuestion: (questionId: string) => void;
  onNavigateUnit: (unitId: string, questionId?: string) => void;
}

function NavigatorContent(props: NavigatorContentProps) {
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
      <ScrollArea className="flex-1">
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
                    currentQuestionId={currentQuestionId}
                    currentUnitQuestions={currentUnitQuestions}
                    isExpanded={expandedUnitId === unit.id}
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

interface UnitNavigatorNodeProps {
  unit: MaterialDetailDto["chapters"][number]["units"][number];
  accountId: string | null;
  isCurrentUnit: boolean;
  isExpanded: boolean;
  currentQuestionId: string | null;
  currentUnitQuestions: UnitStudyQuestionViewModel[];
  onToggle: () => void;
  onSelectQuestion: (questionId: string) => void;
  onNavigateUnit: (unitId: string, questionId?: string) => void;
}

function UnitNavigatorNode(props: UnitNavigatorNodeProps) {
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

  const questionItems: NavigatorQuestion[] = useMemo(() => {
    if (isCurrentUnit) {
      return currentUnitQuestions.map((question) => ({
        id: question.id,
        label: question.title,
        japanese: question.japanese,
        order: Number(question.title.replace("Q", "")) || 0,
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
    <div className="rounded-lg border border-slate-200/70 bg-white/90 shadow-sm">
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
                      "w-full rounded-md px-3 py-2 text-left text-xs transition hover:bg-indigo-100/80",
                      isCurrentUnit && currentQuestionId === question.id
                        ? "bg-indigo-100 text-indigo-700"
                        : "text-slate-600",
                    )}
                  >
                    <span className="font-semibold text-indigo-600">
                      {question.label}
                    </span>
                    <span className="ml-2 text-[11px] text-slate-500">
                      {question.japanese}
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
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="text-xs text-indigo-600 hover:text-indigo-700"
                onClick={() => onNavigateUnit(unit.id)}
              >
                このUNITに移動
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

interface NavigatorQuestion {
  id: string;
  label: string;
  japanese: string;
  order: number;
}

function mapQuestionToNavigator(
  question: UnitDetailQuestionDto,
): NavigatorQuestion {
  return {
    id: question.id,
    label: `Q${question.order}`,
    japanese: question.japanese,
    order: question.order,
  };
}
