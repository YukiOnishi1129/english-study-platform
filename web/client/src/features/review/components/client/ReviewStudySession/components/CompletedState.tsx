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

export function ReviewSessionCompletedState() {
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
