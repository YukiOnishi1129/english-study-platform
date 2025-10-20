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
  // 入力バリデーション
  const validated = GetAccountByProviderRequestSchema.parse(request);

  const account = await accountService.findAccountByProvider(
    validated.provider,
    validated.providerAccountId,
  );

  return account ? toAccountResponse(account) : null;
}
