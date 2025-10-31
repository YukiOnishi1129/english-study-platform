"use client";

import { BookOpen, Library, ListTree } from "lucide-react";

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

import { NavigatorContent } from "./NavigatorContent";
import type { StudyNavigatorPresenterProps } from "./types";

export function StudyNavigatorPresenter(props: StudyNavigatorPresenterProps) {
  const {
    materialDetail,
    currentUnitId,
    currentQuestionId,
    questions,
    accountId,
    displayMode,
    expandedUnitId,
    isNavigatorReady,
    isOpen,
    onOpenChange,
    onToggleUnit,
    onSelectQuestionInternal,
    onNavigateUnitInternal,
  } = props;

  const navigatorContent = (
    <NavigatorContent
      materialDetail={materialDetail}
      currentUnitId={currentUnitId}
      currentQuestionId={currentQuestionId}
      currentUnitQuestions={questions}
      accountId={accountId}
      expandedUnitId={expandedUnitId}
      displayMode={displayMode}
      onToggleUnit={onToggleUnit}
      onSelectQuestion={onSelectQuestionInternal}
      onNavigateUnit={onNavigateUnitInternal}
    />
  );

  return (
    <div className="flex flex-col gap-4 xl:flex-row xl:items-start">
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
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
        <SheetContent
          side="left"
          className="w-full max-w-sm bg-white/95 gap-0 p-0"
        >
          <SheetHeader className="border-b border-indigo-100 bg-indigo-50/60">
            <SheetTitle className="flex items-center gap-2 text-base text-indigo-700">
              <BookOpen className="size-4" />
              学習マップ
            </SheetTitle>
          </SheetHeader>
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-4">
            {navigatorContent}
          </div>
        </SheetContent>
      </Sheet>

      <div className="hidden xl:block">
        <Card className="border border-indigo-100 bg-white/95 shadow-sm">
          <CardHeader className="flex flex-row items-center gap-2 border-b border-indigo-50 pb-3">
            <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
              <Library className="size-4" />
            </div>
            <CardTitle className="text-base font-semibold text-slate-900">
              学習マップ
            </CardTitle>
          </CardHeader>
          <CardContent className="max-h-[calc(100vh-12rem)] p-0">
            <ScrollArea className="max-h-[calc(100vh-12rem)]">
              <div className="p-3">{navigatorContent}</div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
