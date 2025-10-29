import {
  VocabularyEntry as DomainVocabularyEntry,
  type VocabularyEntryRepository,
} from "@acme/shared/domain";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { and, eq } from "drizzle-orm";
import { db } from "../client";
import { vocabularyEntries } from "../schema/vocabulary-entries";

export type VocabularyEntry = InferSelectModel<typeof vocabularyEntries>;
export type NewVocabularyEntry = InferInsertModel<typeof vocabularyEntries>;

export class VocabularyEntryRepositoryImpl implements VocabularyEntryRepository {
  async findById(id: string): Promise<DomainVocabularyEntry | null> {
    const [row] = await db.select().from(vocabularyEntries).where(eq(vocabularyEntries.id, id));

    if (!row) {
      return null;
    }

    return this.toDomain(row);
  }

  async findByMaterialId(materialId: string): Promise<DomainVocabularyEntry[]> {
    const rows = await db
      .select()
      .from(vocabularyEntries)
      .where(eq(vocabularyEntries.materialId, materialId))
      .orderBy(vocabularyEntries.headword);

    return rows.map(this.toDomain);
  }

  async findByHeadword(
    materialId: string,
    headword: string,
  ): Promise<DomainVocabularyEntry | null> {
    const [row] = await db
      .select()
      .from(vocabularyEntries)
      .where(
        and(eq(vocabularyEntries.materialId, materialId), eq(vocabularyEntries.headword, headword)),
      )
      .limit(1);

    if (!row) {
      return null;
    }

    return this.toDomain(row);
  }

  async save(entry: DomainVocabularyEntry): Promise<DomainVocabularyEntry> {
    const [row] = await db
      .insert(vocabularyEntries)
      .values({
        id: entry.id,
        materialId: entry.materialId,
        headword: entry.headword,
        pronunciation: entry.pronunciation ?? null,
        partOfSpeech: entry.partOfSpeech ?? null,
        definitionJa: entry.definitionJa,
        memo: entry.memo ?? null,
        exampleSentenceEn: entry.exampleSentenceEn ?? null,
        exampleSentenceJa: entry.exampleSentenceJa ?? null,
        createdAt: entry.createdAt,
        updatedAt: entry.updatedAt,
      })
      .onConflictDoUpdate({
        target: vocabularyEntries.id,
        set: {
          headword: entry.headword,
          pronunciation: entry.pronunciation ?? null,
          partOfSpeech: entry.partOfSpeech ?? null,
          definitionJa: entry.definitionJa,
          memo: entry.memo ?? null,
          exampleSentenceEn: entry.exampleSentenceEn ?? null,
          exampleSentenceJa: entry.exampleSentenceJa ?? null,
          updatedAt: new Date(),
        },
      })
      .returning();

    if (!row) {
      throw new Error("Failed to save vocabulary entry");
    }

    return this.toDomain(row);
  }

  async delete(id: string): Promise<void> {
    await db.delete(vocabularyEntries).where(eq(vocabularyEntries.id, id));
  }

  private toDomain = (row: VocabularyEntry): DomainVocabularyEntry =>
    new DomainVocabularyEntry({
      id: row.id,
      materialId: row.materialId,
      headword: row.headword,
      pronunciation: row.pronunciation ?? undefined,
      partOfSpeech: row.partOfSpeech ?? undefined,
      definitionJa: row.definitionJa,
      memo: row.memo ?? undefined,
      exampleSentenceEn: row.exampleSentenceEn ?? undefined,
      exampleSentenceJa: row.exampleSentenceJa ?? undefined,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
}
