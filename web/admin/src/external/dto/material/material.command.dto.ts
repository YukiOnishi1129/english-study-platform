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

const OPTIONAL_TEXT_ARRAY_SCHEMA = z
  .array(OPTIONAL_TEXT_SCHEMA)
  .optional()
  .transform((value) =>
    Array.isArray(value)
      ? value.filter((item): item is string => typeof item === "string")
      : [],
  );

const CONTENT_TYPE_ID_SCHEMA = z
  .string()
  .min(1, "教材タイプを選択してください。");

export const CreateMaterialRequestSchema = z.object({
  name: NAME_SCHEMA,
  description: DESCRIPTION_SCHEMA,
  contentTypeId: CONTENT_TYPE_ID_SCHEMA,
});
export type CreateMaterialRequest = z.infer<typeof CreateMaterialRequestSchema>;

export const UpdateMaterialRequestSchema = z.object({
  materialId: z.string().min(1, "materialIdが指定されていません。"),
  name: NAME_SCHEMA,
  description: DESCRIPTION_SCHEMA,
});
export type UpdateMaterialRequest = z.infer<typeof UpdateMaterialRequestSchema>;

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

const ImportVocabularyRowSchema = z.object({
  vocabularyId: OPTIONAL_TEXT_SCHEMA,
  questionId: OPTIONAL_TEXT_SCHEMA,
  order: z.number().int().positive().optional(),
  headword: z.string().trim().min(1, "英単語を入力してください。"),
  pronunciation: OPTIONAL_TEXT_SCHEMA,
  partOfSpeech: OPTIONAL_TEXT_SCHEMA,
  definitionJa: z.string().trim().min(1, "日本語訳1を入力してください。"),
  definitionVariants: OPTIONAL_TEXT_ARRAY_SCHEMA,
  prompt: OPTIONAL_TEXT_SCHEMA,
  answerCandidates: z
    .array(z.string().trim().min(1, "正解候補は1文字以上で入力してください。"))
    .min(1, "正解候補を1つ以上入力してください。"),
  synonyms: OPTIONAL_TEXT_ARRAY_SCHEMA,
  antonyms: OPTIONAL_TEXT_ARRAY_SCHEMA,
  relatedWords: OPTIONAL_TEXT_ARRAY_SCHEMA,
  exampleSentenceEn: OPTIONAL_TEXT_SCHEMA,
  exampleSentenceJa: OPTIONAL_TEXT_SCHEMA,
});

export const ImportVocabularyEntriesRequestSchema = z.object({
  unitId: z.string().min(1, "unitIdが指定されていません。"),
  materialId: z.string().min(1, "materialIdが指定されていません。"),
  rows: z.array(ImportVocabularyRowSchema).min(1, "取り込む語彙がありません。"),
});

export type ImportVocabularyEntriesRequest = z.infer<
  typeof ImportVocabularyEntriesRequestSchema
>;

export type ImportVocabularyRow = z.infer<typeof ImportVocabularyRowSchema>;

const VocabularyUpdateSchema = z.object({
  vocabularyEntryId: z
    .string()
    .min(1, "vocabularyEntryIdが指定されていません。"),
  headword: z.string().trim().min(1, "英単語を入力してください。"),
  pronunciation: OPTIONAL_TEXT_SCHEMA,
  partOfSpeech: OPTIONAL_TEXT_SCHEMA,
  memo: OPTIONAL_TEXT_SCHEMA,
  synonyms: OPTIONAL_TEXT_ARRAY_SCHEMA,
  antonyms: OPTIONAL_TEXT_ARRAY_SCHEMA,
  relatedWords: OPTIONAL_TEXT_ARRAY_SCHEMA,
  exampleSentenceEn: OPTIONAL_TEXT_SCHEMA,
  exampleSentenceJa: OPTIONAL_TEXT_SCHEMA,
});

export const UpdateQuestionRequestSchema = z.object({
  questionId: z.string().min(1, "questionIdが指定されていません。"),
  unitId: z.string().min(1, "unitIdが指定されていません。"),
  japanese: z.string().trim().min(1, "日本語を入力してください。"),
  prompt: OPTIONAL_TEXT_SCHEMA,
  hint: OPTIONAL_TEXT_SCHEMA,
  explanation: OPTIONAL_TEXT_SCHEMA,
  order: z.number().int().positive().optional(),
  correctAnswers: z
    .array(z.string().trim().min(1, "英語正解は1文字以上で入力してください。"))
    .min(1, "英語の正解を1つ以上入力してください。"),
  vocabulary: VocabularyUpdateSchema.optional(),
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

export const DeleteMaterialRequestSchema = z.object({
  materialId: z.string().min(1, "materialIdが指定されていません。"),
});

export type DeleteMaterialRequest = z.infer<typeof DeleteMaterialRequestSchema>;

export const DeleteUnitRequestSchema = z.object({
  unitId: z.string().min(1, "unitIdが指定されていません。"),
});

export type DeleteUnitRequest = z.infer<typeof DeleteUnitRequestSchema>;
