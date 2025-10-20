import "server-only";
import {
  type AccountOutput,
  type GetAccountByProviderInput,
  GetAccountByProviderInputSchema,
  toAccountOutput,
} from "@/external/dto/account/types";
import { AccountService } from "@/external/service/account/account.service";

const accountService = new AccountService();

export async function getAccountByProvider(
  input: GetAccountByProviderInput,
): Promise<AccountOutput | null> {
  // 入力バリデーション
  const validated = GetAccountByProviderInputSchema.parse(input);

  const account = await accountService.findAccountByProvider(
    validated.provider,
    validated.providerAccountId,
  );

  return account ? toAccountOutput(account) : null;
}
