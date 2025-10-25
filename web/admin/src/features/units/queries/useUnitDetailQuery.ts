"use client";

import { useQuery } from "@tanstack/react-query";
import { getUnitDetailAction } from "@/external/handler/material/material.query.action";
import { unitKeys } from "./keys";

export function useUnitDetailQuery(unitId: string) {
  return useQuery({
    queryKey: unitKeys.detail(unitId),
    queryFn: async () => {
      const response = await getUnitDetailAction({ unitId });
      if (!response) {
        throw new Error("UNIT_NOT_FOUND");
      }
      return response;
    },
  });
}
