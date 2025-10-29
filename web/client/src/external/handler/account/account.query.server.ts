import "server-only";
import {
  type AccountResponse,
  type GetAccountByProviderRequest,
  GetAccountByProviderRequestSchema,
  toAccountResponse,
} from "@/external/dto/account/account.query.dto";
import { AccountService } from "@/external/service/account/account.service";

const accountService = new AccountService();

export async function getAccountByProvider(
  request: GetAccountByProviderRequest,
): Promise<AccountResponse | null> {
  const validated = GetAccountByProviderRequestSchema.parse(request);

  const domainAccount = await accountService.findByProvider(
    validated.provider,
    validated.providerAccountId,
  );
  return domainAccount ? toAccountResponse(domainAccount) : null;
}
