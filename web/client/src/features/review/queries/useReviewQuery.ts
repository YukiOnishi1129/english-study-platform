"use client";

import { useQuery } from "@tanstack/react-query";

import { getReviewDataAction } from "@/external/handler/review/review.query.action";
import { reviewKeys } from "./keys";

export function useReviewQuery(
  accountId: string | null,
  materialId: string | null,
) {
  return useQuery({
    queryKey: reviewKeys.list(accountId, materialId),
    queryFn: () =>
      getReviewDataAction({
        accountId,
        materialId: materialId ?? undefined,
      }),
    enabled: Boolean(accountId),
  });
}
