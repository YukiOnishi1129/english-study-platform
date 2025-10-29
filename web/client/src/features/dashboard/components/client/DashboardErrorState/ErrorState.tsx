"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

interface ErrorStateProps {
  message: string;
}

export function ErrorState({ message }: ErrorStateProps) {
  return (
    <Card className="border-red-200 bg-red-50 text-red-700">
      <CardHeader>
        <CardTitle>ダッシュボードを読み込めませんでした</CardTitle>
        <CardDescription className="text-red-600/80">
          ページを再読み込みしても解消しない場合は、時間をおいて再度お試しください。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-relaxed">{message}</p>
      </CardContent>
    </Card>
  );
}
