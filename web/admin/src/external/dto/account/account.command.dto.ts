import { z } from "zod";

// ===== Request DTOs =====

export const CreateOrGetAccountRequestSchema = z.object({
  provider: z.string().min(1),
  providerAccountId: z.string().min(1),
  createInput: z.object({
    email: z.string().email(),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    role: z.enum(["admin", "user"]),
    provider: z.string().min(1),
    providerAccountId: z.string().min(1),
  }),
});

export type CreateOrGetAccountRequest = z.infer<
  typeof CreateOrGetAccountRequestSchema
>;

export const UpdateAccountRoleRequestSchema = z.object({
  targetAccountId: z.string().uuid(),
  operatorAccountId: z.string().uuid(),
  nextRole: z.enum(["admin", "user"]),
});

export type UpdateAccountRoleRequest = z.infer<
  typeof UpdateAccountRoleRequestSchema
>;

export const UpdateAccountStatusRequestSchema = z.object({
  targetAccountId: z.string().uuid(),
  operatorAccountId: z.string().uuid(),
  isActive: z.boolean(),
});

export type UpdateAccountStatusRequest = z.infer<
  typeof UpdateAccountStatusRequestSchema
>;

// ===== Response DTOs =====

export const AccountResponseSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  firstName: z.string().min(1),
  lastName: z.string(),
  fullName: z.string().min(1),
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
