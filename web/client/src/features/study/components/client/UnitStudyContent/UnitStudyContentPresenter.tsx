"use client";

import {
  CheckCircle2,
  CircleHelp,
  RotateCcw,
  Volume2,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useId } from "react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/shared/components/ui/breadcrumb";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Separator } from "@/shared/components/ui/separator";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { cn } from "@/shared/lib/utils";

import type { UseUnitStudyContentResult } from "./useUnitStudyContent";

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-6 w-48" />
      <Card>
        <CardHeader className="space-y-2">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-20 w-full" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-24" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ErrorState() {
  return (
    <Card className="border-red-200 bg-red-50 text-red-700">
      <CardHeader>
        <CardTitle>学習データを読み込めませんでした</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-red-700/80">
        ページを再読み込みしても解消しない場合は、時間をおいて再度お試しください。
      </CardContent>
    </Card>
  );
}

function renderBreadcrumb(items: UseUnitStudyContentResult["breadcrumb"]) {
  if (items.length === 0) {
    return null;
  }
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <BreadcrumbItem key={item.id}>
              {item.href && !isLast ? (
                <BreadcrumbLink asChild>
                  <Link href={{ pathname: item.href }}>{item.label}</Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              )}
              {!isLast ? <BreadcrumbSeparator /> : null}
            </BreadcrumbItem>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

export function UnitStudyContentPresenter(props: UseUnitStudyContentResult) {
  const {
    isLoading,
    isError,
    isSubmitting,
    unit,
    material,
    breadcrumb,
    questionCount,
    answeredCount,
    correctCount,
    accuracyRate,
    currentIndex,
    progressLabel,
    currentQuestion,
    currentStatistics,
    inputValue,
    status,
    isHintVisible,
    isAnswerVisible,
    isAutoAdvancing,
    autoAdvanceSeconds,
    errorMessage,
    onInputChange,
    onToggleHint,
    onSubmit,
    onNext,
    onReset,
  } = props;

  const answerInputId = useId();

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (isError || !unit || !material) {
    return <ErrorState />;
  }

  if (!currentQuestion) {
    return (
      <Card className="border border-indigo-100 bg-white/95">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900">
            このUNITにはまだ学習問題が登録されていません
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          管理画面からCSVインポートや個別登録を行うと、ここで学習を開始できるようになります。
        </CardContent>
      </Card>
    );
  }

  const statusIcon =
    status === "correct"
      ? CheckCircle2
      : status === "incorrect"
        ? XCircle
        : CircleHelp;
  const StatusIcon = statusIcon;

  const statusLabel =
    status === "correct"
      ? "正解です！"
      : status === "incorrect"
        ? "不正解です"
        : "解答待ち";

  const remainingCount = questionCount - currentIndex - 1;

  return (
    <div className="space-y-6">
      {renderBreadcrumb(breadcrumb)}

      <section className="grid gap-4 md:grid-cols-3">
        <Card className="border-indigo-100/80 bg-white/95 md:col-span-2">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-slate-900">
              {unit.name}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {material.name} &middot; {progressLabel} 問目
            </p>
          </CardHeader>
        </Card>
        <Card className="border-indigo-100/80 bg-white/95">
          <CardHeader className="space-y-2">
            <CardTitle className="text-sm font-semibold text-slate-900">
              今日の進捗
            </CardTitle>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>
                解答済み:{" "}
                <span className="font-semibold text-slate-900">
                  {answeredCount} 問
                </span>
              </p>
              <p>
                正解数:{" "}
                <span className="font-semibold text-slate-900">
                  {correctCount} 問
                </span>
              </p>
              <p>
                正答率:{" "}
                <span className="font-semibold text-slate-900">
                  {accuracyRate !== null ? `${accuracyRate}%` : "--"}
                </span>
              </p>
            </div>
            <Separator className="my-2" />
            <div className="space-y-1 text-xs text-muted-foreground">
              <p className="font-semibold text-slate-900">この問題の学習記録</p>
              {currentStatistics ? (
                <>
                  <p>
                    通算解答回数:{" "}
                    <span className="font-semibold text-slate-900">
                      {currentStatistics.totalAttempts} 回
                    </span>
                  </p>
                  <p>
                    通算正解数:{" "}
                    <span className="font-semibold text-slate-900">
                      {currentStatistics.correctCount} 回
                    </span>
                  </p>
                  <p>
                    通算正答率:{" "}
                    <span className="font-semibold text-slate-900">
                      {Math.round(currentStatistics.accuracy * 100)}%
                    </span>
                  </p>
                </>
              ) : (
                <p>まだこの問題の解答履歴はありません。</p>
              )}
            </div>
            <Button
              type="button"
              variant="outline"
              className="mt-2 gap-2 text-xs"
              onClick={onReset}
              disabled={isSubmitting}
            >
              <RotateCcw className="size-4" />
              セッションをリセット
            </Button>
          </CardHeader>
        </Card>
      </section>

      <Card className="border border-indigo-200/70 bg-white/95 shadow-sm">
        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-indigo-600">
              {currentQuestion.title}
            </p>
            <CardTitle className="mt-1 text-xl text-slate-900">
              {currentQuestion.japanese}
            </CardTitle>
          </div>
          <div className="text-right text-xs text-muted-foreground">
            残り {remainingCount >= 0 ? remainingCount : 0} 問
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              variant={isHintVisible ? "default" : "outline"}
              size="sm"
              onClick={onToggleHint}
            >
              ヒントを{isHintVisible ? "閉じる" : "表示"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="gap-2 text-indigo-600 hover:text-indigo-700"
              onClick={() => {
                // TODO: 実装時に音声再生を接続
              }}
              disabled
            >
              <Volume2 className="size-4" />
              音声再生（準備中）
            </Button>
          </div>

          {isHintVisible && currentQuestion.hint ? (
            <div className="rounded-lg border border-indigo-100 bg-indigo-50/70 px-4 py-3 text-sm text-indigo-900">
              ヒント: {currentQuestion.hint}
            </div>
          ) : null}

          <form className="space-y-3" onSubmit={onSubmit}>
            <label
              className="block text-sm font-medium text-slate-700"
              htmlFor={answerInputId}
            >
              英語で回答
            </label>
            <Input
              id={answerInputId}
              value={inputValue}
              onChange={(event) => onInputChange(event.target.value)}
              placeholder="Enter your answer..."
              autoFocus
              disabled={isSubmitting}
            />
            <div className="flex flex-wrap gap-3">
              <Button
                type="submit"
                className="flex-1 min-w-[140px]"
                disabled={isSubmitting}
              >
                {isSubmitting ? "判定中..." : "回答する"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="flex-1 min-w-[140px]"
                onClick={onNext}
                disabled={isSubmitting}
              >
                次の問題に進む
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Enterキーで回答すると約{autoAdvanceSeconds}
              秒後に自動で次の問題へ移動します。
            </p>
            {isAutoAdvancing ? (
              <p className="text-xs font-medium text-indigo-600">
                {autoAdvanceSeconds}秒後に次の問題へ移動します...
              </p>
            ) : null}
            {errorMessage ? (
              <p className="text-xs font-medium text-red-600">{errorMessage}</p>
            ) : null}
          </form>

          <Separator />

          <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
            <StatusIcon className="size-5 text-indigo-600" />
            <span
              className={cn(
                "font-semibold",
                status === "correct" && "text-green-600",
                status === "incorrect" && "text-red-600",
              )}
            >
              {statusLabel}
            </span>
            <span className="ml-auto text-xs text-muted-foreground">
              解答 {answeredCount} / 正解 {correctCount}
            </span>
          </div>

          {isAnswerVisible ? (
            <div className="space-y-3 rounded-lg border border-indigo-100 bg-indigo-50/70 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">
                正解例
              </p>
              <ul className="list-disc space-y-1 pl-5 text-sm text-indigo-900">
                {currentQuestion.acceptableAnswers.map((answer) => (
                  <li key={answer}>{answer}</li>
                ))}
              </ul>
              {currentQuestion.explanation ? (
                <p className="text-xs text-indigo-800/90">
                  解説: {currentQuestion.explanation}
                </p>
              ) : null}
              {currentStatistics ? (
                <div className="grid gap-2 rounded-lg border border-indigo-100 bg-white/70 p-3 text-xs text-slate-700">
                  <div className="flex items-center justify-between">
                    <span>解答回数</span>
                    <span className="font-semibold text-slate-900">
                      {currentStatistics.totalAttempts} 回
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>正解数</span>
                    <span className="font-semibold text-slate-900">
                      {currentStatistics.correctCount} 回
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>正答率</span>
                    <span className="font-semibold text-slate-900">
                      {Math.round(currentStatistics.accuracy * 100)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>最終解答日</span>
                    <span>
                      {currentStatistics.lastAttemptedAt
                        ? new Date(
                            currentStatistics.lastAttemptedAt,
                          ).toLocaleString()
                        : "--"}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-indigo-700/80">
                  まだこの問題の学習履歴はありません。
                </p>
              )}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
