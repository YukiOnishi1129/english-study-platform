"use server";

import "server-only";

import type { ReviewDataDto } from "@/external/dto/review/review.query.dto";
import { ReviewDataSchema } from "@/external/dto/review/review.query.dto";
import { ReviewService } from "@/external/service/review/review.service";

const reviewService = new ReviewService();

export async function getReviewData(request: {
  accountId: string;
  materialId?: string;
}): Promise<ReviewDataDto> {
  const { accountId, materialId } = request;
  const dto = await reviewService.getReviewData(accountId, materialId);
  return ReviewDataSchema.parse(dto);
}
