import { z } from "zod";

export const GetMaterialListRequestSchema = z.object({
  accountId: z.uuid().optional().nullable(),
});

export type GetMaterialListRequest = z.infer<
  typeof GetMaterialListRequestSchema
>;

export const MaterialListItemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().nullable(),
  unitCount: z.number().int().nonnegative(),
  questionCount: z.number().int().nonnegative(),
  updatedAt: z.string(),
  nextUnitId: z.string().min(1).nullable(),
});

export type MaterialListItemDto = z.infer<typeof MaterialListItemSchema>;

export const MaterialListSchema = z.array(MaterialListItemSchema);
