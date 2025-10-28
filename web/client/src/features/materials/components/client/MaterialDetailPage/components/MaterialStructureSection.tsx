"use client";

import type { MaterialDetailDto } from "@/external/dto/material/material.detail.dto";
import { MaterialNavigator } from "@/features/materials/components/client/MaterialNavigator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Separator } from "@/shared/components/ui/separator";

interface MaterialStructureSectionProps {
  chapters: MaterialDetailDto["chapters"];
}

export function MaterialStructureSection({
  chapters,
}: MaterialStructureSectionProps) {
  return (
    <section className="space-y-4 rounded-3xl border border-indigo-100 bg-white/90 p-6 shadow-sm">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            章の構成と進捗
          </h2>
          <p className="text-sm text-muted-foreground">
            各章のUNITごとの進捗を確認できます。詳細ボタンから一覧を開き、好きな問題にジャンプしましょう。
          </p>
        </div>
        <MaterialNavigator chapters={chapters} />
      </div>
      <Separator />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {chapters.map((chapter) => (
          <Card
            key={chapter.id}
            className="border border-indigo-100/70 bg-indigo-50/40 shadow-sm"
          >
            <CardHeader className="space-y-2">
              <CardTitle className="text-sm font-semibold text-indigo-800">
                {chapter.name}
              </CardTitle>
              {chapter.description ? (
                <CardDescription className="text-xs text-indigo-700/80">
                  {chapter.description}
                </CardDescription>
              ) : null}
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-indigo-700">
              <div className="flex items-center justify-between rounded-lg bg-white/80 px-3 py-2">
                <span className="text-muted-foreground">UNIT数</span>
                <span className="font-semibold text-indigo-800">
                  {chapter.unitCount}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-white/80 px-3 py-2">
                <span className="text-muted-foreground">問題数</span>
                <span className="font-semibold text-indigo-800">
                  {chapter.questionCount}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
