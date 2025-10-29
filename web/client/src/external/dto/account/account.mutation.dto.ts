import { z } from "zod";

import {
  type AccountResponse,
  AccountResponseSchema,
} from "@/external/dto/account/account.query.dto";

export { toAccountResponse } from "@/external/dto/account/account.query.dto";

export const CreateOrGetAccountRequestSchema = z.object({
  email: z.email(),
  name: z.string().min(1),
  provider: z.string().min(1),
  providerAccountId: z.string().min(1),
  thumbnail: z.string().optional(),
});

export type CreateOrGetAccountRequest = z.infer<
  typeof CreateOrGetAccountRequestSchema
>;

export type CreateOrGetAccountResponse = AccountResponse;

export const CreateOrGetAccountResponseSchema = AccountResponseSchema;
