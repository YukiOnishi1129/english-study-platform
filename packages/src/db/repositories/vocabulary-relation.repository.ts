import {
  VocabularyRelation as DomainVocabularyRelation,
  type VocabularyRelationRepository,
} from "@acme/shared/domain";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { eq, sql } from "drizzle-orm";
import { db } from "../client";
import { vocabularyRelations } from "../schema/vocabulary-relations";

export type VocabularyRelation = InferSelectModel<typeof vocabularyRelations>;
export type NewVocabularyRelation = InferInsertModel<typeof vocabularyRelations>;

export class VocabularyRelationRepositoryImpl implements VocabularyRelationRepository {
  async findByEntryId(entryId: string): Promise<DomainVocabularyRelation[]> {
    const rows = await db
      .select()
      .from(vocabularyRelations)
      .where(eq(vocabularyRelations.vocabularyEntryId, entryId));

    return rows.map(this.toDomain);
  }

  async saveMany(relations: DomainVocabularyRelation[]): Promise<DomainVocabularyRelation[]> {
    if (relations.length === 0) {
      return [];
    }

    const rows = await db
      .insert(vocabularyRelations)
      .values(
        relations.map((relation) => ({
          id: relation.id,
          vocabularyEntryId: relation.vocabularyEntryId,
          relationType: relation.relationType,
          relatedText: relation.relatedText,
          note: relation.note ?? null,
          createdAt: relation.createdAt,
          updatedAt: relation.updatedAt,
        })),
      )
      .onConflictDoUpdate({
        target: vocabularyRelations.id,
        set: {
          relationType: sql`excluded.relation_type`,
          relatedText: sql`excluded.related_text`,
          note: sql`excluded.note`,
          updatedAt: sql`now()`,
        },
      })
      .returning();

    return rows.map(this.toDomain);
  }

  async deleteByEntryId(entryId: string): Promise<void> {
    await db.delete(vocabularyRelations).where(eq(vocabularyRelations.vocabularyEntryId, entryId));
  }

  private toDomain = (row: VocabularyRelation): DomainVocabularyRelation =>
    new DomainVocabularyRelation({
      id: row.id,
      vocabularyEntryId: row.vocabularyEntryId,
      relationType: row.relationType as DomainVocabularyRelation["relationType"],
      relatedText: row.relatedText,
      note: row.note ?? undefined,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
}
