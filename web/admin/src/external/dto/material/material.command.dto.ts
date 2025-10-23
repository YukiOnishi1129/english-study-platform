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

const OPTIONAL_TEXT_SCHEMA = z
  .string()
  .trim()
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

export const UpdateChapterRequestSchema = z.object({
  chapterId: z.string().min(1, "chapterIdが指定されていません。"),
  name: NAME_SCHEMA,
  description: DESCRIPTION_SCHEMA,
});

export type UpdateChapterRequest = z.infer<typeof UpdateChapterRequestSchema>;

export const UpdateUnitOrdersRequestSchema = z.object({
  chapterId: z.string().min(1, "chapterIdが指定されていません。"),
  orderedUnitIds: z
    .array(z.string().min(1, "unitIdが指定されていません。"))
    .min(1, "並び替えるUNITを1件以上指定してください。"),
});
export type UpdateUnitOrdersRequest = z.infer<
  typeof UpdateUnitOrdersRequestSchema
>;

const ImportUnitQuestionRowSchema = z.object({
  relatedId: z
    .string()
    .trim()
    .min(1)
    .optional()
    .transform((value) => (value && value.length > 0 ? value : undefined)),
  order: z.number().int().positive().optional(),
  japanese: z.string().trim().min(1, "日本語を入力してください。"),
  hint: OPTIONAL_TEXT_SCHEMA,
  explanation: OPTIONAL_TEXT_SCHEMA,
  correctAnswers: z
    .array(z.string().trim().min(1, "英語正解は1文字以上で入力してください。"))
    .min(1, "英語の正解を1つ以上入力してください。"),
});

export const ImportUnitQuestionsRequestSchema = z.object({
  unitId: z.string().min(1, "unitIdが指定されていません。"),
  rows: z.array(ImportUnitQuestionRowSchema).min(1, "取り込む行がありません。"),
});

export type ImportUnitQuestionsRequest = z.infer<
  typeof ImportUnitQuestionsRequestSchema
>;
export type ImportUnitQuestionRow = z.infer<typeof ImportUnitQuestionRowSchema>;

export const UpdateQuestionRequestSchema = z.object({
  questionId: z.string().min(1, "questionIdが指定されていません。"),
  unitId: z.string().min(1, "unitIdが指定されていません。"),
  japanese: z.string().trim().min(1, "日本語を入力してください。"),
  hint: OPTIONAL_TEXT_SCHEMA,
  explanation: OPTIONAL_TEXT_SCHEMA,
  order: z.number().int().positive().optional(),
  correctAnswers: z
    .array(z.string().trim().min(1, "英語正解は1文字以上で入力してください。"))
    .min(1, "英語の正解を1つ以上入力してください。"),
});

export type UpdateQuestionRequest = z.infer<typeof UpdateQuestionRequestSchema>;

export const DeleteQuestionRequestSchema = z.object({
  questionId: z.string().min(1, "questionIdが指定されていません。"),
  unitId: z.string().min(1, "unitIdが指定されていません。"),
});

export type DeleteQuestionRequest = z.infer<typeof DeleteQuestionRequestSchema>;

export const UpdateQuestionOrdersRequestSchema = z.object({
  unitId: z.string().min(1, "unitIdが指定されていません。"),
  orderedQuestionIds: z
    .array(z.string().min(1, "questionIdが指定されていません。"))
    .min(1, "並び替える問題を1件以上指定してください。"),
});

export type UpdateQuestionOrdersRequest = z.infer<
  typeof UpdateQuestionOrdersRequestSchema
>;

export const DeleteChapterRequestSchema = z.object({
  chapterId: z.string().min(1, "chapterIdが指定されていません。"),
});

export type DeleteChapterRequest = z.infer<typeof DeleteChapterRequestSchema>;

export const DeleteUnitRequestSchema = z.object({
  unitId: z.string().min(1, "unitIdが指定されていません。"),
});

export type DeleteUnitRequest = z.infer<typeof DeleteUnitRequestSchema>;
