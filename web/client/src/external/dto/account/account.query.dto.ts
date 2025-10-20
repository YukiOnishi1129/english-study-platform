import type { Account } from "@acme/shared/domain";
import { z } from "zod";

// Request schema for getting account by provider
export const GetAccountByProviderRequestSchema = z.object({
  provider: z.string().min(1),
  providerAccountId: z.string().min(1),
});

export type GetAccountByProviderRequest = z.infer<
  typeof GetAccountByProviderRequestSchema
>;

// Response type
export type AccountResponse = Account;

// Mapper function
export function toAccountResponse(account: Account): AccountResponse {
  return account;
}
