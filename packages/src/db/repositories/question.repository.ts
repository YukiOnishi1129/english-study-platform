import { Question as DomainQuestion, type QuestionRepository } from "@acme/shared/domain";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { eq, inArray, sql } from "drizzle-orm";
import { db } from "../client";
import { questions } from "../schema/questions";

export type Question = InferSelectModel<typeof questions>;
export type NewQuestion = InferInsertModel<typeof questions>;

// DDD Repository implementation
export class QuestionRepositoryImpl implements QuestionRepository {
  async findById(id: string): Promise<DomainQuestion | null> {
    const result = await db.select().from(questions).where(eq(questions.id, id)).limit(1);
    const data = result[0];

    if (!data) {
      return null;
    }

    return this.toDomain(data);
  }

  async findByUnitId(unitId: string): Promise<DomainQuestion[]> {
    const results = await db
      .select()
      .from(questions)
      .where(eq(questions.unitId, unitId))
      .orderBy(questions.order);

    return results.map(this.toDomain);
  }

  async findByUnitIds(unitIds: string[]): Promise<DomainQuestion[]> {
    if (unitIds.length === 0) {
      return [];
    }

    const results = await db
      .select()
      .from(questions)
      .where(inArray(questions.unitId, unitIds))
      .orderBy(questions.unitId, questions.order);

    return results.map(this.toDomain);
  }

  async findByIds(ids: string[]): Promise<DomainQuestion[]> {
    if (ids.length === 0) {
      return [];
    }

    const results = await db.select().from(questions).where(inArray(questions.id, ids));

    return results.map(this.toDomain);
  }

  async findByContentTypeId(contentTypeId: string): Promise<DomainQuestion[]> {
    const results = await db
      .select()
      .from(questions)
      .where(eq(questions.contentTypeId, contentTypeId))
      .orderBy(questions.order);

    return results.map(this.toDomain);
  }

  async findByVocabularyEntryId(entryId: string): Promise<DomainQuestion[]> {
    const results = await db
      .select()
      .from(questions)
      .where(eq(questions.vocabularyEntryId, entryId))
      .orderBy(questions.order);

    return results.map(this.toDomain);
  }

  async findFirstByCreatedAt(): Promise<DomainQuestion | null> {
    const [row] = await db.select().from(questions).orderBy(questions.createdAt).limit(1);

    if (!row) {
      return null;
    }

    return this.toDomain(row);
  }

  async save(question: DomainQuestion): Promise<DomainQuestion> {
    const [result] = await db
      .insert(questions)
      .values({
        id: question.id,
        unitId: question.unitId,
        contentTypeId: question.contentTypeId,
        questionVariant: question.variant,
        japanese: question.japanese ?? null,
        annotation: question.annotation ?? null,
        prompt: question.prompt ?? null,
        hint: question.hint ?? null,
        explanation: question.explanation ?? null,
        vocabularyEntryId: question.vocabularyEntryId ?? null,
        order: question.order,
        createdAt: question.createdAt,
        updatedAt: question.updatedAt,
      })
      .onConflictDoUpdate({
        target: questions.id,
        set: {
          contentTypeId: question.contentTypeId,
          questionVariant: question.variant,
          japanese: question.japanese ?? null,
          annotation: question.annotation ?? null,
          prompt: question.prompt ?? null,
          hint: question.hint ?? null,
          explanation: question.explanation ?? null,
          vocabularyEntryId: question.vocabularyEntryId ?? null,
          order: question.order,
          updatedAt: new Date(),
        },
      })
      .returning();

    if (!result) {
      throw new Error("Failed to save question");
    }

    return this.toDomain(result);
  }

  async delete(id: string): Promise<void> {
    await db.delete(questions).where(eq(questions.id, id));
  }

  async deleteByUnitId(unitId: string): Promise<void> {
    await db.delete(questions).where(eq(questions.unitId, unitId));
  }

  async countByUnitIds(unitIds: string[]): Promise<Record<string, number>> {
    if (unitIds.length === 0) {
      return {};
    }

    const counts = await db
      .select({
        unitId: questions.unitId,
        count: sql<number>`count(*)`.as("count"),
      })
      .from(questions)
      .where(inArray(questions.unitId, unitIds))
      .groupBy(questions.unitId);

    const map: Record<string, number> = {};
    counts.forEach((row) => {
      map[row.unitId] = Number(row.count);
    });
    unitIds.forEach((id) => {
      if (map[id] === undefined) {
        map[id] = 0;
      }
    });
    return map;
  }

  private toDomain = (data: Question): DomainQuestion =>
    new DomainQuestion({
      id: data.id,
      unitId: data.unitId,
      contentTypeId: data.contentTypeId,
      variant: data.questionVariant as DomainQuestion["variant"],
      japanese: data.japanese ?? undefined,
      annotation: data.annotation ?? undefined,
      prompt: data.prompt ?? undefined,
      hint: data.hint ?? undefined,
      explanation: data.explanation ?? undefined,
      vocabularyEntryId: data.vocabularyEntryId ?? undefined,
      order: data.order,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
}
