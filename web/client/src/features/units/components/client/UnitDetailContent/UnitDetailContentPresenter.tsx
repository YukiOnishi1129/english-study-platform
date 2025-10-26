"use client";

import Link from "next/link";
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
import type {
  UnitBreadcrumbItem,
  UnitQuestionViewModel,
  UseUnitDetailContentResult,
} from "./useUnitDetailContent";

interface LoadingSkeletonProps {
  message?: string;
}

function LoadingSkeleton({ message }: LoadingSkeletonProps) {
  return (
    <div className="space-y-6">
      <div className="h-5 w-72 animate-pulse rounded bg-slate-200" />
      <Card>
        <CardHeader>
          <div className="space-y-2">
            <div className="h-6 w-32 animate-pulse rounded bg-slate-200" />
            <div className="h-4 w-48 animate-pulse rounded bg-slate-100" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-10 w-full animate-pulse rounded bg-slate-100" />
        </CardContent>
      </Card>
      <div className="grid gap-4 lg:grid-cols-2">
        {[0, 1].map((key) => (
          <Card key={key}>
            <CardHeader>
              <div className="h-5 w-24 animate-pulse rounded bg-slate-200" />
            </CardHeader>
            <CardContent>
              <div className="h-16 w-full animate-pulse rounded bg-slate-100" />
            </CardContent>
          </Card>
        ))}
      </div>
      {message ? (
        <p className="text-sm text-muted-foreground">{message}</p>
      ) : null}
    </div>
  );
}

function ErrorState() {
  return (
    <Card className="border-red-200 bg-red-50 text-red-700">
      <CardHeader>
        <CardTitle>UNITを読み込めませんでした</CardTitle>
        <CardDescription className="text-red-600/80">
          ページを再読み込みしても解消しない場合は、時間をおいて再度お試しください。
        </CardDescription>
      </CardHeader>
    </Card>
  );
}

function renderBreadcrumb(items: UnitBreadcrumbItem[]) {
  if (items.length === 0) {
    return null;
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <BreadcrumbItem key={item.id}>
              {item.href && !isLast ? (
                <BreadcrumbLink asChild>
                  <Link href={{ pathname: item.href }}>{item.label}</Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              )}
              {!isLast ? <BreadcrumbSeparator /> : null}
            </BreadcrumbItem>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

function renderQuestion(question: UnitQuestionViewModel) {
  return (
    <li
      key={question.id}
      className="rounded-2xl border border-indigo-100/70 bg-white/90 px-4 py-3 shadow-sm"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-indigo-900">
            {question.title} {question.japanese}
          </p>
          {question.hint ? (
            <p className="mt-1 text-xs text-muted-foreground">
              ヒント: {question.hint}
            </p>
          ) : null}
          {question.explanation ? (
            <p className="mt-1 text-xs text-muted-foreground">
              解説: {question.explanation}
            </p>
          ) : null}
        </div>
        <span className="shrink-0 text-xs text-muted-foreground">
          {question.answerSamples.length} 通り
        </span>
      </div>
      {question.answerSamples.length > 0 ? (
        <p className="mt-2 text-xs text-indigo-600">
          例: {question.answerSamples.join(", ")}
        </p>
      ) : null}
    </li>
  );
}

export function UnitDetailContentPresenter(props: UseUnitDetailContentResult) {
  const {
    isLoading,
    isError,
    unit,
    material,
    breadcrumb,
    questionCount,
    uniqueAnswerCount,
    questions,
  } = props;

  if (isLoading) {
    return <LoadingSkeleton message="UNITの情報を準備しています..." />;
  }

  if (isError || !unit || !material) {
    return <ErrorState />;
  }

  const studyHref: `/units/${string}/study` = `/units/${unit.id}/study`;

  return (
    <div className="space-y-6">
      {renderBreadcrumb(breadcrumb)}

      <Card className="border border-indigo-100/70 bg-white/95">
        <CardHeader className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
          <div className="space-y-1.5">
            <CardTitle className="text-2xl font-bold text-slate-900">
              {unit.name}
            </CardTitle>
            {unit.description ? (
              <CardDescription className="text-sm leading-relaxed">
                {unit.description}
              </CardDescription>
            ) : (
              <CardDescription className="text-sm">
                素早く繰り返し学習して、表現を定着させましょう。
              </CardDescription>
            )}
          </div>
          <Button asChild size="lg">
            <Link href={studyHref}>このUNITで学習を開始</Link>
          </Button>
        </CardHeader>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="border border-indigo-100/70">
          <CardHeader>
            <CardTitle className="text-base">問題数</CardTitle>
            <CardDescription>このUNITに含まれる問題の数です</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-indigo-900">
              {questionCount} 問
            </p>
          </CardContent>
        </Card>
        <Card className="border border-indigo-100/70">
          <CardHeader>
            <CardTitle className="text-base">正解パターン</CardTitle>
            <CardDescription>登録されている英語表現の数です</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-indigo-900">
              {uniqueAnswerCount} パターン
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-indigo-100/70">
        <CardHeader>
          <CardTitle className="text-base">教材情報</CardTitle>
          <CardDescription>
            このUNITは「{material.name}」に含まれています
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>
            教材の説明:{" "}
            {material.description ?? "説明はまだ登録されていません。"}
          </p>
        </CardContent>
      </Card>

      <Card className="border border-indigo-100/70">
        <CardHeader>
          <CardTitle className="text-base">問題一覧</CardTitle>
          <CardDescription>
            各問題の日本語文と正解パターンの例を確認できます
          </CardDescription>
        </CardHeader>
        <CardContent>
          {questions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-indigo-200 bg-indigo-50/50 px-6 py-10 text-center text-sm text-indigo-600">
              まだ問題が登録されていません。管理画面から問題を追加すると、ここに表示されます。
            </div>
          ) : (
            <ul className="space-y-3">
              {questions.map((question) => renderQuestion(question))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
