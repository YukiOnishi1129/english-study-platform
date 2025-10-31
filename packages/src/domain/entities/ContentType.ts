import crypto from "node:crypto";

import type { ContentTypeCode } from "../value-objects";

export interface ContentTypeParams {
  id?: string;
  code: ContentTypeCode;
  name: string;
  description?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class ContentType {
  public readonly id: string;
  public readonly code: ContentTypeCode;
  public readonly name: string;
  public readonly description: string | null;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(params: ContentTypeParams) {
    this.id = params.id ?? crypto.randomUUID();
    this.code = params.code;
    this.name = params.name;
    this.description = params.description ?? null;
    this.createdAt = params.createdAt ?? new Date();
    this.updatedAt = params.updatedAt ?? new Date();
  }

  static create(params: Omit<ContentTypeParams, "id" | "createdAt" | "updatedAt">): ContentType {
    return new ContentType({
      ...params,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
}

