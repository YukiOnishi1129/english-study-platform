"use client";

import type { StudyMode } from "@/external/dto/study/submit-unit-answer.dto";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

import type { UnitStudyQuestionStatisticsViewModel } from "../UnitStudyContent/useUnitStudyContent";

interface UnitStudyStatisticsCardProps {
  statistics: UnitStudyQuestionStatisticsViewModel | null;
}

export function UnitStudyStatisticsCard({
  statistics,
}: UnitStudyStatisticsCardProps) {
  const MODE_LABEL: Record<StudyMode, string> = {
    jp_to_en: "英→日",
    en_to_jp: "日→英",
    sentence: "英作文",
    default: "標準",
  };

  return (
    <Card className="border border-indigo-100/80 bg-white/90 shadow-md">
      <CardHeader className="space-y-2">
        <CardTitle className="text-base font-semibold text-slate-900">
          この問題の学習記録
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          何度チャレンジしたか、今の得意度がひと目でわかります。
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-slate-700">
        <div className="grid gap-2 rounded-2xl border border-slate-200/70 bg-slate-50/60 p-4">
          <div className="flex items-center justify-between">
            <span>通算解答回数</span>
            <span className="text-base font-semibold text-slate-900">
              {statistics ? statistics.totalAttempts : 0} 回
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>通算正解数</span>
            <span className="text-base font-semibold text-slate-900">
              {statistics ? statistics.correctCount : 0} 回
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>通算正答率</span>
            <span className="text-base font-semibold text-slate-900">
              {statistics ? `${Math.round(statistics.accuracy * 100)}%` : "--"}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>最後に解いた日</span>
            <span>
              {statistics?.lastAttemptedAt
                ? new Date(statistics.lastAttemptedAt).toLocaleDateString()
                : "まだこれから！"}
            </span>
          </div>
        </div>
        {statistics && Object.entries(statistics.byMode).length > 0 ? (
          <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-3 text-xs text-slate-700">
            <p className="font-semibold text-indigo-600">モード別の記録</p>
            <div className="mt-2 space-y-1">
              {Object.entries(statistics.byMode).map(([mode, value]) => (
                <div
                  key={mode}
                  className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-1"
                >
                  <span>{MODE_LABEL[mode as StudyMode]}</span>
                  <span>
                    {Math.round(value.accuracy * 100)}% ({value.correctCount}/
                    {value.totalAttempts})
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : null}
        <p className="rounded-2xl bg-sky-50/80 p-3 text-xs text-sky-800">
          コツ:
          間違えたフレーズは声に出して読んでみると、耳も口も覚えてくれるよ！
        </p>
      </CardContent>
    </Card>
  );
}
