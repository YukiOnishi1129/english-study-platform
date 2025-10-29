import { z } from "zod";

export const NextStudyTargetSchema = z.object({
  unitId: z.string().min(1),
  questionId: z.string().min(1),
});

export type NextStudyTargetDto = z.infer<typeof NextStudyTargetSchema>;
