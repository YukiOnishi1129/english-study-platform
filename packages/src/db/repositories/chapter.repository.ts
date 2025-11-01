import { type ChapterRepository, Chapter as DomainChapter } from "@acme/shared/domain";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { eq, isNull } from "drizzle-orm";
import { db } from "../client";
import { chapters } from "../schema/chapters";

export type Chapter = InferSelectModel<typeof chapters>;
export type NewChapter = InferInsertModel<typeof chapters>;

// DDD Repository implementation
export class ChapterRepositoryImpl implements ChapterRepository {
  async findById(id: string): Promise<DomainChapter | null> {
    const result = await db.select().from(chapters).where(eq(chapters.id, id)).limit(1);
    const data = result[0];

    if (!data) {
      return null;
    }

    return new DomainChapter({
      id: data.id,
      materialId: data.materialId,
      parentChapterId: data.parentChapterId ?? undefined,
      name: data.name,
      description: data.description ?? undefined,
      order: data.order,
      level: data.level,
      contentTypeId: data.contentTypeId,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }

  async findByMaterialId(materialId: string): Promise<DomainChapter[]> {
    const results = await db
      .select()
      .from(chapters)
      .where(eq(chapters.materialId, materialId))
      .orderBy(chapters.order);

    return results.map(
      (data) =>
        new DomainChapter({
          id: data.id,
          materialId: data.materialId,
          parentChapterId: data.parentChapterId ?? undefined,
          name: data.name,
          description: data.description ?? undefined,
          order: data.order,
          level: data.level,
          contentTypeId: data.contentTypeId,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        }),
    );
  }

  async findByParentId(parentId: string | null): Promise<DomainChapter[]> {
    const condition = parentId
      ? eq(chapters.parentChapterId, parentId)
      : isNull(chapters.parentChapterId);

    const results = await db.select().from(chapters).where(condition).orderBy(chapters.order);

    return results.map(
      (data) =>
        new DomainChapter({
          id: data.id,
          materialId: data.materialId,
          parentChapterId: data.parentChapterId ?? undefined,
          name: data.name,
          description: data.description ?? undefined,
          order: data.order,
          level: data.level,
          contentTypeId: data.contentTypeId,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        }),
    );
  }

  async save(chapter: DomainChapter): Promise<DomainChapter> {
    const [result] = await db
      .insert(chapters)
      .values({
        id: chapter.id,
        materialId: chapter.materialId,
        parentChapterId: chapter.parentChapterId ?? null,
        name: chapter.name,
        description: chapter.description ?? null,
        order: chapter.order,
        level: chapter.level,
        contentTypeId: chapter.contentTypeId,
        createdAt: chapter.createdAt,
        updatedAt: chapter.updatedAt,
      })
      .onConflictDoUpdate({
        target: chapters.id,
        set: {
          name: chapter.name,
          description: chapter.description ?? null,
          order: chapter.order,
          level: chapter.level,
          contentTypeId: chapter.contentTypeId,
          updatedAt: new Date(),
        },
      })
      .returning();

    if (!result) {
      throw new Error("Failed to save chapter");
    }

    return new DomainChapter({
      id: result.id,
      materialId: result.materialId,
      parentChapterId: result.parentChapterId ?? undefined,
      name: result.name,
      description: result.description ?? undefined,
      order: result.order,
      level: result.level,
      contentTypeId: result.contentTypeId,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    });
  }

  async delete(id: string): Promise<void> {
    await db.delete(chapters).where(eq(chapters.id, id));
  }
}
