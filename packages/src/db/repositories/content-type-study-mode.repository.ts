import {
  type ContentTypeStudyModeRepository,
  ContentTypeStudyMode as DomainContentTypeStudyMode,
} from "@acme/shared/domain";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { and, eq } from "drizzle-orm";

import { db } from "../client";
import { contentTypeStudyModes } from "../schema/content-type-study-modes";

export type ContentTypeStudyModeRow = InferSelectModel<typeof contentTypeStudyModes>;
export type NewContentTypeStudyMode = InferInsertModel<typeof contentTypeStudyModes>;

export class ContentTypeStudyModeRepositoryImpl implements ContentTypeStudyModeRepository {
  async findByContentTypeId(contentTypeId: string): Promise<DomainContentTypeStudyMode[]> {
    const rows = await db
      .select()
      .from(contentTypeStudyModes)
      .where(eq(contentTypeStudyModes.contentTypeId, contentTypeId))
      .orderBy(contentTypeStudyModes.priority);

    return rows.map(this.toDomain);
  }

  async findByStudyModeId(studyModeId: string): Promise<DomainContentTypeStudyMode[]> {
    const rows = await db
      .select()
      .from(contentTypeStudyModes)
      .where(eq(contentTypeStudyModes.studyModeId, studyModeId))
      .orderBy(contentTypeStudyModes.priority);

    return rows.map(this.toDomain);
  }

  async findDefaultByContentTypeId(
    contentTypeId: string,
  ): Promise<DomainContentTypeStudyMode | null> {
    const [row] = await db
      .select()
      .from(contentTypeStudyModes)
      .where(
        and(
          eq(contentTypeStudyModes.contentTypeId, contentTypeId),
          eq(contentTypeStudyModes.isDefault, true),
        ),
      )
      .orderBy(contentTypeStudyModes.priority)
      .limit(1);

    if (!row) {
      return null;
    }

    return this.toDomain(row);
  }

  async save(mapping: DomainContentTypeStudyMode): Promise<DomainContentTypeStudyMode> {
    const [row] = await db
      .insert(contentTypeStudyModes)
      .values({
        id: mapping.id,
        contentTypeId: mapping.contentTypeId,
        studyModeId: mapping.studyModeId,
        priority: mapping.priority,
        isDefault: mapping.isDefault,
        createdAt: mapping.createdAt,
        updatedAt: mapping.updatedAt,
      })
      .onConflictDoUpdate({
        target: contentTypeStudyModes.id,
        set: {
          contentTypeId: mapping.contentTypeId,
          studyModeId: mapping.studyModeId,
          priority: mapping.priority,
          isDefault: mapping.isDefault,
          updatedAt: new Date(),
        },
      })
      .returning();

    if (!row) {
      throw new Error("Failed to save content type study mode mapping");
    }

    return this.toDomain(row);
  }

  async deleteByContentTypeId(contentTypeId: string): Promise<void> {
    await db
      .delete(contentTypeStudyModes)
      .where(eq(contentTypeStudyModes.contentTypeId, contentTypeId));
  }

  private toDomain = (row: ContentTypeStudyModeRow): DomainContentTypeStudyMode =>
    new DomainContentTypeStudyMode({
      id: row.id,
      contentTypeId: row.contentTypeId,
      studyModeId: row.studyModeId,
      priority: row.priority,
      isDefault: row.isDefault,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
}
