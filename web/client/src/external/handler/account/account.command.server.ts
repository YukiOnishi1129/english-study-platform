import "server-only";
import { mapAccountToFeature } from "@/external/mapper/account.mapper";
import {
  AccountService,
  type CreateAccountInput,
} from "@/external/service/account/account.service";
import type { Account } from "@/features/account/types/account";

const accountService = new AccountService();

export async function createOrGetAccount(
  provider: string,
  providerAccountId: string,
  createInput: CreateAccountInput,
): Promise<Account> {
  const domainAccount = await accountService.createOrGet(
    provider,
    providerAccountId,
    createInput,
  );
  return mapAccountToFeature(domainAccount);
}
