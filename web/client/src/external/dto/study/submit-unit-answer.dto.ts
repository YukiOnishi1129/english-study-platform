import { z } from "zod";

export const StudyModeSchema = z.enum([
  "jp_to_en",
  "en_to_jp",
  "sentence",
  "default",
]);

export type StudyMode = z.infer<typeof StudyModeSchema>;

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
  statistics: z.object({
    totalAttempts: z.number().int().nonnegative(),
    correctCount: z.number().int().nonnegative(),
    incorrectCount: z.number().int().nonnegative(),
    accuracy: z.number().min(0).max(1),
    lastAttemptedAt: z.string().nullable(),
  }),
});

export type SubmitUnitAnswerResponse = z.infer<
  typeof SubmitUnitAnswerResponseSchema
>;
