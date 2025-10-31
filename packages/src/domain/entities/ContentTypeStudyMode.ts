import crypto from "node:crypto";

export interface ContentTypeStudyModeParams {
  id?: string;
  contentTypeId: string;
  studyModeId: string;
  priority?: number;
  isDefault?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class ContentTypeStudyMode {
  public readonly id: string;
  public readonly contentTypeId: string;
  public readonly studyModeId: string;
  public readonly priority: number;
  public readonly isDefault: boolean;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(params: ContentTypeStudyModeParams) {
    this.id = params.id ?? crypto.randomUUID();
    this.contentTypeId = params.contentTypeId;
    this.studyModeId = params.studyModeId;
    this.priority = params.priority ?? 0;
    this.isDefault = params.isDefault ?? false;
    this.createdAt = params.createdAt ?? new Date();
    this.updatedAt = params.updatedAt ?? new Date();
  }

  static create(
    params: Omit<ContentTypeStudyModeParams, "id" | "createdAt" | "updatedAt">,
  ): ContentTypeStudyMode {
    return new ContentTypeStudyMode({
      ...params,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
}

