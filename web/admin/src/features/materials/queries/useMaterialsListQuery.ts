"use client";

import { useQuery } from "@tanstack/react-query";
import { listMaterialsHierarchyAction } from "@/external/handler/material/material.query.action";
import { materialKeys } from "./keys";
import { ensureMaterialHierarchyList } from "./validation";

export function useMaterialsListQuery() {
  return useQuery({
    queryKey: materialKeys.list(),
    queryFn: async () => {
      const response = await listMaterialsHierarchyAction();
      return ensureMaterialHierarchyList(response);
    },
  });
}
