"use client";

import {
  CheckCircle2,
  CircleHelp,
  RotateCcw,
  Sparkles,
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
  CardDescription,
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
    errorMessage,
    onInputChange,
    onToggleHint,
    onSubmit,
    onNext,
    onReset,
  } = props;

  const answerInputId = useId();
  const isAnswered = status !== "idle";
  const disableSubmit = isSubmitting || isAnswered;
  const disableNext = isSubmitting || status === "idle";
  const progressPercent =
    questionCount > 0 ? Math.round((currentIndex / questionCount) * 100) : 0;
  const encouragement =
    status === "correct"
      ? "やったね！その調子 🎉"
      : status === "incorrect"
        ? "大丈夫、もう一度チャレンジしよう 💪"
        : "準備はいい？さあ問題に挑戦！✨";

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
        ? "また挑戦してみよう"
        : "解答を待っています";

  const remainingCount = questionCount - currentIndex - 1;

  return (
    <div className="space-y-6">
      {renderBreadcrumb(breadcrumb)}

      <section className="space-y-4 rounded-3xl bg-gradient-to-br from-sky-50 via-white to-indigo-50/60 p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-indigo-500">
              {material.name}
            </p>
            <h1 className="flex items-center gap-2 text-3xl font-bold text-slate-900">
              {unit.name}
              <Sparkles className="size-6 text-indigo-500" />
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {encouragement}
            </p>
          </div>
          <div className="w-full max-w-xs space-y-3 rounded-2xl border border-indigo-100/80 bg-white/80 p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600">
              今日のがんばり
            </p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">解いた数</span>
              <span className="font-semibold text-slate-900">
                {answeredCount} / {questionCount} 問
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">正解</span>
              <span className="font-semibold text-slate-900">
                {correctCount} 問
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">正答率</span>
              <span className="font-semibold text-slate-900">
                {accuracyRate !== null ? `${accuracyRate}%` : "--"}
              </span>
            </div>
            <Separator />
            <div className="h-2 rounded-full bg-indigo-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-violet-500 transition-all"
                style={{ width: `${Math.min(progressPercent, 100)}%` }}
              />
            </div>
            <p className="text-right text-xs text-muted-foreground">
              {progressLabel}（{progressPercent}%）
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <Card className="border border-indigo-200/70 bg-white/95 shadow-md">
          <CardHeader className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-600">
                {progressLabel}
              </span>
              <Button
                type="button"
                variant="ghost"
                className="gap-1 text-xs text-muted-foreground"
                onClick={onReset}
                disabled={isSubmitting}
              >
                <RotateCcw className="size-3.5" />
                最初からやり直す
              </Button>
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900">
              {currentQuestion.title} {currentQuestion.japanese}
            </CardTitle>
            <CardDescription className="flex items-center justify-between text-sm text-slate-600">
              <span>
                「答える → 答えをチェック →
                次の問題へ」のリズムで繰り返し覚えましょう。
              </span>
              <span className="text-xs text-muted-foreground">
                残り {remainingCount >= 0 ? remainingCount : 0} 問
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="button"
                variant={isHintVisible ? "default" : "outline"}
                size="sm"
                onClick={onToggleHint}
              >
                ヒントを{isHintVisible ? "隠す" : "見る"}
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
                発音をきく（準備中）
              </Button>
            </div>

            {isHintVisible && currentQuestion.hint ? (
              <div className="rounded-2xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm text-indigo-900">
                ヒント: {currentQuestion.hint}
              </div>
            ) : null}

            <form
              className="space-y-3 rounded-2xl bg-slate-50/60 p-4"
              onSubmit={onSubmit}
            >
              <label
                className="block text-xs font-semibold uppercase tracking-widest text-slate-500"
                htmlFor={answerInputId}
              >
                英語で答えてみよう
              </label>
              <Input
                id={answerInputId}
                value={inputValue}
                onChange={(event) => onInputChange(event.target.value)}
                placeholder="例: Nice to meet you!"
                autoFocus
                disabled={disableSubmit}
                className="h-12 rounded-xl border-indigo-100 bg-white px-4 text-base"
              />
              <div className="flex flex-wrap gap-3">
                <Button
                  type="submit"
                  className="flex-1 min-w-[140px] rounded-xl bg-indigo-500 text-base font-semibold text-white hover:bg-indigo-500/90"
                  disabled={disableSubmit}
                >
                  {isSubmitting ? "判定中..." : "回答する"}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1 min-w-[140px] rounded-xl bg-amber-100 text-amber-800 hover:bg-amber-200"
                  onClick={onNext}
                  disabled={disableNext}
                >
                  次の問題へ進む
                </Button>
              </div>
              {status === "idle" ? (
                <p className="text-xs text-muted-foreground">
                  回答すると正解例と解説が表示されます。
                </p>
              ) : (
                <p className="text-xs text-indigo-600">
                  「次の問題へ進む」を押すと、次のクイズに挑戦できます。
                </p>
              )}
              {errorMessage ? (
                <p className="text-xs font-medium text-red-600">
                  {errorMessage}
                </p>
              ) : null}
            </form>

            <Separator />

            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-inner">
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
              <div className="space-y-3 rounded-2xl border border-indigo-100 bg-indigo-50/70 px-4 py-3">
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
                          : "まだこれから！"}
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

        <Card className="border border-indigo-100/80 bg-white/90 shadow-md">
          <CardHeader className="space-y-2">
            <CardTitle className="text-base font-semibold text-slate-900">
              この問題の学習記録
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              何度チャレンジしたか、今の得意度がひと目でわかります。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-700">
            <div className="grid gap-2 rounded-2xl border border-slate-200/70 bg-slate-50/60 p-4">
              <div className="flex items-center justify-between">
                <span>通算解答回数</span>
                <span className="text-base font-semibold text-slate-900">
                  {currentStatistics ? currentStatistics.totalAttempts : 0} 回
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>通算正解数</span>
                <span className="text-base font-semibold text-slate-900">
                  {currentStatistics ? currentStatistics.correctCount : 0} 回
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>通算正答率</span>
                <span className="text-base font-semibold text-slate-900">
                  {currentStatistics
                    ? `${Math.round(currentStatistics.accuracy * 100)}%`
                    : "--"}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>最後に解いた日</span>
                <span>
                  {currentStatistics?.lastAttemptedAt
                    ? new Date(
                        currentStatistics.lastAttemptedAt,
                      ).toLocaleDateString()
                    : "まだこれから！"}
                </span>
              </div>
            </div>
            <p className="rounded-2xl bg-sky-50/80 p-3 text-xs text-sky-800">
              コツ:
              間違えたフレーズは声に出して読んでみると、耳も口も覚えてくれるよ！
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
