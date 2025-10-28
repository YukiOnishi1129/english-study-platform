"use server";

import "server-only";

import {
  type GetReviewSessionDataRequest,
  GetReviewSessionDataRequestSchema,
  type ReviewSessionDataDto,
  ReviewSessionDataSchema,
} from "@/external/dto/review/review.session.dto";
import { ReviewService } from "@/external/service/review/review.service";
import { getAuthenticatedAccount } from "@/features/auth/servers/auth-check.server";

const reviewService = new ReviewService();

export async function getReviewSessionData(
  request: GetReviewSessionDataRequest,
): Promise<ReviewSessionDataDto> {
  const parsed = GetReviewSessionDataRequestSchema.parse(request);
  const account = await getAuthenticatedAccount();
  if (!account) {
    throw new Error("UNAUTHORIZED");
  }

  const dto = await reviewService.getReviewSessionData({
    accountId: account.id,
    materialId: parsed.materialId,
    group: parsed.group,
  });

  return ReviewSessionDataSchema.parse(dto);
}
