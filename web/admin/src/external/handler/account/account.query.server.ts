import "server-only";
import {
  type AccountResponse,
  type GetAccountByEmailRequest,
  type GetAccountByProviderRequest,
  GetAccountByEmailRequestSchema,
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

export async function getAccountByEmail(
  request: GetAccountByEmailRequest,
): Promise<AccountResponse | null> {
  const validated = GetAccountByEmailRequestSchema.parse(request);

  const account = await accountService.findAccountByEmail(validated.email);

  return account ? toAccountResponse(account) : null;
}
