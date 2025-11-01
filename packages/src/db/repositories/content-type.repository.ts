import {
  type ContentTypeCode,
  type ContentTypeRepository,
  ContentType as DomainContentType,
} from "@acme/shared/domain";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { eq } from "drizzle-orm";

import { db } from "../client";
import { contentTypes } from "../schema/content-types";

export type ContentTypeRow = InferSelectModel<typeof contentTypes>;
export type NewContentType = InferInsertModel<typeof contentTypes>;

export class ContentTypeRepositoryImpl implements ContentTypeRepository {
  async findById(id: string): Promise<DomainContentType | null> {
    const [row] = await db.select().from(contentTypes).where(eq(contentTypes.id, id)).limit(1);

    if (!row) {
      return null;
    }

    return this.toDomain(row);
  }

  async findByCode(code: ContentTypeCode): Promise<DomainContentType | null> {
    const [row] = await db.select().from(contentTypes).where(eq(contentTypes.code, code)).limit(1);

    if (!row) {
      return null;
    }

    return this.toDomain(row);
  }

  async findAll(): Promise<DomainContentType[]> {
    const rows = await db.select().from(contentTypes).orderBy(contentTypes.code);

    return rows.map(this.toDomain);
  }

  async save(contentType: DomainContentType): Promise<DomainContentType> {
    const [row] = await db
      .insert(contentTypes)
      .values({
        id: contentType.id,
        code: contentType.code,
        name: contentType.name,
        description: contentType.description ?? null,
        createdAt: contentType.createdAt,
        updatedAt: contentType.updatedAt,
      })
      .onConflictDoUpdate({
        target: contentTypes.id,
        set: {
          code: contentType.code,
          name: contentType.name,
          description: contentType.description ?? null,
          updatedAt: new Date(),
        },
      })
      .returning();

    if (!row) {
      throw new Error("Failed to save content type");
    }

    return this.toDomain(row);
  }

  private toDomain = (row: ContentTypeRow): DomainContentType =>
    new DomainContentType({
      id: row.id,
      code: row.code as ContentTypeCode,
      name: row.name,
      description: row.description ?? undefined,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
}
