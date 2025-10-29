"use client";

import { useQuery } from "@tanstack/react-query";
import { getDashboardDataAction } from "@/external/handler/dashboard/dashboard.query.action";
import { dashboardKeys } from "./keys";
import { ensureDashboardData } from "./validation";

export function useDashboardQuery(accountId: string) {
  return useQuery({
    queryKey: dashboardKeys.all(accountId),
    queryFn: async () => {
      const response = await getDashboardDataAction({ accountId });
      if (!response) {
        throw new Error("DASHBOARD_DATA_UNAVAILABLE");
      }
      return ensureDashboardData(response);
    },
  });
}
