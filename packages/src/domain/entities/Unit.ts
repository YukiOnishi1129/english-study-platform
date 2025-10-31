import crypto from "node:crypto";

export interface UnitParams {
  id?: string;
  chapterId: string;
  contentTypeId: string;
  name: string;
  description?: string;
  order: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Unit {
  public readonly id: string;
  public readonly chapterId: string;
  public readonly contentTypeId: string;
  public readonly name: string;
  public readonly description?: string;
  public readonly order: number;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(params: UnitParams) {
    this.id = params.id ?? crypto.randomUUID();
    this.chapterId = params.chapterId;
    this.contentTypeId = params.contentTypeId;
    this.name = params.name;
    this.description = params.description;
    this.order = params.order ?? 0;
    this.createdAt = params.createdAt ?? new Date();
    this.updatedAt = params.updatedAt ?? new Date();
  }

  static create(params: Omit<UnitParams, "id" | "createdAt" | "updatedAt">): Unit {
    return new Unit({
      ...params,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
}
