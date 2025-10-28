"use client";

import Link from "next/link";

import type { MaterialListItemDto } from "@/external/dto/material/material.list.dto";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Separator } from "@/shared/components/ui/separator";
import { Skeleton } from "@/shared/components/ui/skeleton";

export interface MaterialListPagePresenterProps {
  materials: MaterialListItemDto[];
  isLoading: boolean;
  isError: boolean;
}

export function MaterialListPagePresenter({
  materials,
  isLoading,
  isError,
}: MaterialListPagePresenterProps) {
  if (isLoading) {
    return (
      <div className="space-y-8">
        <header className="space-y-3">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-80" />
        </header>
        <div className="grid gap-6 lg:grid-cols-2">
          {Array.from({ length: 2 }).map((_, skeletonIndex) => (
            <Card
              key={
                skeletonIndex === 0
                  ? "material-skeleton-a"
                  : "material-skeleton-b"
              }
              className="border-indigo-100/80 bg-white/95 shadow-sm"
            >
              <CardHeader className="space-y-2">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-64" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 text-sm">
                  <Skeleton className="h-8" />
                  <Skeleton className="h-8" />
                  <Skeleton className="h-8" />
                </div>
                <Skeleton className="h-4" />
                <div className="grid gap-2 sm:grid-cols-2">
                  <Skeleton className="h-10" />
                  <Skeleton className="h-10" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-slate-900">教材一覧</h1>
        <Card className="border-red-200 bg-red-50 text-red-600">
          <CardHeader>
            <CardTitle>教材を読み込めませんでした</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            時間をおいて再度アクセスしてください。
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <h1 className="text-2xl font-bold text-slate-900">教材一覧</h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          利用可能な教材の一覧です。各教材を選択すると、章とUNITの構成や問題数の詳細を確認できます。
        </p>
      </header>

      {materials.length === 0 ? (
        <Card className="border-dashed border-indigo-200 bg-indigo-50/60">
          <CardHeader>
            <CardTitle className="text-base text-indigo-900">
              教材がまだ登録されていません
            </CardTitle>
            <CardDescription className="text-sm leading-relaxed text-indigo-800/90">
              管理画面から教材を作成すると、ここに一覧が表示されます。
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {materials.map((material) => {
            const detailHref: `/materials/${string}` = `/materials/${material.id}`;
            const studyHref = material.nextUnitId
              ? (`/units/${material.nextUnitId}/study` as const)
              : null;
            return (
              <Card
                key={material.id}
                className="border-indigo-100/80 bg-white/95 shadow-sm transition hover:shadow-lg"
              >
                <CardHeader className="space-y-2">
                  <CardTitle className="text-xl text-slate-900">
                    {material.name}
                  </CardTitle>
                  {material.description ? (
                    <CardDescription className="text-sm leading-relaxed">
                      {material.description}
                    </CardDescription>
                  ) : (
                    <CardDescription className="text-sm leading-relaxed text-muted-foreground">
                      説明が登録されていません。
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <dl className="grid gap-3 text-sm">
                    <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                      <dt className="text-muted-foreground">UNIT数</dt>
                      <dd className="font-semibold text-slate-900">
                        {material.unitCount} UNIT
                      </dd>
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                      <dt className="text-muted-foreground">問題数</dt>
                      <dd className="font-semibold text-slate-900">
                        {material.questionCount} 問
                      </dd>
                    </div>
                  </dl>
                  <Separator />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>最終更新日</span>
                    <time dateTime={material.updatedAt}>
                      {new Date(material.updatedAt).toLocaleDateString()}
                    </time>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Button
                      asChild
                      className="w-full"
                      variant="secondary"
                      disabled={!studyHref}
                    >
                      {studyHref ? (
                        <Link href={studyHref}>この教材の問題を解く</Link>
                      ) : (
                        <span>問題を準備中</span>
                      )}
                    </Button>
                    <Button asChild className="w-full">
                      <Link href={detailHref}>教材の詳細を見る</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
