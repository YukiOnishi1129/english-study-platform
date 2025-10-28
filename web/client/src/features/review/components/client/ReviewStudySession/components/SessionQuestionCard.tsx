"use client";

import { Volume2 } from "lucide-react";
import { formatReviewDate } from "@/features/review/lib/formatters";
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
import type { UseReviewStudySessionResult } from "../useReviewStudySession";

type ReviewQuestion = NonNullable<
  UseReviewStudySessionResult["currentQuestion"]
>;

type StudyStatus = UseReviewStudySessionResult["status"];

interface SessionQuestionCardProps {
  currentQuestion: ReviewQuestion;
  currentIndex: number;
  status: StudyStatus;
  encouragement: string;
  isSubmitting: boolean;
  isAnswered: boolean;
  isHintVisible: boolean;
  speakingAnswer: string | null;
  inputValue: string;
  errorMessage: string | null;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onInputChange: (value: string) => void;
  onFillReferenceAnswer: () => void;
  onToggleHint: () => void;
  onRetryCurrent: () => void;
  onNextQuestion: () => void;
  onSpeakAnswer: (answer: string) => void;
}

function encouragementClasses(status: StudyStatus) {
  switch (status) {
    case "correct":
      return "border-green-200 bg-green-50 text-green-800";
    case "incorrect":
      return "border-rose-200 bg-rose-50 text-rose-800";
    default:
      return "border-indigo-200 bg-indigo-50 text-indigo-800";
  }
}

export function SessionQuestionCard({
  currentQuestion,
  currentIndex,
  status,
  encouragement,
  isSubmitting,
  isAnswered,
  isHintVisible,
  speakingAnswer,
  inputValue,
  errorMessage,
  onSubmit,
  onInputChange,
  onFillReferenceAnswer,
  onToggleHint,
  onRetryCurrent,
  onNextQuestion,
  onSpeakAnswer,
}: SessionQuestionCardProps) {
  const referenceAnswer = currentQuestion.acceptableAnswers[0] ?? "";

  return (
    <Card className="border border-indigo-100/70">
      <CardHeader className="space-y-2">
        <CardTitle>Q{currentIndex + 1}</CardTitle>
        <CardDescription className="text-base text-slate-900">
          {currentQuestion.japanese}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <label
              className="text-sm font-medium text-slate-700"
              htmlFor="review-answer-input"
            >
              英語で答えましょう
            </label>
            <Input
              value={inputValue}
              onChange={(event) => onInputChange(event.target.value)}
              id="review-answer-input"
              disabled={isSubmitting || isAnswered}
              placeholder="Your answer"
              autoComplete="off"
            />
          </div>
          {errorMessage ? (
            <p className="text-sm text-rose-600">{errorMessage}</p>
          ) : null}
          <div className="flex flex-wrap gap-3">
            <Button
              type="submit"
              disabled={isSubmitting || isAnswered}
              className="rounded-full bg-indigo-600 text-white hover:bg-indigo-500"
            >
              解答する
            </Button>
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              onClick={onFillReferenceAnswer}
              disabled={
                isSubmitting ||
                isAnswered ||
                currentQuestion.acceptableAnswers.length === 0
              }
            >
              参考解答を入力
            </Button>
            {currentQuestion.hint ? (
              <Button
                type="button"
                variant="ghost"
                className="rounded-full text-indigo-600 hover:text-indigo-500"
                onClick={onToggleHint}
                disabled={isSubmitting}
              >
                {isHintVisible ? "ヒントを隠す" : "ヒントを見る"}
              </Button>
            ) : null}
            {referenceAnswer ? (
              <Button
                type="button"
                variant="ghost"
                className={cn(
                  "rounded-full text-indigo-600 hover:text-indigo-500",
                  speakingAnswer === referenceAnswer && "text-indigo-400",
                )}
                onClick={() => onSpeakAnswer(referenceAnswer)}
                disabled={isSubmitting}
              >
                <Volume2 className="mr-2 size-4" /> 音声で確認
              </Button>
            ) : null}
          </div>
        </form>

        <div
          className={cn(
            "rounded-2xl border px-4 py-3 text-sm",
            encouragementClasses(status),
          )}
        >
          <p className="font-semibold">{encouragement}</p>
          {isHintVisible && currentQuestion.hint ? (
            <p className="mt-2 text-sm text-indigo-800">
              ヒント: {currentQuestion.hint}
            </p>
          ) : null}
          {isAnswered ? (
            <div className="mt-2 space-y-1 text-xs text-slate-700">
              <p className="font-semibold text-slate-900">正解例</p>
              <ul className="list-inside list-disc space-y-0.5">
                {currentQuestion.acceptableAnswers.map((answer) => (
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
              {currentQuestion.explanation ? (
                <p className="mt-2 text-slate-600">
                  {currentQuestion.explanation}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>

        <Separator />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            最終学習日: {formatReviewDate(currentQuestion.lastAttemptedAt)}
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              className="rounded-full"
              onClick={onRetryCurrent}
              disabled={isSubmitting}
            >
              やり直す
            </Button>
            <Button
              type="button"
              className="rounded-full bg-indigo-600 text-white hover:bg-indigo-500"
              onClick={onNextQuestion}
              disabled={status === "idle"}
            >
              次の問題へ
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
