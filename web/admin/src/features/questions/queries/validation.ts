import { z } from "zod";
import type { QuestionDetailDto } from "@/external/dto/material/material.query.dto";
import {
  unitDetailChapterSchema,
  unitDetailMaterialSchema,
  unitDetailQuestionSchema,
  unitDetailUnitSchema,
} from "@/features/units/queries/validation";

const questionDetailSchema: z.ZodType<QuestionDetailDto> = z.object({
  material: unitDetailMaterialSchema,
  chapterPath: z.array(unitDetailChapterSchema),
  unit: unitDetailUnitSchema,
  question: unitDetailQuestionSchema,
});

export function ensureQuestionDetail(data: unknown) {
  return questionDetailSchema.parse(data);
}
