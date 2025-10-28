"use client";

import { Badge } from "@/shared/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Skeleton } from "@/shared/components/ui/skeleton";

import { ReviewQuestionGroup } from "./ReviewQuestionGroup";
import type { UseReviewPageContentResult } from "./useReviewPageContent";

export interface ReviewPageContentPresenterProps
  extends UseReviewPageContentResult {}

export function ReviewPageContentPresenter({
  hasAccount,
  isLoading,
  isError,
  data,
  materials,
  selectedMaterialSummary,
  effectiveMaterialId,
  handleMaterialChange,
  handleStartQuestion,
}: ReviewPageContentPresenterProps) {
  if (!hasAccount) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>復習データを表示できません</CardTitle>
          <CardDescription>
            アカウント情報の取得に失敗しました。ページを再読み込みしてください。
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (isLoading && !data) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-36 w-full rounded-2xl" />
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-72 w-full rounded-2xl" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <Card className="border-red-200 bg-red-50 text-red-700">
        <CardHeader>
          <CardTitle>復習データを取得できませんでした</CardTitle>
          <CardDescription className="text-red-600/80">
            ネットワークやサーバーの状態を確認して、もう一度お試しください。
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (materials.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>復習できる教材がありません</CardTitle>
          <CardDescription>
            まずは教材を追加し、学習を進めてから復習ページをご利用ください。
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const groups = data.groups;

  return (
    <div className="space-y-6">
      <Card className="border border-indigo-100/70">
        <CardHeader>
          <CardTitle>教材を選んで復習を開始しましょう</CardTitle>
          <CardDescription>
            間違えやすい問題や解答回数が少ない問題をピックアップしました。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-indigo-600">教材を選択</p>
              <p className="text-xs text-muted-foreground">
                正答率や学習状況に応じて復習対象が更新されます。
              </p>
            </div>
            <Select
              onValueChange={handleMaterialChange}
              value={effectiveMaterialId ?? undefined}
            >
              <SelectTrigger className="w-full sm:w-[260px]">
                <SelectValue placeholder="教材を選択" />
              </SelectTrigger>
              <SelectContent>
                {materials.map((material) => (
                  <SelectItem key={material.id} value={material.id}>
                    {material.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {selectedMaterialSummary ? (
            <div className="flex flex-wrap gap-3">
              <Badge variant="secondary" className="rounded-full px-3 py-1">
                問題数: {selectedMaterialSummary.totalQuestionCount}
              </Badge>
              <Badge className="rounded-full bg-amber-500/10 px-3 py-1 text-amber-700">
                間違えがち: {selectedMaterialSummary.weakCount}
              </Badge>
              <Badge className="rounded-full bg-sky-500/10 px-3 py-1 text-sky-700">
                解答回数が少ない問題: {selectedMaterialSummary.lowAttemptCount}
              </Badge>
              <Badge className="rounded-full bg-slate-500/10 px-3 py-1 text-slate-700">
                未挑戦: {selectedMaterialSummary.unattemptedCount}
              </Badge>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <section className="space-y-4">
        <ReviewQuestionGroup
          title="間違えやすい問題"
          description="正答率が低い問題を優先的に復習しましょう。"
          badgeClassName="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-1 text-[11px] font-semibold text-amber-700"
          questions={groups.weak}
          groupKey="weak"
          onStartQuestion={handleStartQuestion}
        />
        <ReviewQuestionGroup
          title="解答回数が少ない問題"
          description="解答回数が少ない問題を先に復習すると定着しやすくなります。"
          badgeClassName="inline-flex items-center gap-1 rounded-full bg-sky-500/10 px-2 py-1 text-[11px] font-semibold text-sky-700"
          questions={groups.lowAttempts}
          groupKey="lowAttempts"
          onStartQuestion={handleStartQuestion}
        />
        <ReviewQuestionGroup
          title="未挑戦の問題"
          description="まだ解いていない問題に挑戦して、学習範囲を広げましょう。"
          badgeClassName="inline-flex items-center gap-1 rounded-full bg-slate-500/10 px-2 py-1 text-[11px] font-semibold text-slate-700"
          questions={groups.unattempted}
          groupKey="unattempted"
          onStartQuestion={handleStartQuestion}
        />
      </section>
    </div>
  );
}
