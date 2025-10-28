"use server";

import {
  GetReviewSessionDataRequestSchema,
  type ReviewSessionDataDto,
} from "@/external/dto/review/review.session.dto";
import { getReviewSessionData } from "./review.session.query.server";

export async function getReviewSessionDataAction(input: {
  materialId: string;
  group: "weak" | "lowAttempts" | "unattempted";
}): Promise<ReviewSessionDataDto | null> {
  try {
    const request = GetReviewSessionDataRequestSchema.parse(input);
    return await getReviewSessionData(request);
  } catch (_error) {
    return null;
  }
}
