import crypto from "node:crypto";

export interface ChapterParams {
  id?: string;
  materialId: string;
  parentChapterId?: string;
  name: string;
  description?: string;
  order: number;
  level: number;
  contentTypeId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Chapter {
  public readonly id: string;
  public readonly materialId: string;
  public readonly parentChapterId?: string;
  public readonly name: string;
  public readonly description?: string;
  public readonly order: number;
  public readonly level: number;
  public readonly contentTypeId: string;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(params: ChapterParams) {
    this.id = params.id ?? crypto.randomUUID();
    this.materialId = params.materialId;
    this.parentChapterId = params.parentChapterId;
    this.name = params.name;
    this.description = params.description;
    this.order = params.order ?? 0;
    this.level = params.level;
    this.contentTypeId = params.contentTypeId;
    this.createdAt = params.createdAt ?? new Date();
    this.updatedAt = params.updatedAt ?? new Date();
  }

  static create(params: Omit<ChapterParams, "id" | "createdAt" | "updatedAt">): Chapter {
    return new Chapter({
      ...params,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  isChildOf(parentId: string): boolean {
    return this.parentChapterId === parentId;
  }

  isRootChapter(): boolean {
    return !this.parentChapterId;
  }
}
