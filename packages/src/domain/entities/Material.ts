import crypto from "node:crypto";

export interface MaterialParams {
  id?: string;
  name: string;
  description?: string;
  order: number;
  contentTypeId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Material {
  public readonly id: string;
  public readonly name: string;
  public readonly description?: string;
  public readonly order: number;
  public readonly contentTypeId: string;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(params: MaterialParams) {
    this.id = params.id ?? crypto.randomUUID();
    this.name = params.name;
    this.description = params.description;
    this.order = params.order ?? 0;
    this.contentTypeId = params.contentTypeId;
    this.createdAt = params.createdAt ?? new Date();
    this.updatedAt = params.updatedAt ?? new Date();
  }

  static create(params: Omit<MaterialParams, "id" | "createdAt" | "updatedAt">): Material {
    return new Material({
      ...params,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
}
