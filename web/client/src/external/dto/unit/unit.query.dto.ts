import { z } from "zod";

import { StudyModeSchema } from "@/external/dto/study/submit-unit-answer.dto";

export const GetUnitDetailRequestSchema = z.object({
  unitId: z.uuid(),
  accountId: z.uuid().optional().nullable(),
});

export type GetUnitDetailRequest = z.infer<typeof GetUnitDetailRequestSchema>;

export const UnitDetailCorrectAnswerSchema = z.object({
  id: z.string().min(1),
  answerText: z.string().min(1),
  order: z.number().int(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type UnitDetailCorrectAnswerDto = z.infer<
  typeof UnitDetailCorrectAnswerSchema
>;

export const UnitDetailVocabularySchema = z.object({
  id: z.string().min(1),
  headword: z.string().min(1),
  pronunciation: z.string().nullable(),
  partOfSpeech: z.string().nullable(),
  definitionJa: z.string().min(1),
  memo: z.string().nullable(),
  synonyms: z.array(z.string().min(1)),
  antonyms: z.array(z.string().min(1)),
  relatedWords: z.array(z.string().min(1)),
  exampleSentenceEn: z.string().nullable(),
  exampleSentenceJa: z.string().nullable(),
});

export type UnitDetailVocabularyDto = z.infer<
  typeof UnitDetailVocabularySchema
>;

export const UnitDetailQuestionSchema = z.object({
  id: z.string().min(1),
  unitId: z.string().min(1),
  japanese: z.string().min(1),
  prompt: z.string().nullable(),
  hint: z.string().nullable(),
  explanation: z.string().nullable(),
  questionType: z.string().min(1),
  vocabularyEntryId: z.string().nullable(),
  headword: z.string().nullable(),
  order: z.number().int(),
  createdAt: z.string(),
  updatedAt: z.string(),
  correctAnswers: z.array(UnitDetailCorrectAnswerSchema),
  vocabulary: UnitDetailVocabularySchema.nullable(),
  statistics: z
    .object({
      totalAttempts: z.number().int().nonnegative(),
      correctCount: z.number().int().nonnegative(),
      incorrectCount: z.number().int().nonnegative(),
      accuracy: z.number().min(0).max(1),
      lastAttemptedAt: z.string().nullable(),
    })
    .nullable(),
  modeStatistics: z
    .record(
      StudyModeSchema,
      z.object({
        totalAttempts: z.number().int().nonnegative(),
        correctCount: z.number().int().nonnegative(),
        incorrectCount: z.number().int().nonnegative(),
        accuracy: z.number().min(0).max(1),
        lastAttemptedAt: z.string().nullable(),
      }),
    )
    .optional(),
  vocabulary: UnitDetailVocabularySchema.nullable(),
});

export type UnitDetailQuestionDto = z.infer<typeof UnitDetailQuestionSchema>;

export const UnitDetailChapterSchema = z.object({
  id: z.string().min(1),
  materialId: z.string().min(1),
  parentChapterId: z.string().nullable(),
  name: z.string().min(1),
  description: z.string().nullable(),
  level: z.number().int(),
  order: z.number().int(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type UnitDetailChapterDto = z.infer<typeof UnitDetailChapterSchema>;

export const UnitDetailMaterialSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().nullable(),
  order: z.number().int(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type UnitDetailMaterialDto = z.infer<typeof UnitDetailMaterialSchema>;

export const UnitDetailUnitSchema = z.object({
  id: z.string().min(1),
  chapterId: z.string().min(1),
  name: z.string().min(1),
  description: z.string().nullable(),
  order: z.number().int(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type UnitDetailUnitDto = z.infer<typeof UnitDetailUnitSchema>;

export const UnitDetailSchema = z.object({
  material: UnitDetailMaterialSchema,
  chapterPath: z.array(UnitDetailChapterSchema),
  unit: UnitDetailUnitSchema,
  questions: z.array(UnitDetailQuestionSchema),
});

export type UnitDetailDto = z.infer<typeof UnitDetailSchema>;
