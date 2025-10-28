import type { Route } from "next";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo } from "react";
import type {
  ReviewDataDto,
  ReviewMaterialSummaryDto,
} from "@/external/dto/review/review.query.dto";
import { useReviewQuery } from "@/features/review/queries";

export interface UseReviewPageContentResult {
  hasAccount: boolean;
  isLoading: boolean;
  isError: boolean;
  data: ReviewDataDto | undefined;
  materials: ReviewMaterialSummaryDto[];
  selectedMaterialSummary: ReviewMaterialSummaryDto | null;
  effectiveMaterialId: string | null;
  handleMaterialChange: (materialId: string) => void;
  handleStartQuestion: (
    groupKey: "weak" | "lowAttempts" | "unattempted",
    questionId: string,
  ) => void;
}

export function useReviewPageContent(
  accountId: string | null,
): UseReviewPageContentResult {
  const router = useRouter();
  const searchParams = useSearchParams();

  const selectedMaterialIdParam = searchParams?.get("materialId") ?? null;

  const query = useReviewQuery(accountId, selectedMaterialIdParam);
  const { data, isLoading, isError } = query;

  const effectiveMaterialId = useMemo(() => {
    if (selectedMaterialIdParam) {
      return selectedMaterialIdParam;
    }
    return data?.selectedMaterialId ?? null;
  }, [data?.selectedMaterialId, selectedMaterialIdParam]);

  useEffect(() => {
    if (!data?.selectedMaterialId || selectedMaterialIdParam) {
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
  }, [data?.selectedMaterialId, selectedMaterialIdParam, router, searchParams]);

  const normalizedData = data ?? undefined;
  const materials = normalizedData?.materials ?? [];

  const selectedMaterialSummary = useMemo(() => {
    if (!materials.length) {
      return null;
    }
    return (
      materials.find((material) => material.id === effectiveMaterialId) ?? null
    );
  }, [materials, effectiveMaterialId]);

  const handleMaterialChange = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams?.toString() ?? "");
      params.set("materialId", value);
      router.replace(`/review?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  const handleStartQuestion = useCallback(
    (groupKey: "weak" | "lowAttempts" | "unattempted", questionId: string) => {
      const materialIdForLink =
        effectiveMaterialId ?? selectedMaterialSummary?.id;
      if (!materialIdForLink) {
        return;
      }
      const params = new URLSearchParams();
      params.set("materialId", materialIdForLink);
      params.set("group", groupKey);
      params.set("questionId", questionId);
      router.push(`/review/study?${params.toString()}` as Route);
    },
    [effectiveMaterialId, router, selectedMaterialSummary?.id],
  );

  return {
    hasAccount: Boolean(accountId),
    isLoading,
    isError,
    data: normalizedData,
    materials,
    selectedMaterialSummary,
    effectiveMaterialId,
    handleMaterialChange,
    handleStartQuestion,
  };
}
