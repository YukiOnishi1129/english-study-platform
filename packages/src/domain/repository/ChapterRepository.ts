import type { Chapter } from "../entities/Chapter";

export interface ChapterRepository {
  findById(id: string): Promise<Chapter | null>;
  findByMaterialId(materialId: string): Promise<Chapter[]>;
  findByParentId(parentId: string | null): Promise<Chapter[]>;
  save(chapter: Chapter): Promise<Chapter>;
  delete(id: string): Promise<void>;
}
