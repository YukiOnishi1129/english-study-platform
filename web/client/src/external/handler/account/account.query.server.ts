import "server-only";
import { mapAccountToFeature } from "@/external/mapper/account.mapper";
import { AccountService } from "@/external/service/account/account.service";
import type { Account } from "@/features/account/types/account";

const accountService = new AccountService();

export async function getAccountByProvider(
  provider: string,
  providerAccountId: string,
): Promise<Account | null> {
  const domainAccount = await accountService.findByProvider(
    provider,
    providerAccountId,
  );
  return domainAccount ? mapAccountToFeature(domainAccount) : null;
}
