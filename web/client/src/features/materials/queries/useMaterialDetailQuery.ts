"use client";

import { useQuery } from "@tanstack/react-query";

import { getMaterialDetailAction } from "@/external/handler/material/material.query.action";
import { materialKeys } from "./keys";

export function useMaterialDetailQuery(
  materialId: string,
  accountId: string | null,
) {
  return useQuery({
    queryKey: materialKeys.detail(materialId, accountId),
    queryFn: () =>
      getMaterialDetailAction({ materialId, accountId }).then((data) => {
        if (!data) {
          throw new Error("MATERIAL_NOT_FOUND");
        }
        return data;
      }),
  });
}
