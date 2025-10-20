import "server-only";
import {
  type AccountResponse,
  type CreateOrGetAccountRequest,
  CreateOrGetAccountRequestSchema,
  toAccountResponse,
} from "@/external/dto/account/account.command.dto";
import { AccountService } from "@/external/service/account/account.service";

const accountService = new AccountService();

export async function createOrGetAccount(
  request: CreateOrGetAccountRequest,
): Promise<AccountResponse> {
  // 入力バリデーション
  const validated = CreateOrGetAccountRequestSchema.parse(request);

  const account = await accountService.findOrCreateAccount(
    validated.provider,
    validated.providerAccountId,
    validated.createInput,
  );

  return toAccountResponse(account);
}
