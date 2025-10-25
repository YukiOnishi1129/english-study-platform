"use client";

import { useQuery } from "@tanstack/react-query";
import { listMaterialsHierarchyAction } from "@/external/handler/material/material.query.action";
import { materialKeys } from "./keys";

export function useMaterialsListQuery() {
  return useQuery({
    queryKey: materialKeys.list(),
    queryFn: () => listMaterialsHierarchyAction(),
  });
}
