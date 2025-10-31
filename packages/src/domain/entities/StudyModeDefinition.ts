import crypto from "node:crypto";

import type { StudyModeCode } from "../value-objects";

export interface StudyModeDefinitionParams {
  id?: string;
  code: StudyModeCode;
  name: string;
  description?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class StudyModeDefinition {
  public readonly id: string;
  public readonly code: StudyModeCode;
  public readonly name: string;
  public readonly description: string | null;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(params: StudyModeDefinitionParams) {
    this.id = params.id ?? crypto.randomUUID();
    this.code = params.code;
    this.name = params.name;
    this.description = params.description ?? null;
    this.createdAt = params.createdAt ?? new Date();
    this.updatedAt = params.updatedAt ?? new Date();
  }

  static create(
    params: Omit<StudyModeDefinitionParams, "id" | "createdAt" | "updatedAt">,
  ): StudyModeDefinition {
    return new StudyModeDefinition({
      ...params,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
}

