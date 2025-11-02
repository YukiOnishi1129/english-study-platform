import { z } from "zod";

// ===== Request DTOs =====

export const GetAccountByProviderRequestSchema = z.object({
  provider: z.string().min(1),
  providerAccountId: z.string().min(1),
});

export type GetAccountByProviderRequest = z.infer<
  typeof GetAccountByProviderRequestSchema
>;

export const GetAccountByEmailRequestSchema = z.object({
  email: z.string().email(),
});

export type GetAccountByEmailRequest = z.infer<
  typeof GetAccountByEmailRequestSchema
>;

export const ListAccountsRequestSchema = z.object({
  search: z.string().trim().optional(),
  roles: z
    .array(z.enum(["admin", "user"]))
    .max(2)
    .optional(),
  statuses: z
    .array(z.enum(["active", "inactive"]))
    .max(2)
    .optional(),
  orderBy: z.enum(["lastLoginDesc", "lastLoginAsc", "createdDesc"]).optional(),
  page: z.number().int().min(0).default(0),
  limit: z.number().int().min(1).max(100).default(20),
});

export type ListAccountsRequest = z.infer<typeof ListAccountsRequestSchema>;

// ===== Response DTOs =====

const NonEmptyString = z.string().min(1);

export const AccountResponseSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  firstName: NonEmptyString,
  lastName: z.union([NonEmptyString, z.literal("")]),
  fullName: NonEmptyString,
  role: z.enum(["admin", "user"]),
  isActive: z.boolean(),
  lastLoginAt: z.date().nullable(),
  provider: z.string(),
  providerAccountId: z.string(),
  thumbnail: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type AccountResponse = z.infer<typeof AccountResponseSchema>;

export const ListAccountsResponseSchema = z.object({
  total: z.number().int().min(0),
  page: z.number().int().min(0),
  limit: z.number().int().min(1),
  items: z.array(AccountResponseSchema),
});

export type ListAccountsResponse = z.infer<typeof ListAccountsResponseSchema>;

// ===== 変換関数 =====

import type { Account } from "@acme/shared/domain";

export function toAccountResponse(account: Account): AccountResponse {
  const rawFirstName = account.firstName.trim();
  const rawLastName = account.lastName.trim();
  const normalizedFirstName =
    rawFirstName.length > 0
      ? rawFirstName
      : (account.email.split("@")[0] ?? account.email);
  const normalizedLastName = rawLastName;
  const normalizedFullName = `${normalizedFirstName} ${normalizedLastName}`
    .trim()
    .replace(/\s+/g, " ");

  return AccountResponseSchema.parse({
    id: account.id,
    email: account.email,
    firstName: normalizedFirstName,
    lastName: normalizedLastName,
    fullName: normalizedFullName,
    role: account.role,
    isActive: account.isActive,
    lastLoginAt: account.lastLoginAt,
    provider: account.provider,
    providerAccountId: account.providerAccountId,
    thumbnail: account.thumbnail,
    createdAt: account.createdAt,
    updatedAt: account.updatedAt,
  });
}
