import type { VocabularyEntry } from "../entities/VocabularyEntry";

export interface VocabularyEntryRepository {
  findById(id: string): Promise<VocabularyEntry | null>;
  findByMaterialId(materialId: string): Promise<VocabularyEntry[]>;
  findByHeadword(materialId: string, headword: string): Promise<VocabularyEntry | null>;
  save(entry: VocabularyEntry): Promise<VocabularyEntry>;
  delete(id: string): Promise<void>;
}
