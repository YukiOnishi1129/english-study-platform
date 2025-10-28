"use client";

import type { Route } from "next";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";
import type { ReviewQuestionDto } from "@/external/dto/review/review.query.dto";
import { useReviewQuery } from "@/features/review/queries";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
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
import { Separator } from "@/shared/components/ui/separator";
import { Skeleton } from "@/shared/components/ui/skeleton";

interface ReviewPageContentProps {
  accountId: string | null;
}

function formatAccuracy(value: number | null) {
  if (value === null) {
    return "未解答";
  }
  return `${Math.round(value * 100)}%`;
}

function formatDate(value: string | null) {
  if (!value) {
    return "未解答";
  }
  try {
    const formatter = new Intl.DateTimeFormat("ja-JP", {
      dateStyle: "medium",
      timeStyle: "short",
    });
    return formatter.format(new Date(value));
  } catch (_error) {
    return value;
  }
}

export function ReviewPageContent({ accountId }: ReviewPageContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedMaterialId = searchParams?.get("materialId") ?? null;

  const query = useReviewQuery(accountId, selectedMaterialId);
  const { data, isLoading, isError } = query;

  const effectiveSelectedMaterialId = useMemo(() => {
    if (selectedMaterialId) {
      return selectedMaterialId;
    }
    return data?.selectedMaterialId ?? null;
  }, [data?.selectedMaterialId, selectedMaterialId]);

  useEffect(() => {
    if (!data?.selectedMaterialId || selectedMaterialId) {
      return;
    }
    if (!searchParams) {
      router.replace(`/review?materialId=${data.selectedMaterialId}`, {
        scroll: false,
      });
      return;
    }
    const params = new URLSearchParams(searchParams.toString());
    params.set("materialId", data.selectedMaterialId);
    router.replace(`/review?${params.toString()}`, { scroll: false });
  }, [data?.selectedMaterialId, selectedMaterialId, router, searchParams]);

  const handleMaterialChange = (value: string) => {
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    params.set("materialId", value);
    router.replace(`/review?${params.toString()}`, { scroll: false });
  };

  const handleStartQuestion = (
    groupKey: "weak" | "lowAttempts" | "unattempted",
    questionId: string,
  ) => {
    const materialIdForLink =
      effectiveSelectedMaterialId ?? selectedMaterialSummary?.id;
    if (!materialIdForLink) {
      return;
    }
    const params = new URLSearchParams();
    params.set("materialId", materialIdForLink);
    params.set("group", groupKey);
    params.set("questionId", questionId);
    router.push(`/review/study?${params.toString()}` as Route);
  };

  if (!accountId) {
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

  if (data.materials.length === 0) {
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

  const selectedMaterialSummary =
    data.materials.find(
      (material) => material.id === effectiveSelectedMaterialId,
    ) ?? null;

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
              value={effectiveSelectedMaterialId ?? undefined}
            >
              <SelectTrigger className="w-full sm:w-[260px]">
                <SelectValue placeholder="教材を選択" />
              </SelectTrigger>
              <SelectContent>
                {data.materials.map((material) => (
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
                解答少: {selectedMaterialSummary.lowAttemptCount}
              </Badge>
              <Badge className="rounded-full bg-slate-500/10 px-3 py-1 text-slate-700">
                未解答: {selectedMaterialSummary.unattemptedCount}
              </Badge>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card className="border border-indigo-100/70">
        <CardHeader className="space-y-1">
          <CardTitle>間違えがちな問題</CardTitle>
          <CardDescription>
            正答率が {Math.round(data.thresholds.weakAccuracy * 100)}%
            未満の問題です。
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderQuestionGroup("weak", data.groups.weak)}
        </CardContent>
      </Card>

      <Card className="border border-indigo-100/70">
        <CardHeader className="space-y-1">
          <CardTitle>解答回数が少ない問題</CardTitle>
          <CardDescription>
            解答回数が {data.thresholds.lowAttempt} 回未満の問題です。
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderQuestionGroup("lowAttempts", data.groups.lowAttempts)}
        </CardContent>
      </Card>

      <Card className="border border-indigo-100/70">
        <CardHeader className="space-y-1">
          <CardTitle>未解答の問題</CardTitle>
          <CardDescription>
            まだ一度も解答していない問題です。ウォームアップにおすすめです。
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderQuestionGroup("unattempted", data.groups.unattempted)}
        </CardContent>
      </Card>
    </div>
  );

  function renderQuestionGroup(
    groupKey: "weak" | "lowAttempts" | "unattempted",
    questions: ReviewQuestionDto[],
  ) {
    if (questions.length === 0) {
      return (
        <div className="rounded-xl border border-dashed border-indigo-200 bg-indigo-50/40 px-5 py-8 text-sm text-indigo-600">
          対象の問題はありませんでした。別の教材や条件を試してみましょう。
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {questions.map((question) => (
          <div
            key={question.questionId}
            className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-indigo-900">
                  {question.unitName} / Q{question.questionOrder}
                </p>
                <p className="text-sm text-slate-700">{question.japanese}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="rounded-full px-3 py-1">
                  正答率 {formatAccuracy(question.accuracy)}
                </Badge>
                <Badge className="rounded-full bg-slate-100 px-3 py-1 text-slate-800">
                  解答 {question.totalAttempts} 回
                </Badge>
                <Badge className="rounded-full bg-green-100 px-3 py-1 text-green-700">
                  正解 {question.correctCount} 回
                </Badge>
                <Badge className="rounded-full bg-rose-100 px-3 py-1 text-rose-700">
                  不正解 {question.incorrectCount} 回
                </Badge>
              </div>
            </div>
            <Separator className="my-3" />
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-muted-foreground">
                最終学習日: {formatDate(question.lastAttemptedAt)}
              </p>
              <Button
                type="button"
                size="sm"
                className="self-start rounded-full bg-indigo-600 px-4 text-white hover:bg-indigo-500"
                onClick={() =>
                  handleStartQuestion(groupKey, question.questionId)
                }
              >
                この問題を復習する
              </Button>
            </div>
          </div>
        ))}
      </div>
    );
  }
}
