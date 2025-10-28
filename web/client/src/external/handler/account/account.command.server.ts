import "server-only";
import {
  type CreateOrGetAccountRequest,
  CreateOrGetAccountRequestSchema,
  type CreateOrGetAccountResponse,
  toAccountResponse,
} from "@/external/dto/account/account.mutation.dto";
import { AccountService } from "@/external/service/account/account.service";

const accountService = new AccountService();

export async function createOrGetAccount(
  request: CreateOrGetAccountRequest,
): Promise<CreateOrGetAccountResponse> {
  const validated = CreateOrGetAccountRequestSchema.parse(request);

  const domainAccount = await accountService.createOrGet(
    validated.provider,
    validated.providerAccountId,
    validated,
  );

  return toAccountResponse(domainAccount);
}
