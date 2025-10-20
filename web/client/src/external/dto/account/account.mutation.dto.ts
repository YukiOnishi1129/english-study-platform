import type { Account } from "@acme/shared/domain";
import { z } from "zod";

// Create account request schema
export const CreateAccountRequestSchema = z.object({
  email: z.email(),
  name: z.string().min(1),
  provider: z.string().min(1),
  providerAccountId: z.string().min(1),
  thumbnail: z.string().optional(),
});

export type CreateAccountRequest = z.infer<typeof CreateAccountRequestSchema>;

// Response type
export type CreateAccountResponse = Account;
