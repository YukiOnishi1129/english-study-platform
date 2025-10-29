"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

interface UnitStatsGridProps {
  questionCount: number;
  uniqueAnswerCount: number;
}

export function UnitStatsGrid({
  questionCount,
  uniqueAnswerCount,
}: UnitStatsGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Card className="border border-indigo-100/70">
        <CardHeader>
          <CardTitle className="text-base">問題数</CardTitle>
          <CardDescription>このUNITに含まれる問題の数です</CardDescription>
        </CardHeader>
        <CardContent className="text-3xl font-semibold text-slate-900">
          {questionCount} 問
        </CardContent>
      </Card>
      <Card className="border border-indigo-100/70">
        <CardHeader>
          <CardTitle className="text-base">正解パターン数</CardTitle>
          <CardDescription>登録されている正解表現の数です</CardDescription>
        </CardHeader>
        <CardContent className="text-3xl font-semibold text-slate-900">
          {uniqueAnswerCount} パターン
        </CardContent>
      </Card>
    </div>
  );
}
