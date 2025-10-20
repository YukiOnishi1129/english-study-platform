import "server-only";
import type { Account } from "@/external/domain/entities/Account";
import {
  AccountService,
  type CreateAccountInput,
} from "@/external/service/account/account.service";

const accountService = new AccountService();

export async function createOrGetAccount(
  provider: string,
  providerAccountId: string,
  createInput: CreateAccountInput,
): Promise<Account> {
  return await accountService.findOrCreateAccount(
    provider,
    providerAccountId,
    createInput,
  );
}
