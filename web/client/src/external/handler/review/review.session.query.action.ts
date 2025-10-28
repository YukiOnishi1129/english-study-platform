"use server";

import { getReviewSessionData } from "./review.session.query.server";

export async function getReviewSessionDataAction(input: {
  materialId: string;
  group: "weak" | "lowAttempts" | "unattempted";
}) {
  try {
    return await getReviewSessionData(input);
  } catch (_error) {
    return null;
  }
}
