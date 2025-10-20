import { Question as DomainQuestion, type QuestionRepository } from "@acme/shared/domain";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { eq } from "drizzle-orm";
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

    return new DomainQuestion({
      id: data.id,
      unitId: data.unitId,
      japanese: data.japanese,
      hint: data.hint ?? undefined,
      explanation: data.explanation ?? undefined,
      order: data.order,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }

  async findByUnitId(unitId: string): Promise<DomainQuestion[]> {
    const results = await db
      .select()
      .from(questions)
      .where(eq(questions.unitId, unitId))
      .orderBy(questions.order);

    return results.map(
      (data) =>
        new DomainQuestion({
          id: data.id,
          unitId: data.unitId,
          japanese: data.japanese,
          hint: data.hint ?? undefined,
          explanation: data.explanation ?? undefined,
          order: data.order,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        }),
    );
  }

  async save(question: DomainQuestion): Promise<DomainQuestion> {
    const [result] = await db
      .insert(questions)
      .values({
        id: question.id,
        unitId: question.unitId,
        japanese: question.japanese,
        hint: question.hint ?? null,
        explanation: question.explanation ?? null,
        order: question.order,
        createdAt: question.createdAt,
        updatedAt: question.updatedAt,
      })
      .onConflictDoUpdate({
        target: questions.id,
        set: {
          japanese: question.japanese,
          hint: question.hint ?? null,
          explanation: question.explanation ?? null,
          order: question.order,
          updatedAt: new Date(),
        },
      })
      .returning();

    if (!result) {
      throw new Error("Failed to save question");
    }

    return new DomainQuestion({
      id: result.id,
      unitId: result.unitId,
      japanese: result.japanese,
      hint: result.hint ?? undefined,
      explanation: result.explanation ?? undefined,
      order: result.order,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    });
  }

  async delete(id: string): Promise<void> {
    await db.delete(questions).where(eq(questions.id, id));
  }
}
