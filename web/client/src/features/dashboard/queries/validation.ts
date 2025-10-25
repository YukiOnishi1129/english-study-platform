import { DashboardDataSchema } from "@/external/dto/dashboard/dashboard.query.dto";

export function ensureDashboardData(data: unknown) {
  return DashboardDataSchema.parse(data);
}
