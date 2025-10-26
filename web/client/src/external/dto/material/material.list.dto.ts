import { z } from "zod";

export const MaterialListItemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().nullable(),
  unitCount: z.number().int().nonnegative(),
  questionCount: z.number().int().nonnegative(),
  updatedAt: z.string(),
});

export type MaterialListItemDto = z.infer<typeof MaterialListItemSchema>;

export const MaterialListSchema = z.array(MaterialListItemSchema);
