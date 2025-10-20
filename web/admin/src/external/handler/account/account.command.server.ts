import "server-only";
import {
  type AccountOutput,
  type CreateOrGetAccountInput,
  CreateOrGetAccountInputSchema,
  toAccountOutput,
} from "@/external/dto/account/types";
import { AccountService } from "@/external/service/account/account.service";

const accountService = new AccountService();

export async function createOrGetAccount(
  input: CreateOrGetAccountInput,
): Promise<AccountOutput> {
  // 入力バリデーション
  const validated = CreateOrGetAccountInputSchema.parse(input);

  const account = await accountService.findOrCreateAccount(
    validated.provider,
    validated.providerAccountId,
    validated.createInput,
  );

  return toAccountOutput(account);
}
