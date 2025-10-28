"use server";

import {
  type DashboardDataDto,
  GetDashboardDataRequestSchema,
} from "@/external/dto/dashboard/dashboard.query.dto";
import { getDashboardData } from "./dashboard.query.server";

export async function getDashboardDataAction(input: {
  accountId: string;
}): Promise<DashboardDataDto | null> {
  try {
    const request = GetDashboardDataRequestSchema.parse(input);
    return await getDashboardData(request);
  } catch (_error) {
    return null;
  }
}
