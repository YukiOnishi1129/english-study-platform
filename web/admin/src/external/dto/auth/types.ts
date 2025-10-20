import { z } from "zod";

// ===== Input DTOs =====

export const VerifyIdTokenInputSchema = z.object({
  idToken: z.string().min(1),
});

export type VerifyIdTokenInput = z.infer<typeof VerifyIdTokenInputSchema>;

export const RefreshTokensInputSchema = z.object({
  refreshToken: z.string().min(1),
});

export type RefreshTokensInput = z.infer<typeof RefreshTokensInputSchema>;

// ===== Output DTOs =====

export const TokenPayloadOutputSchema = z.object({
  userId: z.string(),
  email: z.string().email().nullable().optional(),
  emailVerified: z.boolean().optional(),
  name: z.string().optional(),
  picture: z.string().url().optional(),
  isValid: z.boolean(),
});

export type TokenPayloadOutput = z.infer<typeof TokenPayloadOutputSchema>;

export const RefreshTokensOutputSchema = z.object({
  idToken: z.string().optional(),
  accessToken: z.string().optional(),
  expiryDate: z.number().optional(),
});

export type RefreshTokensOutput = z.infer<typeof RefreshTokensOutputSchema>;
