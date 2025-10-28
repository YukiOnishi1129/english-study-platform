"use client";

import Link from "next/link";

import type { MaterialDetailDto } from "@/external/dto/material/material.detail.dto";
import { MaterialNavigator } from "@/features/materials/components/client/MaterialNavigator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/shared/components/ui/breadcrumb";
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

export interface MaterialDetailPagePresenterProps {
  material: MaterialDetailDto["material"] | null;
  chapters: MaterialDetailDto["chapters"];
  isLoading: boolean;
  isError: boolean;
}

export function MaterialDetailPagePresenter({
  material,
  chapters,
  isLoading,
  isError,
}: MaterialDetailPagePresenterProps) {
  if (isLoading) {
    return (
      <div className="space-y-8">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <Skeleton className="h-4 w-24" />
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Card className="border border-indigo-100/70 bg-white/95">
          <CardHeader className="space-y-4">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-60" />
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </CardContent>
        </Card>
        <Card className="border border-indigo-100/70 bg-white/95">
          <CardHeader>
            <Skeleton className="h-5 w-40" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-32" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError || !material) {
    return (
      <div className="space-y-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/materials">教材一覧</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>教材詳細</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Card className="border-red-200 bg-red-50 text-red-600">
          <CardHeader>
            <CardTitle>教材を読み込めませんでした</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            指定された教材が存在しないか、アクセス権がありません。
          </CardContent>
        </Card>
      </div>
    );
  }

  const startHref = material.nextUnitId
    ? (`/units/${material.nextUnitId}/study` as const)
    : null;
  const breadcrumbRoot: "/materials" = "/materials";

  return (
    <div className="space-y-8">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={breadcrumbRoot}>教材一覧</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{material.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Card className="border border-indigo-100/70 bg-white/95 shadow-sm">
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <CardTitle className="text-3xl font-bold text-slate-900">
              {material.name}
            </CardTitle>
            {material.description ? (
              <CardDescription className="text-sm leading-relaxed text-muted-foreground">
                {material.description}
              </CardDescription>
            ) : (
              <CardDescription className="text-sm text-muted-foreground">
                説明が登録されていません。
              </CardDescription>
            )}
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button asChild variant="secondary">
              <Link href="/materials">ほかの教材を見る</Link>
            </Button>
            <Button asChild disabled={!startHref}>
              {startHref ? (
                <Link href={startHref}>この教材の問題を解く</Link>
              ) : (
                <span>問題を準備中</span>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-indigo-50/70 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600">
              UNIT数
            </p>
            <p className="text-2xl font-semibold text-slate-900">
              {material.totalUnits}
            </p>
          </div>
          <div className="rounded-2xl bg-indigo-50/70 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600">
              問題数
            </p>
            <p className="text-2xl font-semibold text-slate-900">
              {material.totalQuestions}
            </p>
          </div>
          <div className="rounded-2xl bg-indigo-50/70 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600">
              最終更新日
            </p>
            <p className="text-2xl font-semibold text-slate-900">
              {new Date(material.updatedAt).toLocaleDateString()}
            </p>
          </div>
        </CardContent>
      </Card>

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
              <CardContent className="space-y-3 text-sm">
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
    </div>
  );
}
