"use client";

import { useQuery } from "@tanstack/react-query";
import { getAccountDetailAction } from "@/external/handler/account/account.query.action";
import { accountKeys } from "./keys";

export function useAccountDetailQuery(accountId: string) {
  return useQuery({
    queryKey: accountKeys.detail(accountId),
    queryFn: () => getAccountDetailAction(accountId),
  });
}
