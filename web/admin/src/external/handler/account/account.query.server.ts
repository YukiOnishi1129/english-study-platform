import "server-only";
import type { Account } from "@/external/domain/entities/Account";
import { AccountService } from "@/external/service/account/account.service";

const accountService = new AccountService();

export async function getAccountByProvider(
  provider: string,
  providerAccountId: string,
): Promise<Account | null> {
  return await accountService.findAccountByProvider(
    provider,
    providerAccountId,
  );
}
