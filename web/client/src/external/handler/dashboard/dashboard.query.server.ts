"use server";

import "server-only";

import type { DashboardDataDto } from "@/external/dto/dashboard/dashboard.query.dto";
import { DashboardDataSchema } from "@/external/dto/dashboard/dashboard.query.dto";
import { DashboardService } from "@/external/service/dashboard/dashboard.service";

const dashboardService = new DashboardService();

export async function getDashboardData(request: {
  accountId: string;
}): Promise<DashboardDataDto> {
  const dto = await dashboardService.getDashboardData(request.accountId);
  return DashboardDataSchema.parse(dto);
}
