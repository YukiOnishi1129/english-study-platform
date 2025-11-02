import { z } from "zod";
import { StudyModeSchema } from "@/external/dto/study/submit-unit-answer.dto";
import { ReviewQuestionSchema } from "./review.query.dto";

export const GetReviewSessionDataRequestSchema = z.object({
  materialId: z.uuid(),
  group: z.enum(["weak", "lowAttempts", "unattempted"]),
});

export type GetReviewSessionDataRequest = z.infer<
  typeof GetReviewSessionDataRequestSchema
>;

export const ReviewSessionQuestionSchema = ReviewQuestionSchema.extend({
  hint: z.string().nullable(),
  explanation: z.string().nullable(),
  acceptableAnswers: z.array(z.string()),
  mode: StudyModeSchema,
  prompt: z.string(),
  promptNote: z.string().nullable(),
  answerLanguage: z.enum(["en", "ja"]),
  answerLabel: z.string(),
  answerPlaceholder: z.string().nullable(),
  vocabularyPartOfSpeech: z.string().nullable(),
  vocabularyPronunciation: z.string().nullable(),
  sentencePromptJa: z.string().nullable(),
  sentenceTargetWord: z.string().nullable(),
});

export type ReviewSessionQuestionDto = z.infer<
  typeof ReviewSessionQuestionSchema
>;

export const ReviewSessionDataSchema = z.object({
  material: z.object({
    id: z.string().min(1),
    name: z.string().min(1),
  }),
  group: z.enum(["weak", "lowAttempts", "unattempted"]),
  questions: z.array(ReviewSessionQuestionSchema),
});

export type ReviewSessionDataDto = z.infer<typeof ReviewSessionDataSchema>;
