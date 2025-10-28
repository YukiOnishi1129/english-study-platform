"use server";

import "server-only";

import {
  type DashboardDataDto,
  DashboardDataSchema,
  type GetDashboardDataRequest,
  GetDashboardDataRequestSchema,
} from "@/external/dto/dashboard/dashboard.query.dto";
import { DashboardService } from "@/external/service/dashboard/dashboard.service";

const dashboardService = new DashboardService();

export async function getDashboardData(
  request: GetDashboardDataRequest,
): Promise<DashboardDataDto> {
  const { accountId } = GetDashboardDataRequestSchema.parse(request);
  const dto = await dashboardService.getDashboardData(accountId);
  return DashboardDataSchema.parse(dto);
}
