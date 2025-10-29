"use client";

import { useQuery } from "@tanstack/react-query";

import { getMaterialListAction } from "@/external/handler/material/material.query.action";
import { materialKeys } from "./keys";

export function useMaterialListQuery(accountId: string | null) {
  return useQuery({
    queryKey: materialKeys.list(accountId),
    queryFn: () => getMaterialListAction(accountId),
  });
}
