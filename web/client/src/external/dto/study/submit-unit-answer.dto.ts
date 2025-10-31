import { z } from "zod";

export const StudyModeSchema = z.enum([
  "jp_to_en",
  "en_to_jp",
  "sentence",
  "default",
]);

export type StudyMode = z.infer<typeof StudyModeSchema>;

const QuestionStatisticsPayloadSchema = z.object({
  totalAttempts: z.number().int().nonnegative(),
  correctCount: z.number().int().nonnegative(),
  incorrectCount: z.number().int().nonnegative(),
  accuracy: z.number().min(0).max(1),
  lastAttemptedAt: z.string().nullable(),
});

const QuestionModeStatisticsSchema = z
  .object({
    jp_to_en: QuestionStatisticsPayloadSchema.optional(),
    en_to_jp: QuestionStatisticsPayloadSchema.optional(),
    sentence: QuestionStatisticsPayloadSchema.optional(),
    default: QuestionStatisticsPayloadSchema.optional(),
  })
  .partial()
  .transform((value) => {
    const entries = Object.entries(value).filter(
      ([, stats]) => stats !== undefined,
    ) as Array<[StudyMode, z.infer<typeof QuestionStatisticsPayloadSchema>]>;

    if (entries.length === 0) {
      return undefined;
    }

    const record: Record<
      StudyMode,
      z.infer<typeof QuestionStatisticsPayloadSchema>
    > = {} as Record<
      StudyMode,
      z.infer<typeof QuestionStatisticsPayloadSchema>
    >;

    for (const [mode, stats] of entries) {
      record[mode] = stats;
    }

    return record;
  });

export const SubmitUnitAnswerRequestSchema = z.object({
  unitId: z.uuid(),
  questionId: z.uuid(),
  answerText: z.string().min(1),
  mode: StudyModeSchema,
});

export type SubmitUnitAnswerRequest = z.infer<
  typeof SubmitUnitAnswerRequestSchema
>;

export const SubmitUnitAnswerResponseSchema = z.object({
  isCorrect: z.boolean(),
  statistics: QuestionStatisticsPayloadSchema,
  modeStatistics: QuestionModeStatisticsSchema.optional(),
});

export type SubmitUnitAnswerResponse = z.infer<
  typeof SubmitUnitAnswerResponseSchema
>;
