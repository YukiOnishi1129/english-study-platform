import { z } from "zod";

// ===== Input DTOs =====

export const GetAccountByProviderInputSchema = z.object({
  provider: z.string().min(1),
  providerAccountId: z.string().min(1),
});

export type GetAccountByProviderInput = z.infer<
  typeof GetAccountByProviderInputSchema
>;

export const CreateOrGetAccountInputSchema = z.object({
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

export type CreateOrGetAccountInput = z.infer<
  typeof CreateOrGetAccountInputSchema
>;

// ===== Output DTOs =====

export const AccountOutputSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  role: z.enum(["admin", "user"]),
  provider: z.string(),
  providerAccountId: z.string(),
  thumbnail: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type AccountOutput = z.infer<typeof AccountOutputSchema>;

// ===== 変換関数 =====

import type { Account } from "@/external/domain/entities/Account";

export function toAccountOutput(account: Account): AccountOutput {
  return {
    id: account.id,
    email: account.email,
    firstName: account.firstName,
    lastName: account.lastName,
    role: account.role,
    provider: account.provider,
    providerAccountId: account.providerAccountId,
    createdAt: account.createdAt,
    updatedAt: account.updatedAt,
  };
}
