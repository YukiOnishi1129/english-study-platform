"use client";

import type { ReviewQuestionDto } from "@/external/dto/review/review.query.dto";
import {
  formatReviewAccuracy,
  formatReviewDate,
} from "@/features/review/lib/formatters";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Separator } from "@/shared/components/ui/separator";

interface ReviewQuestionGroupProps {
  title: string;
  description: string;
  badgeClassName: string;
  questions: ReviewQuestionDto[];
  groupKey: "weak" | "lowAttempts" | "unattempted";
  onStartQuestion: (
    groupKey: "weak" | "lowAttempts" | "unattempted",
    questionId: string,
  ) => void;
}

export function ReviewQuestionGroup({
  title,
  description,
  badgeClassName,
  questions,
  groupKey,
  onStartQuestion,
}: ReviewQuestionGroupProps) {
  return (
    <Card className="border border-indigo-100/70">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <Separator />
      <CardContent className="space-y-4">
        {questions.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            該当する問題はありません。
          </p>
        ) : (
          <div className="space-y-3">
            {questions.map((question) => (
              <div
                key={question.questionId}
                className="rounded-2xl border border-indigo-100 bg-white/90 p-4 shadow-sm"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-900">
                      {question.japanese}
                    </p>
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span className={badgeClassName}>{title}</span>
                      <span>UNIT: {question.unitName}</span>
                      <span>
                        正答率: {formatReviewAccuracy(question.accuracy)}
                      </span>
                      <span>
                        最終解答: {formatReviewDate(question.lastAttemptedAt)}
                      </span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() =>
                      onStartQuestion(groupKey, question.questionId)
                    }
                  >
                    復習する
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
