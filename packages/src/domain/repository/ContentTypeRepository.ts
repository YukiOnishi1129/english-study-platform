import type { ContentType } from "../entities/ContentType";
import type { ContentTypeCode } from "../value-objects";

export interface ContentTypeRepository {
  findById(id: string): Promise<ContentType | null>;
  findByCode(code: ContentTypeCode): Promise<ContentType | null>;
  findAll(): Promise<ContentType[]>;
  save(contentType: ContentType): Promise<ContentType>;
}
