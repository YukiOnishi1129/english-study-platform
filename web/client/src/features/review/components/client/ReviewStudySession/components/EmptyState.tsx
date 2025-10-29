"use client";

import Link from "next/link";

import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

export function ReviewSessionEmptyState() {
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
