import "server-only";
import {
  type AccountResponse,
  type CreateOrGetAccountRequest,
  CreateOrGetAccountRequestSchema,
  toAccountResponse,
  type UpdateAccountRoleRequest,
  UpdateAccountRoleRequestSchema,
  type UpdateAccountStatusRequest,
  UpdateAccountStatusRequestSchema,
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

export async function updateAccountRole(
  request: UpdateAccountRoleRequest,
): Promise<AccountResponse> {
  const validated = UpdateAccountRoleRequestSchema.parse(request);

  const account = await accountService.updateAccountRole({
    targetAccountId: validated.targetAccountId,
    operatorAccountId: validated.operatorAccountId,
    nextRole: validated.nextRole,
  });

  return toAccountResponse(account);
}

export async function updateAccountStatus(
  request: UpdateAccountStatusRequest,
): Promise<AccountResponse> {
  const validated = UpdateAccountStatusRequestSchema.parse(request);

  const account = await accountService.updateAccountStatus({
    targetAccountId: validated.targetAccountId,
    operatorAccountId: validated.operatorAccountId,
    isActive: validated.isActive,
  });

  return toAccountResponse(account);
}
