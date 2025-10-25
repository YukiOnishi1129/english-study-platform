"use server";

import { getDashboardData } from "./dashboard.query.server";

export async function getDashboardDataAction(input: { accountId: string }) {
  try {
    return await getDashboardData(input);
  } catch (_error) {
    return null;
  }
}
