"use client";

import type { StudyMode } from "@/external/dto/study/submit-unit-answer.dto";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

import type {
  UnitStudyModeStatisticsViewModel,
  UnitStudyQuestionStatisticsViewModel,
} from "../UnitStudyContent/useUnitStudyContent";

interface UnitStudyStatisticsCardProps {
  statistics: UnitStudyQuestionStatisticsViewModel | null;
  selectedMode: StudyMode;
  modeStatistics: UnitStudyModeStatisticsViewModel | null;
}

export function UnitStudyStatisticsCard({
  statistics,
  selectedMode,
  modeStatistics,
}: UnitStudyStatisticsCardProps) {
  const MODE_LABEL: Record<StudyMode, string> = {
    jp_to_en: "日→英",
    en_to_jp: "英→日",
    sentence: "英作文",
    conversation_roleplay: "ロールプレイ",
    listening_comprehension: "リスニング",
    writing_review: "ライティング",
  };
  const displayedStatistics = modeStatistics ?? statistics;
  const summaryLabel = modeStatistics
    ? `${MODE_LABEL[selectedMode]}モードの記録`
    : "この問題の通算記録";

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
          <p className="text-[11px] font-semibold uppercase tracking-wide text-indigo-600">
            {summaryLabel}
          </p>
          <div className="flex items-center justify-between">
            <span>{modeStatistics ? "モード解答回数" : "通算解答回数"}</span>
            <span className="text-base font-semibold text-slate-900">
              {displayedStatistics ? displayedStatistics.totalAttempts : 0} 回
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>{modeStatistics ? "モード正解数" : "通算正解数"}</span>
            <span className="text-base font-semibold text-slate-900">
              {displayedStatistics ? displayedStatistics.correctCount : 0} 回
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>{modeStatistics ? "モード正答率" : "通算正答率"}</span>
            <span className="text-base font-semibold text-slate-900">
              {displayedStatistics
                ? `${Math.round(displayedStatistics.accuracy * 100)}%`
                : "--"}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>最後に解いた日</span>
            <span>
              {displayedStatistics?.lastAttemptedAt
                ? new Date(
                    displayedStatistics.lastAttemptedAt,
                  ).toLocaleDateString()
                : "まだこれから！"}
            </span>
          </div>
        </div>
        {statistics && Object.entries(statistics.byMode).length > 0 ? (
          <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-3 text-xs text-slate-700">
            <p className="font-semibold text-indigo-600">モード別の記録</p>
            <div className="mt-2 space-y-1">
              {Object.entries(statistics.byMode).map(([mode, value]) => {
                if (!value) {
                  return null;
                }
                return (
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
                );
              })}
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
