"use server";

import {
  type ListAccountsRequest,
  ListAccountsRequestSchema,
} from "@/external/dto/account/account.query.dto";
import {
  getAccountDetail,
  listAccounts,
} from "@/external/handler/account/account.query.server";

export async function listAccountsAction(input: ListAccountsRequest) {
  const validated = ListAccountsRequestSchema.parse(input);
  return listAccounts(validated);
}

export async function getAccountDetailAction(accountId: string) {
  return getAccountDetail(accountId);
}
