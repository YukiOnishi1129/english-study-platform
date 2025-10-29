"use client";

import { Sparkles } from "lucide-react";

import { Card, CardHeader } from "@/shared/components/ui/card";

interface UnitStudyHeaderCardProps {
  materialName: string;
  unitName: string;
  encouragement: string;
  progressLabel: string;
  answeredCount: number;
  questionCount: number;
  correctCount: number;
  accuracyRate: number | null;
}

export function UnitStudyHeaderCard({
  materialName,
  unitName,
  encouragement,
  progressLabel,
  answeredCount,
  questionCount,
  correctCount,
  accuracyRate,
}: UnitStudyHeaderCardProps) {
  return (
    <Card className="rounded-2xl border border-indigo-100 bg-white/90 shadow-sm">
      <CardHeader className="flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0 space-y-1.5">
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-500">
            {materialName}
          </p>
          <div className="flex items-center gap-2">
            <h1 className="truncate text-xl font-semibold text-slate-900">
              {unitName}
            </h1>
            <Sparkles className="size-5 text-indigo-500" />
          </div>
          <p className="text-xs text-muted-foreground">{encouragement}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
            {progressLabel}
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
            解いた数 {answeredCount}/{questionCount}
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
            正解 {correctCount} 問
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
            正答率 {accuracyRate !== null ? `${accuracyRate}%` : "--"}
          </span>
        </div>
      </CardHeader>
    </Card>
  );
}
