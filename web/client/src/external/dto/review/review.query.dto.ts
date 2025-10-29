import { z } from "zod";

export const GetReviewDataRequestSchema = z.object({
  accountId: z.uuid(),
  materialId: z.uuid().optional(),
});

export type GetReviewDataRequest = z.infer<typeof GetReviewDataRequestSchema>;

export const ReviewQuestionSchema = z.object({
  questionId: z.string().min(1),
  unitId: z.string().min(1),
  unitName: z.string().min(1),
  unitOrder: z.number().int().nonnegative(),
  questionOrder: z.number().int().nonnegative(),
  japanese: z.string().min(1),
  totalAttempts: z.number().int().nonnegative(),
  correctCount: z.number().int().nonnegative(),
  incorrectCount: z.number().int().nonnegative(),
  accuracy: z.number().min(0).max(1).nullable(),
  lastAttemptedAt: z.date().nullable(),
});

export type ReviewQuestionDto = z.infer<typeof ReviewQuestionSchema>;

export const ReviewMaterialSummarySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  totalQuestionCount: z.number().int().nonnegative(),
  weakCount: z.number().int().nonnegative(),
  lowAttemptCount: z.number().int().nonnegative(),
  unattemptedCount: z.number().int().nonnegative(),
});

export type ReviewMaterialSummaryDto = z.infer<
  typeof ReviewMaterialSummarySchema
>;

export const ReviewDataSchema = z.object({
  materials: z.array(ReviewMaterialSummarySchema),
  selectedMaterialId: z.string().nullable(),
  groups: z.object({
    weak: z.array(ReviewQuestionSchema),
    lowAttempts: z.array(ReviewQuestionSchema),
    unattempted: z.array(ReviewQuestionSchema),
  }),
  thresholds: z.object({
    weakAccuracy: z.number().min(0).max(1),
    lowAttempt: z.number().int().nonnegative(),
  }),
});

export type ReviewDataDto = z.infer<typeof ReviewDataSchema>;
