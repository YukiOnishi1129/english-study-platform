"use server";

import { getNextStudyTarget } from "./next-study-target.query.server";

export async function getNextStudyTargetAction() {
  try {
    return await getNextStudyTarget();
  } catch (_error) {
    return null;
  }
}
