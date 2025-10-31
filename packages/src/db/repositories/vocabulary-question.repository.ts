import {
  VocabularyQuestion as DomainVocabularyQuestion,
  type VocabularyQuestionRepository,
} from "@acme/shared/domain";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { eq, inArray } from "drizzle-orm";

import { db } from "../client";
import { vocabularyQuestions } from "../schema/vocabulary-questions";

export type VocabularyQuestionRow = InferSelectModel<typeof vocabularyQuestions>;
export type NewVocabularyQuestion = InferInsertModel<typeof vocabularyQuestions>;

export class VocabularyQuestionRepositoryImpl implements VocabularyQuestionRepository {
  async findByQuestionId(questionId: string): Promise<DomainVocabularyQuestion | null> {
    const [row] = await db
      .select()
      .from(vocabularyQuestions)
      .where(eq(vocabularyQuestions.questionId, questionId))
      .limit(1);

    if (!row) {
      return null;
    }

    return this.toDomain(row);
  }

  async findByQuestionIds(
    questionIds: string[],
  ): Promise<Record<string, DomainVocabularyQuestion>> {
    if (questionIds.length === 0) {
      return {};
    }

    const rows = await db
      .select()
      .from(vocabularyQuestions)
      .where(inArray(vocabularyQuestions.questionId, questionIds));

    return rows.reduce<Record<string, DomainVocabularyQuestion>>((acc, row) => {
      acc[row.questionId] = this.toDomain(row);
      return acc;
    }, {});
  }

  async save(question: DomainVocabularyQuestion): Promise<DomainVocabularyQuestion> {
    const [row] = await db
      .insert(vocabularyQuestions)
      .values({
        questionId: question.questionId,
        vocabularyEntryId: question.vocabularyEntryId ?? null,
        headword: question.headword,
        pronunciation: question.pronunciation ?? null,
        partOfSpeech: question.partOfSpeech ?? null,
        definitionJa: question.definitionJa,
        memo: question.memo ?? null,
        exampleSentenceEn: question.exampleSentenceEn ?? null,
        exampleSentenceJa: question.exampleSentenceJa ?? null,
      })
      .onConflictDoUpdate({
        target: vocabularyQuestions.questionId,
        set: {
          vocabularyEntryId: question.vocabularyEntryId ?? null,
          headword: question.headword,
          pronunciation: question.pronunciation ?? null,
          partOfSpeech: question.partOfSpeech ?? null,
          definitionJa: question.definitionJa,
          memo: question.memo ?? null,
          exampleSentenceEn: question.exampleSentenceEn ?? null,
          exampleSentenceJa: question.exampleSentenceJa ?? null,
        },
      })
      .returning();

    if (!row) {
      throw new Error("Failed to save vocabulary question");
    }

    return this.toDomain(row);
  }

  async delete(questionId: string): Promise<void> {
    await db.delete(vocabularyQuestions).where(eq(vocabularyQuestions.questionId, questionId));
  }

  private toDomain = (row: VocabularyQuestionRow): DomainVocabularyQuestion =>
    new DomainVocabularyQuestion({
      questionId: row.questionId,
      vocabularyEntryId: row.vocabularyEntryId ?? undefined,
      headword: row.headword,
      pronunciation: row.pronunciation ?? undefined,
      partOfSpeech: row.partOfSpeech ?? undefined,
      definitionJa: row.definitionJa,
      memo: row.memo ?? undefined,
      exampleSentenceEn: row.exampleSentenceEn ?? undefined,
      exampleSentenceJa: row.exampleSentenceJa ?? undefined,
      relations: [],
    });
}
