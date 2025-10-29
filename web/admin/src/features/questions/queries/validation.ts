import { z } from "zod";
import type { QuestionDetailDto } from "@/external/dto/material/material.query.dto";
import {
  unitDetailChapterSchema,
  unitDetailMaterialSchema,
  unitDetailQuestionSchema,
  unitDetailUnitSchema,
} from "@/features/units/queries/validation";

const vocabularyRelationSchema = z.object({
  id: z.string(),
  vocabularyEntryId: z.string(),
  relationType: z.enum(["synonym", "antonym", "related"]),
  relatedText: z.string(),
  note: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const vocabularyEntrySchema = z.object({
  id: z.string(),
  materialId: z.string(),
  headword: z.string(),
  pronunciation: z.string().nullable(),
  partOfSpeech: z.string().nullable(),
  definitionJa: z.string(),
  memo: z.string().nullable(),
  exampleSentenceEn: z.string().nullable(),
  exampleSentenceJa: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  relations: z.array(vocabularyRelationSchema),
});

const questionDetailSchema: z.ZodType<QuestionDetailDto> = z.object({
  material: unitDetailMaterialSchema,
  chapterPath: z.array(unitDetailChapterSchema),
  unit: unitDetailUnitSchema,
  question: unitDetailQuestionSchema,
  vocabularyEntry: vocabularyEntrySchema.nullable(),
});

export function ensureQuestionDetail(data: unknown) {
  return questionDetailSchema.parse(data);
}
