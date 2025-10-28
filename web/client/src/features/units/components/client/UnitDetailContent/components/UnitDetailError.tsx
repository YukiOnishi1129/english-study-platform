"use client";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

export function UnitDetailError() {
  return (
    <Card className="border-red-200 bg-red-50 text-red-700">
      <CardHeader>
        <CardTitle>UNITを読み込めませんでした</CardTitle>
        <CardDescription className="text-red-600/80">
          ページを再読み込みしても解消しない場合は、時間をおいて再度お試しください。
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
