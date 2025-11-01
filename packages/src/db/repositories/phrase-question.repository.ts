import {
  PhraseQuestion as DomainPhraseQuestion,
  type PhraseQuestionRepository,
} from "@acme/shared/domain";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { eq, inArray } from "drizzle-orm";

import { db } from "../client";
import { phraseQuestions } from "../schema/phrase-questions";

export type PhraseQuestionRow = InferSelectModel<typeof phraseQuestions>;
export type NewPhraseQuestion = InferInsertModel<typeof phraseQuestions>;

export class PhraseQuestionRepositoryImpl implements PhraseQuestionRepository {
  async findByQuestionId(questionId: string): Promise<DomainPhraseQuestion | null> {
    const [row] = await db
      .select()
      .from(phraseQuestions)
      .where(eq(phraseQuestions.questionId, questionId))
      .limit(1);

    if (!row) {
      return null;
    }

    return this.toDomain(row);
  }

  async findByQuestionIds(questionIds: string[]): Promise<Record<string, DomainPhraseQuestion>> {
    if (questionIds.length === 0) {
      return {};
    }

    const rows = await db
      .select()
      .from(phraseQuestions)
      .where(inArray(phraseQuestions.questionId, questionIds));

    return rows.reduce<Record<string, DomainPhraseQuestion>>((acc, row) => {
      acc[row.questionId] = this.toDomain(row);
      return acc;
    }, {});
  }

  async save(question: DomainPhraseQuestion): Promise<DomainPhraseQuestion> {
    const [row] = await db
      .insert(phraseQuestions)
      .values({
        questionId: question.questionId,
        promptJa: question.promptJa,
        promptEn: question.promptEn ?? null,
        hint: question.hint ?? null,
        explanation: question.explanation ?? null,
        audioUrl: question.audioUrl ?? null,
      })
      .onConflictDoUpdate({
        target: phraseQuestions.questionId,
        set: {
          promptJa: question.promptJa,
          promptEn: question.promptEn ?? null,
          hint: question.hint ?? null,
          explanation: question.explanation ?? null,
          audioUrl: question.audioUrl ?? null,
        },
      })
      .returning();

    if (!row) {
      throw new Error("Failed to save phrase question");
    }

    return this.toDomain(row);
  }

  async delete(questionId: string): Promise<void> {
    await db.delete(phraseQuestions).where(eq(phraseQuestions.questionId, questionId));
  }

  private toDomain = (row: PhraseQuestionRow): DomainPhraseQuestion =>
    new DomainPhraseQuestion({
      questionId: row.questionId,
      promptJa: row.promptJa,
      promptEn: row.promptEn ?? undefined,
      hint: row.hint ?? undefined,
      explanation: row.explanation ?? undefined,
      audioUrl: row.audioUrl ?? undefined,
    });
}
