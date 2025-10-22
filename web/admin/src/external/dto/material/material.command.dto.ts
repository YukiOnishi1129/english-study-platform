import { z } from "zod";

const NAME_SCHEMA = z
  .string()
  .trim()
  .min(1, "名称を入力してください。")
  .max(120, "名称は120文字以内で入力してください。");

const DESCRIPTION_SCHEMA = z
  .string()
  .trim()
  .max(500, "説明は500文字以内で入力してください。")
  .optional()
  .transform((value) => (value && value.length > 0 ? value : undefined));

export const CreateMaterialRequestSchema = z.object({
  name: NAME_SCHEMA,
  description: DESCRIPTION_SCHEMA,
});
export type CreateMaterialRequest = z.infer<typeof CreateMaterialRequestSchema>;

export const CreateChapterRequestSchema = z.object({
  materialId: z.string().min(1, "materialIdが指定されていません。"),
  parentChapterId: z
    .string()
    .trim()
    .min(1)
    .optional()
    .transform((value) => (value && value.length > 0 ? value : undefined)),
  name: NAME_SCHEMA,
  description: DESCRIPTION_SCHEMA,
});
export type CreateChapterRequest = z.infer<typeof CreateChapterRequestSchema>;

export const CreateUnitRequestSchema = z.object({
  chapterId: z.string().min(1, "chapterIdが指定されていません。"),
  name: NAME_SCHEMA,
  description: DESCRIPTION_SCHEMA,
});
export type CreateUnitRequest = z.infer<typeof CreateUnitRequestSchema>;

export const UpdateUnitRequestSchema = z.object({
  unitId: z.string().min(1, "unitIdが指定されていません。"),
  name: NAME_SCHEMA,
  description: DESCRIPTION_SCHEMA,
});
export type UpdateUnitRequest = z.infer<typeof UpdateUnitRequestSchema>;

export const UpdateUnitOrdersRequestSchema = z.object({
  chapterId: z.string().min(1, "chapterIdが指定されていません。"),
  orderedUnitIds: z
    .array(z.string().min(1, "unitIdが指定されていません。"))
    .min(1, "並び替えるUNITを1件以上指定してください。"),
});
export type UpdateUnitOrdersRequest = z.infer<
  typeof UpdateUnitOrdersRequestSchema
>;
