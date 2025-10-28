"use server";

import {
  GetReviewDataRequestSchema,
  type ReviewDataDto,
} from "@/external/dto/review/review.query.dto";
import { getReviewData } from "./review.query.server";

export async function getReviewDataAction(input: {
  accountId: string | null;
  materialId?: string;
}): Promise<ReviewDataDto | null> {
  if (!input.accountId) {
    return null;
  }

  try {
    const request = GetReviewDataRequestSchema.parse({
      accountId: input.accountId,
      materialId: input.materialId,
    });
    return await getReviewData(request);
  } catch (_error) {
    return null;
  }
}
