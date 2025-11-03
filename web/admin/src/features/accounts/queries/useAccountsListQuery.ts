"use client";

import { useQuery } from "@tanstack/react-query";
import type { ListAccountsRequest } from "@/external/dto/account/account.query.dto";
import { listAccountsAction } from "@/external/handler/account/account.query.action";
import { accountKeys } from "./keys";

export function useAccountsListQuery(params: ListAccountsRequest) {
  return useQuery({
    queryKey: accountKeys.list(params),
    queryFn: () => listAccountsAction(params),
  });
}
