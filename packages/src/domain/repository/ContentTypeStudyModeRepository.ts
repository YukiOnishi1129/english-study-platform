import type { ContentTypeStudyMode } from "../entities/ContentTypeStudyMode";

export interface ContentTypeStudyModeRepository {
  findByContentTypeId(contentTypeId: string): Promise<ContentTypeStudyMode[]>;
  findByStudyModeId(studyModeId: string): Promise<ContentTypeStudyMode[]>;
  findDefaultByContentTypeId(contentTypeId: string): Promise<ContentTypeStudyMode | null>;
  save(mapping: ContentTypeStudyMode): Promise<ContentTypeStudyMode>;
  deleteByContentTypeId(contentTypeId: string): Promise<void>;
}
