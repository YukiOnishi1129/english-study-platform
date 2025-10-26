"use server";

import { getUnitDetail } from "./unit.query.server";

export async function getUnitDetailAction(input: { unitId: string }) {
  try {
    return await getUnitDetail(input);
  } catch (_error) {
    return null;
  }
}
