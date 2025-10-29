"use client";

import {
  CheckCircle2,
  CircleHelp,
  RotateCcw,
  Volume2,
  XCircle,
} from "lucide-react";

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
import { cn } from "@/shared/lib/utils";

import type {
  UnitStudyQuestionStatisticsViewModel,
  UnitStudyQuestionViewModel,
} from "../UnitStudyContent/useUnitStudyContent";

interface UnitStudyQuestionCardProps {
  progressLabel: string;
  question: UnitStudyQuestionViewModel;
  answerInputId: string;
  inputValue: string;
  onInputChange: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
  disableSubmit: boolean;
  onNext: () => void;
  disableNext: boolean;
  onRetryCurrent: () => void;
  status: "idle" | "correct" | "incorrect";
  statusLabel: string;
  answeredCount: number;
  correctCount: number;
  isHintVisible: boolean;
  onToggleHint: () => void;
  errorMessage: string | null;
  isAnswerVisible: boolean;
  currentStatistics: UnitStudyQuestionStatisticsViewModel | null;
  speakingAnswer: string | null;
  onSpeakAnswer: (answer: string) => void;
  remainingCount: number;
  isSubmitting: boolean;
}

function getStatusIcon(status: "idle" | "correct" | "incorrect") {
  if (status === "correct") return CheckCircle2;
  if (status === "incorrect") return XCircle;
  return CircleHelp;
}

export function UnitStudyQuestionCard({
  progressLabel,
  question,
  answerInputId,
  inputValue,
  onInputChange,
  onSubmit,
  disableSubmit,
  onNext,
  disableNext,
  onRetryCurrent,
  status,
  statusLabel,
  answeredCount,
  correctCount,
  isHintVisible,
  onToggleHint,
  errorMessage,
  isAnswerVisible,
  currentStatistics,
  speakingAnswer,
  onSpeakAnswer,
  remainingCount,
  isSubmitting,
}: UnitStudyQuestionCardProps) {
  const StatusIcon = getStatusIcon(status);

  return (
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
            onClick={onRetryCurrent}
            disabled={isSubmitting}
          >
            <RotateCcw className="size-3.5" />
            最初からやり直す
          </Button>
        </div>
        <CardTitle className="text-2xl font-bold text-slate-900">
          {question.title} {question.japanese}
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
        </div>

        {isHintVisible && question.hint ? (
          <div className="rounded-2xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm text-indigo-900">
            ヒント: {question.hint}
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
            <Button
              type="button"
              variant="outline"
              className="flex-1 min-w-[140px] rounded-xl border-indigo-200 text-indigo-700 hover:bg-indigo-50"
              onClick={onRetryCurrent}
              disabled={status === "idle"}
            >
              この問題をやり直す
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
            <p className="text-xs font-medium text-red-600">{errorMessage}</p>
          ) : null}
        </form>

        <Separator />

        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm shadow-inner transition-all">
          <StatusIcon
            className={cn(
              "size-5",
              status === "correct" && "text-green-600",
              status === "incorrect" && "text-red-600",
              status === "idle" && "text-indigo-600",
            )}
          />
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
              {question.acceptableAnswers.map((answer) => (
                <li key={answer} className="flex items-center gap-2">
                  <span>{answer}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-1 rounded-full px-2 text-indigo-600 hover:text-indigo-500"
                    onClick={() => onSpeakAnswer(answer)}
                    disabled={speakingAnswer === answer}
                  >
                    <Volume2 className="size-4" />
                    {speakingAnswer === answer ? "再生中..." : "音声"}
                  </Button>
                </li>
              ))}
            </ul>
            {question.explanation ? (
              <p className="text-xs text-indigo-800/90">
                解説: {question.explanation}
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
  );
}
