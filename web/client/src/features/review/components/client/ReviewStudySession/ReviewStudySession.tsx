"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { ReviewSessionDataDto } from "@/external/dto/review/review.session.dto";
import { submitUnitAnswerAction } from "@/external/handler/study/submit-unit-answer.command.action";
import { Badge } from "@/shared/components/ui/badge";
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

type StudyStatus = "idle" | "correct" | "incorrect";

interface ReviewStudySessionProps {
  session: ReviewSessionDataDto;
  initialQuestionId?: string;
}

export function ReviewStudySession({
  session,
  initialQuestionId,
}: ReviewStudySessionProps) {
  const { questions } = session;

  const initialIndex = useMemo(() => {
    if (!initialQuestionId) {
      return 0;
    }
    const index = questions.findIndex(
      (question) => question.questionId === initialQuestionId,
    );
    return index >= 0 ? index : 0;
  }, [questions, initialQuestionId]);

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [inputValue, setInputValue] = useState("");
  const [status, setStatus] = useState<StudyStatus>("idle");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [questionStates, setQuestionStates] = useState(() => questions);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isHintVisible, setHintVisible] = useState(false);

  useEffect(() => {
    setCurrentIndex(initialIndex);
    setInputValue("");
    setStatus("idle");
    setErrorMessage(null);
    setQuestionStates(questions);
    setIsCompleted(false);
    setHintVisible(false);
  }, [initialIndex, questions]);

  const currentQuestion = questionStates[currentIndex];
  const isAnswered = status !== "idle";
  const remainingCount = questionStates.length - currentIndex - 1;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!currentQuestion || isSubmitting || !inputValue.trim()) {
      return;
    }
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const result = await submitUnitAnswerAction({
        unitId: currentQuestion.unitId,
        questionId: currentQuestion.questionId,
        answerText: inputValue,
      });

      setStatus(result.isCorrect ? "correct" : "incorrect");
      setQuestionStates((prev) =>
        prev.map((item) =>
          item.questionId === currentQuestion.questionId
            ? {
                ...item,
                totalAttempts: result.statistics.totalAttempts,
                correctCount: result.statistics.correctCount,
                incorrectCount: result.statistics.incorrectCount,
                accuracy: result.statistics.accuracy,
                lastAttemptedAt: result.statistics.lastAttemptedAt,
              }
            : item,
        ),
      );
    } catch (_error) {
      setErrorMessage(
        "回答の送信に失敗しました。時間をおいて再度お試しください。",
      );
      setStatus("idle");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (currentIndex >= questionStates.length - 1) {
      setIsCompleted(true);
      return;
    }
    setCurrentIndex((prev) => prev + 1);
    setInputValue("");
    setStatus("idle");
    setErrorMessage(null);
    setHintVisible(false);
  };

  if (questionStates.length === 0) {
    return (
      <Card className="border border-indigo-100/70">
        <CardHeader>
          <CardTitle>復習対象の問題が見つかりませんでした</CardTitle>
          <CardDescription>
            条件に一致する問題がありません。別のグループを選択してみましょう。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="link" className="px-0">
            <Link href="/review">復習ページへ戻る</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isCompleted) {
    return (
      <Card className="border border-indigo-100/70">
        <CardHeader className="space-y-2">
          <CardTitle>復習セッション完了！</CardTitle>
          <CardDescription>
            このグループの問題を全て解きました。復習ページに戻って他のグループにも挑戦しましょう。
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Button
            asChild
            className="rounded-full bg-indigo-600 text-white hover:bg-indigo-500"
          >
            <Link href="/review">復習ページへ戻る</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!currentQuestion) {
    return null;
  }

  const encouragement =
    status === "correct"
      ? "素晴らしい！その調子です。"
      : status === "incorrect"
        ? "気にせず次の問題に挑戦しましょう。"
        : "集中して復習を進めましょう。";

  return (
    <div className="space-y-6">
      <Card className="border border-indigo-100/70">
        <CardHeader className="space-y-2">
          <CardTitle>{session.material.name}</CardTitle>
          <CardDescription>
            {renderGroupLabel(session.group)} を復習しています。残り{" "}
            {remainingCount} 問。
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="rounded-full px-3 py-1">
            UNIT: {currentQuestion.unitName}
          </Badge>
          <Badge className="rounded-full bg-slate-100 px-3 py-1 text-slate-800">
            正答率: {formatAccuracy(currentQuestion.accuracy)}
          </Badge>
          <Badge className="rounded-full bg-slate-100 px-3 py-1 text-slate-800">
            解答 {currentQuestion.totalAttempts} 回
          </Badge>
          <Badge className="rounded-full bg-green-100 px-3 py-1 text-green-700">
            正解 {currentQuestion.correctCount}
          </Badge>
          <Badge className="rounded-full bg-rose-100 px-3 py-1 text-rose-700">
            不正解 {currentQuestion.incorrectCount}
          </Badge>
        </CardContent>
      </Card>

      <Card className="border border-indigo-100/70">
        <CardHeader className="space-y-2">
          <CardTitle>Q{currentIndex + 1}</CardTitle>
          <CardDescription className="text-base text-slate-900">
            {currentQuestion.japanese}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label
                className="text-sm font-medium text-slate-700"
                htmlFor="review-answer-input"
              >
                英語で答えましょう
              </label>
              <Input
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
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
                onClick={() =>
                  setInputValue(currentQuestion.acceptableAnswers[0] ?? "")
                }
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
                  onClick={() => setHintVisible((prev) => !prev)}
                  disabled={isSubmitting}
                >
                  {isHintVisible ? "ヒントを隠す" : "ヒントを見る"}
                </Button>
              ) : null}
            </div>
          </form>

          <div
            className={cn(
              "rounded-2xl border px-4 py-3 text-sm",
              status === "correct"
                ? "border-green-200 bg-green-50 text-green-800"
                : status === "incorrect"
                  ? "border-rose-200 bg-rose-50 text-rose-800"
                  : "border-indigo-200 bg-indigo-50 text-indigo-800",
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
                    <li key={answer}>{answer}</li>
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
              最終学習日: {formatDate(currentQuestion.lastAttemptedAt)}
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                className="rounded-full"
                onClick={() => {
                  setInputValue("");
                  setStatus("idle");
                  setErrorMessage(null);
                }}
                disabled={isSubmitting}
              >
                やり直す
              </Button>
              <Button
                type="button"
                className="rounded-full bg-indigo-600 text-white hover:bg-indigo-500"
                onClick={handleNext}
                disabled={status === "idle"}
              >
                次の問題へ
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <Link
          href="/review"
          className="font-semibold text-indigo-600 transition hover:text-indigo-500"
        >
          復習ページへ戻る
        </Link>
        <span>・</span>
        <span>残り {remainingCount} 問</span>
      </div>
    </div>
  );
}

function renderGroupLabel(group: ReviewSessionDataDto["group"]) {
  switch (group) {
    case "weak":
      return "正答率が低い問題";
    case "lowAttempts":
      return "解答回数が少ない問題";
    case "unattempted":
      return "未解答の問題";
    default:
      return "復習対象";
  }
}

function formatAccuracy(value: number | null) {
  if (value === null) {
    return "未解答";
  }
  return `${Math.round(value * 100)}%`;
}

function formatDate(value: string | null) {
  if (!value) {
    return "未解答";
  }
  try {
    const formatter = new Intl.DateTimeFormat("ja-JP", {
      dateStyle: "medium",
      timeStyle: "short",
    });
    return formatter.format(new Date(value));
  } catch (_error) {
    return value;
  }
}
