"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

export function UnitStudyNoQuestion() {
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
