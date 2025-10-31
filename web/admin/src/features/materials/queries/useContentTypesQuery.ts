"use client";

import { useQuery } from "@tanstack/react-query";
import { listContentTypesAction } from "@/external/handler/material/material.query.action";
import { materialKeys } from "./keys";

export function useContentTypesQuery() {
  return useQuery({
    queryKey: materialKeys.contentTypes(),
    queryFn: () => listContentTypesAction(),
  });
}
