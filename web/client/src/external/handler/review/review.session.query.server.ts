"use server";

import "server-only";

import type { ReviewSessionDataDto } from "@/external/dto/review/review.session.dto";
import { ReviewSessionDataSchema } from "@/external/dto/review/review.session.dto";
import { ReviewService } from "@/external/service/review/review.service";
import { getAuthenticatedAccount } from "@/features/auth/servers/auth-check.server";

const reviewService = new ReviewService();

export async function getReviewSessionData(request: {
  materialId: string;
  group: "weak" | "lowAttempts" | "unattempted";
}): Promise<ReviewSessionDataDto> {
  const account = await getAuthenticatedAccount();
  if (!account) {
    throw new Error("UNAUTHORIZED");
  }

  const dto = await reviewService.getReviewSessionData({
    accountId: account.id,
    materialId: request.materialId,
    group: request.group,
  });

  return ReviewSessionDataSchema.parse(dto);
}
