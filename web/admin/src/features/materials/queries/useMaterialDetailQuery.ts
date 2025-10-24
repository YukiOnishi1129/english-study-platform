"use client";

import { useQuery } from "@tanstack/react-query";
import { getMaterialHierarchyAction } from "@/external/handler/material/material.query.action";
import { materialKeys } from "./keys";
import { ensureMaterialHierarchy } from "./validation";

export function useMaterialDetailQuery(materialId: string) {
  return useQuery({
    queryKey: materialKeys.detail(materialId),
    queryFn: async () => {
      const response = await getMaterialHierarchyAction({ materialId });
      if (!response) {
        throw new Error("MATERIAL_NOT_FOUND");
      }
      return ensureMaterialHierarchy(response);
    },
  });
}
