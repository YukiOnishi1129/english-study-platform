import type { Account } from "@acme/shared/domain";
import { z } from "zod";

// ===== Request DTOs =====

export const GetAccountByProviderRequestSchema = z.object({
  provider: z.string().min(1),
  providerAccountId: z.string().min(1),
});

export type GetAccountByProviderRequest = z.infer<
  typeof GetAccountByProviderRequestSchema
>;

// ===== Response DTOs =====

export const AccountResponseSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  fullName: z.string().min(1),
  role: z.enum(["admin", "user"]),
  provider: z.string().min(1),
  providerAccountId: z.string().min(1),
  thumbnail: z.string().optional(),
  isAdmin: z.boolean(),
  canAccessAdminPanel: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type AccountResponse = z.infer<typeof AccountResponseSchema>;

// ===== Mapper =====

export function toAccountResponse(account: Account): AccountResponse {
  return AccountResponseSchema.parse({
    id: account.id,
    email: account.email,
    firstName: account.firstName,
    lastName: account.lastName,
    fullName: account.fullName,
    role: account.role,
    provider: account.provider,
    providerAccountId: account.providerAccountId,
    thumbnail: account.thumbnail,
    isAdmin: account.isAdmin(),
    canAccessAdminPanel: account.canAccessAdminPanel(),
    createdAt: account.createdAt,
    updatedAt: account.updatedAt,
  });
}
