"use server";

import {
  type CreateOrGetAccountRequest,
  CreateOrGetAccountRequestSchema,
  type UpdateAccountRoleRequest,
  UpdateAccountRoleRequestSchema,
  type UpdateAccountStatusRequest,
  UpdateAccountStatusRequestSchema,
} from "@/external/dto/account/account.command.dto";
import {
  createOrGetAccount as createOrGetAccountServer,
  updateAccountRole as updateAccountRoleServer,
  updateAccountStatus as updateAccountStatusServer,
} from "@/external/handler/account/account.command.server";

export async function createOrGetAccountAction(
  request: CreateOrGetAccountRequest,
) {
  const validated = CreateOrGetAccountRequestSchema.parse(request);
  return createOrGetAccountServer(validated);
}

export async function updateAccountRoleAction(
  request: UpdateAccountRoleRequest,
) {
  const validated = UpdateAccountRoleRequestSchema.parse(request);
  return updateAccountRoleServer(validated);
}

export async function updateAccountStatusAction(
  request: UpdateAccountStatusRequest,
) {
  const validated = UpdateAccountStatusRequestSchema.parse(request);
  return updateAccountStatusServer(validated);
}
