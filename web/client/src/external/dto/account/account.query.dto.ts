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

const NonEmptyString = z.string().min(1);

export const AccountResponseSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  firstName: NonEmptyString,
  lastName: z.union([NonEmptyString, z.literal("")]),
  fullName: NonEmptyString,
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
  const rawFirstName = (account.firstName ?? "").trim();
  const rawLastName = (account.lastName ?? "").trim();
  const normalizedFirstName =
    rawFirstName.length > 0
      ? rawFirstName
      : account.email.split("@")[0] ?? "User";
  const normalizedLastName = rawLastName;
  const normalizedFullName = `${normalizedFirstName} ${normalizedLastName}`
    .trim()
    .length
    ? `${normalizedFirstName} ${normalizedLastName}`.trim()
    : normalizedFirstName;

  return AccountResponseSchema.parse({
    id: account.id,
    email: account.email,
    firstName: normalizedFirstName,
    lastName: normalizedLastName,
    fullName: normalizedFullName,
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
