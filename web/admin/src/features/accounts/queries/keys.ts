import type { ListAccountsRequest } from "@/external/dto/account/account.query.dto";
import { serializeAccountListKey } from "@/features/accounts/lib/accountListParams";

export const accountKeys = {
  all: ["accounts"] as const,
  list: (params: ListAccountsRequest) =>
    [...accountKeys.all, "list", serializeAccountListKey(params)] as const,
  detail: (accountId: string) =>
    [...accountKeys.all, "detail", accountId] as const,
};
