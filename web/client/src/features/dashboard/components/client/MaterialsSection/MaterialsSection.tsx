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
import { Separator } from "@/shared/components/ui/separator";

import type { DashboardMaterialCardViewModel } from "../DashboardContent/useDashboardContent";

interface MaterialsSectionProps {
  items: DashboardMaterialCardViewModel[];
}

export function MaterialsSection({ items }: MaterialsSectionProps) {
  if (items.length === 0) {
    return (
      <Card className="border border-indigo-100/70">
        <CardHeader className="space-y-2">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-lg">教材一覧</CardTitle>
              <CardDescription>
                学習したい教材とUNITを確認しましょう
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-2xl border border-dashed border-indigo-200 bg-indigo-50/40 px-5 py-10 text-center text-sm text-indigo-600">
            まだ教材が登録されていません。管理画面から追加すると、ここに表示されます。
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalCount = items.length;

  return (
    <Card className="border border-indigo-100/70">
      <CardHeader className="space-y-2">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-lg">教材一覧</CardTitle>
            <CardDescription>
              学習したい教材とUNITを確認しましょう
            </CardDescription>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">
              全 {totalCount} 件
            </span>
            <Link
              href="/materials"
              className="text-xs font-semibold text-indigo-600 transition hover:text-indigo-500"
            >
              すべての教材を見る
            </Link>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((material) => (
          <div
            key={material.id}
            className="rounded-2xl border border-indigo-100/70 bg-white/90 p-4 shadow-sm"
          >
            <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-sm font-semibold text-indigo-900">
                  {material.name}
                </p>
                {material.description ? (
                  <p className="text-xs text-muted-foreground">
                    {material.description}
                  </p>
                ) : null}
              </div>
              <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                <span>UNIT {material.totalUnitCount}</span>
                <Separator orientation="vertical" className="h-3" />
                <span>問題 {material.totalQuestionCount}</span>
              </div>
            </div>
            <div className="mt-3 h-2 rounded-full bg-indigo-100/70">
              <div
                className="h-full rounded-full bg-indigo-500"
                style={{ width: `${material.progressRatePercent}%` }}
              />
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              学習進捗 {material.progressRatePercent}%
            </p>
            {material.unitPreview.length > 0 ? (
              <ul className="mt-3 space-y-1 text-xs text-indigo-800">
                {material.unitPreview.map((unit) => (
                  <li key={unit.id} className="flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-indigo-400" />
                    <Link
                      href={`/units/${unit.id}`}
                      className="truncate text-indigo-700 hover:underline"
                    >
                      {unit.name}
                    </Link>
                    <span className="text-[11px] text-indigo-500">
                      {unit.questionCount}問
                    </span>
                  </li>
                ))}
                {material.remainingUnitCount > 0 ? (
                  <li className="text-[11px] text-muted-foreground">
                    ほか {material.remainingUnitCount} UNIT…
                  </li>
                ) : null}
              </ul>
            ) : (
              <p className="mt-3 text-xs text-muted-foreground">
                UNITがまだ登録されていません。
              </p>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href={`/materials/${material.id}`}>詳細を見る</Link>
              </Button>
              <Button
                asChild
                variant="secondary"
                size="sm"
                disabled={!material.nextUnitId}
              >
                {material.nextUnitId ? (
                  <Link href={`/units/${material.nextUnitId}/study`}>
                    この教材の問題を解く
                  </Link>
                ) : (
                  <span>問題を準備中</span>
                )}
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
