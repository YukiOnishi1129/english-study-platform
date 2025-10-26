"use client";

import { useQuery } from "@tanstack/react-query";
import { UnitDetailSchema } from "@/external/dto/unit/unit.query.dto";
import { getUnitDetailAction } from "@/external/handler/unit/unit.query.action";
import { unitKeys } from "./keys";

export function useUnitDetailQuery(unitId: string) {
  return useQuery({
    queryKey: unitKeys.detail(unitId),
    queryFn: async () => {
      const response = await getUnitDetailAction({ unitId });
      if (!response) {
        throw new Error("UNIT_NOT_FOUND");
      }
      return UnitDetailSchema.parse(response);
    },
  });
}
