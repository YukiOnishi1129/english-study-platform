export interface ChapterParams {
  id?: string;
  materialId: string;
  parentChapterId?: string | null;
  name: string;
  order: number;
  level: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Chapter {
  readonly id: string;
  readonly materialId: string;
  readonly parentChapterId: string | null;
  readonly name: string;
  readonly order: number;
  readonly level: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(params: ChapterParams) {
    this.id = params.id || crypto.randomUUID();
    this.materialId = params.materialId;
    this.parentChapterId = params.parentChapterId || null;
    this.name = params.name;
    this.order = params.order;
    this.level = params.level;
    this.createdAt = params.createdAt || new Date();
    this.updatedAt = params.updatedAt || new Date();
  }

  isRootChapter(): boolean {
    return this.parentChapterId === null;
  }

  static create(
    params: Omit<ChapterParams, "id" | "createdAt" | "updatedAt">,
  ): Chapter {
    return new Chapter(params);
  }
}
