import type { VocabularyRelation } from "../entities/VocabularyRelation";

export interface VocabularyRelationRepository {
  findByEntryId(entryId: string): Promise<VocabularyRelation[]>;
  saveMany(relations: VocabularyRelation[]): Promise<VocabularyRelation[]>;
  deleteByEntryId(entryId: string): Promise<void>;
}
