"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

import type { DashboardStatCardViewModel } from "../DashboardContent/useDashboardContent";

interface StatsSummaryProps {
  cards: DashboardStatCardViewModel[];
}

export function StatsSummary({ cards }: StatsSummaryProps) {
  return (
    <Card className="border border-indigo-100/70">
      <CardHeader>
        <CardTitle className="text-lg">学習サマリー</CardTitle>
        <CardDescription>これまでの進捗を一目で確認できます</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2">
          {cards.map((card) => (
            <div
              key={card.id}
              className="rounded-xl border border-indigo-100/70 bg-indigo-50/70 px-4 py-3 text-sm text-indigo-900"
            >
              <p className="text-xs font-medium text-indigo-500">
                {card.label}
              </p>
              <p className="mt-1 text-xl font-semibold">{card.value}</p>
              <p className="mt-1 text-[11px] text-indigo-700/80">
                {card.helperText}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
