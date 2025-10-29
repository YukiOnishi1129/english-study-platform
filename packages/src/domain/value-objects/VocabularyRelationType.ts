export const VOCABULARY_RELATION_TYPES = ["synonym", "antonym", "related"] as const;

export type VocabularyRelationType = (typeof VOCABULARY_RELATION_TYPES)[number];
