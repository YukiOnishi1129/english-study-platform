import { z } from "zod";

import { ReviewQuestionSchema } from "./review.query.dto";

export const ReviewSessionQuestionSchema = ReviewQuestionSchema.extend({
  hint: z.string().nullable(),
  explanation: z.string().nullable(),
  acceptableAnswers: z.array(z.string()),
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
