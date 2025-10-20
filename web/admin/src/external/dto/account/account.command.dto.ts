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

// ===== Response DTOs =====

export const AccountResponseSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  firstName: z.string(),
  lastName: z.string(),
  role: z.enum(["admin", "user"]),
  provider: z.string(),
  providerAccountId: z.string(),
  thumbnail: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type AccountResponse = z.infer<typeof AccountResponseSchema>;

// ===== 変換関数 =====

import type { Account } from "@/external/domain/entities/Account";

export function toAccountResponse(account: Account): AccountResponse {
  return {
    id: account.id,
    email: account.email,
    firstName: account.firstName,
    lastName: account.lastName,
    role: account.role,
    provider: account.provider,
    providerAccountId: account.providerAccountId,
    thumbnail: account.thumbnail,
    createdAt: account.createdAt,
    updatedAt: account.updatedAt,
  };
}
