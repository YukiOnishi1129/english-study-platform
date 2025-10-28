"use server";

import { getReviewData } from "./review.query.server";

export async function getReviewDataAction(input: {
  accountId: string | null;
  materialId?: string;
}) {
  if (!input.accountId) {
    return null;
  }

  try {
    return await getReviewData({
      accountId: input.accountId,
      materialId: input.materialId,
    });
  } catch (_error) {
    return null;
  }
}
