"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

export function UnitStudyContentError() {
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
