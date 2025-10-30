"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

import type { UnitQuestionViewModel } from "../useUnitDetailContent";

interface UnitQuestionListProps {
  questions: UnitQuestionViewModel[];
}

export function UnitQuestionList({ questions }: UnitQuestionListProps) {
  return (
    <Card className="border border-indigo-100/70 bg-white/95">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-slate-900">
          登録されている問題
        </CardTitle>
      </CardHeader>
      <CardContent>
        {questions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-indigo-200 bg-indigo-50/50 px-6 py-10 text-center text-sm text-indigo-600">
            まだ問題が登録されていません。管理画面から問題を追加すると、ここに表示されます。
          </div>
        ) : (
          <ul className="space-y-3">
            {questions.map((question) => (
              <li
                key={question.id}
                className="rounded-2xl border border-indigo-100/70 bg-white/90 px-4 py-3 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-indigo-900">
                      {question.title} {question.primaryText}
                      {question.vocabulary?.partOfSpeech ? (
                        <span className="ml-2 text-xs text-muted-foreground">
                          ({question.vocabulary.partOfSpeech})
                        </span>
                      ) : null}
                    </p>
                    {question.secondaryText ? (
                      <p className="mt-1 text-xs text-slate-600">
                        {question.secondaryText}
                      </p>
                    ) : null}
                    {question.hint ? (
                      <p className="mt-1 text-xs text-muted-foreground">
                        ヒント: {question.hint}
                      </p>
                    ) : null}
                    {question.explanation ? (
                      <p className="mt-1 text-xs text-muted-foreground">
                        解説: {question.explanation}
                      </p>
                    ) : null}
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {question.answerSamples.length} 通り
                  </span>
                </div>
                {question.answerSamples.length > 0 ? (
                  <p className="mt-2 text-xs text-indigo-600">
                    例: {question.answerSamples.join(", ")}
                  </p>
                ) : null}
                {question.statistics ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    通算 {question.statistics.totalAttempts} 回 / 正解{" "}
                    {question.statistics.correctCount} 回 （
                    {Math.round(question.statistics.accuracy * 100)}%）
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
