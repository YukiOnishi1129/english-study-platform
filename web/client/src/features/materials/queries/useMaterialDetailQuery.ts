"use client";

import { useQuery } from "@tanstack/react-query";

import { getMaterialDetailAction } from "@/external/handler/material/material.query.action";
import { materialKeys } from "./keys";

export function useMaterialDetailQuery(
  materialId: string | null,
  accountId: string | null,
) {
  return useQuery({
    queryKey: materialId
      ? materialKeys.detail(materialId, accountId)
      : (["material", "placeholder", accountId ?? "anon"] as const),
    enabled: Boolean(materialId),
    queryFn: async () => {
      if (!materialId) {
        throw new Error("MATERIAL_ID_REQUIRED");
      }
      const data = await getMaterialDetailAction({ materialId, accountId });
      if (!data) {
        throw new Error("MATERIAL_NOT_FOUND");
      }
      return data;
    },
  });
}
