"use client";

import { formatReviewAccuracy } from "@/features/review/lib/formatters";
import { Badge } from "@/shared/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

import type { UseReviewStudySessionResult } from "../useReviewStudySession";

interface SessionHeaderCardProps {
  materialName: string;
  groupLabel: string;
  remainingCount: number;
  currentQuestion: NonNullable<UseReviewStudySessionResult["currentQuestion"]>;
}

export function SessionHeaderCard({
  materialName,
  groupLabel,
  remainingCount,
  currentQuestion,
}: SessionHeaderCardProps) {
  return (
    <Card className="border border-indigo-100/70">
      <CardHeader className="space-y-2">
        <CardTitle>{materialName}</CardTitle>
        <CardDescription>
          {groupLabel} を復習しています。残り {remainingCount} 問。
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        <Badge variant="secondary" className="rounded-full px-3 py-1">
          UNIT: {currentQuestion.unitName}
        </Badge>
        <Badge className="rounded-full bg-slate-100 px-3 py-1 text-slate-800">
          正答率: {formatReviewAccuracy(currentQuestion.accuracy)}
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
  );
}
