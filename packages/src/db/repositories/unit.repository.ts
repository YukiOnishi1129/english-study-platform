import { Unit as DomainUnit, type UnitRepository } from "@acme/shared/domain";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { and, eq } from "drizzle-orm";
import { db } from "../client";
import { units } from "../schema/units";

export type Unit = InferSelectModel<typeof units>;
export type NewUnit = InferInsertModel<typeof units>;

// DDD Repository implementation
export class UnitRepositoryImpl implements UnitRepository {
  async findById(id: string): Promise<DomainUnit | null> {
    const result = await db.select().from(units).where(eq(units.id, id)).limit(1);
    const data = result[0];

    if (!data) {
      return null;
    }

    return new DomainUnit({
      id: data.id,
      chapterId: data.chapterId,
      contentTypeId: data.contentTypeId,
      name: data.name,
      description: data.description ?? undefined,
      order: data.order,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }

  async findByChapterId(chapterId: string): Promise<DomainUnit[]> {
    const results = await db
      .select()
      .from(units)
      .where(eq(units.chapterId, chapterId))
      .orderBy(units.order);

    return results.map(
      (data) =>
        new DomainUnit({
          id: data.id,
          chapterId: data.chapterId,
          contentTypeId: data.contentTypeId,
          name: data.name,
          description: data.description ?? undefined,
          order: data.order,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        }),
    );
  }

  async save(unit: DomainUnit): Promise<DomainUnit> {
    const [result] = await db
      .insert(units)
      .values({
        id: unit.id,
        chapterId: unit.chapterId,
        contentTypeId: unit.contentTypeId,
        name: unit.name,
        description: unit.description ?? null,
        order: unit.order,
        createdAt: unit.createdAt,
        updatedAt: unit.updatedAt,
      })
      .onConflictDoUpdate({
        target: units.id,
        set: {
          name: unit.name,
          description: unit.description ?? null,
          order: unit.order,
          contentTypeId: unit.contentTypeId,
          updatedAt: new Date(),
        },
      })
      .returning();

    if (!result) {
      throw new Error("Failed to save unit");
    }

    return new DomainUnit({
      id: result.id,
      chapterId: result.chapterId,
      contentTypeId: result.contentTypeId,
      name: result.name,
      description: result.description ?? undefined,
      order: result.order,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    });
  }

  async delete(id: string): Promise<void> {
    await db.delete(units).where(eq(units.id, id));
  }

  async updateOrders(
    chapterId: string,
    updates: Array<{ id: string; order: number }>,
  ): Promise<void> {
    await db.transaction(async (tx) => {
      const now = new Date();

      for (const update of updates) {
        await tx
          .update(units)
          .set({
            order: update.order,
            updatedAt: now,
          })
          .where(and(eq(units.id, update.id), eq(units.chapterId, chapterId)));
      }
    });
  }
}
