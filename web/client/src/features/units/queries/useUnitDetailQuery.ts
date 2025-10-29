"use client";

import { useQuery } from "@tanstack/react-query";
import { UnitDetailSchema } from "@/external/dto/unit/unit.query.dto";
import { getUnitDetailAction } from "@/external/handler/unit/unit.query.action";
import { unitKeys } from "./keys";

interface UseUnitDetailQueryOptions {
  enabled?: boolean;
}

export function useUnitDetailQuery(
  unitId: string,
  accountId: string | null,
  options?: UseUnitDetailQueryOptions,
) {
  return useQuery({
    queryKey: unitKeys.detail(unitId, accountId),
    enabled: options?.enabled ?? true,
    queryFn: async () => {
      const response = await getUnitDetailAction({ unitId });
      if (!response) {
        throw new Error("UNIT_NOT_FOUND");
      }
      return UnitDetailSchema.parse(response);
    },
  });
}
