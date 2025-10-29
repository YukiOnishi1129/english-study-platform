"use client";

import Link from "next/link";

import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

export interface DashboardHeaderPresenterProps {
  greetingName: string;
  totalQuestionCount: number;
  onStartStudy: () => void;
  isStartingStudy: boolean;
}

export function DashboardHeaderPresenter({
  greetingName,
  totalQuestionCount,
  onStartStudy,
  isStartingStudy,
}: DashboardHeaderPresenterProps) {
  return (
    <Card className="border border-indigo-100/70 bg-white/95">
      <CardHeader className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        <div className="flex flex-1 flex-col gap-2">
          <div>
            <CardTitle className="text-2xl font-bold text-slate-900">
              {greetingName}さん、おかえりなさい！
            </CardTitle>
            <CardDescription className="text-sm leading-relaxed text-muted-foreground">
              利用可能な問題は {totalQuestionCount}
              問です。今日も無理なく学習を続けましょう。
            </CardDescription>
          </div>
          <div className="text-sm text-muted-foreground">
            前回の学習：昨日 22:15
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-stretch gap-2 sm:flex-row sm:items-center">
          <Button
            type="button"
            onClick={onStartStudy}
            disabled={isStartingStudy}
            className="rounded-full bg-indigo-600 px-6 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-indigo-500 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2"
          >
            学習をはじめる
          </Button>
          <Link
            href="/review"
            className="text-xs font-semibold text-indigo-600 transition hover:text-indigo-500"
          >
            復習ページへ
          </Link>
        </div>
      </CardHeader>
    </Card>
  );
}
