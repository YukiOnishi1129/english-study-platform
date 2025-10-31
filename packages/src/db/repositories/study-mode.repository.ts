import {
  StudyModeDefinition as DomainStudyMode,
  type StudyModeRepository,
  type StudyModeCode,
} from "@acme/shared/domain";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { eq } from "drizzle-orm";

import { db } from "../client";
import { studyModes } from "../schema/study-modes";

export type StudyModeRow = InferSelectModel<typeof studyModes>;
export type NewStudyMode = InferInsertModel<typeof studyModes>;

export class StudyModeRepositoryImpl implements StudyModeRepository {
  async findById(id: string): Promise<DomainStudyMode | null> {
    const [row] = await db.select().from(studyModes).where(eq(studyModes.id, id)).limit(1);

    if (!row) {
      return null;
    }

    return this.toDomain(row);
  }

  async findByCode(code: StudyModeCode): Promise<DomainStudyMode | null> {
    const [row] = await db
      .select()
      .from(studyModes)
      .where(eq(studyModes.code, code))
      .limit(1);

    if (!row) {
      return null;
    }

    return this.toDomain(row);
  }

  async findAll(): Promise<DomainStudyMode[]> {
    const rows = await db.select().from(studyModes).orderBy(studyModes.code);

    return rows.map(this.toDomain);
  }

  async save(mode: DomainStudyMode): Promise<DomainStudyMode> {
    const [row] = await db
      .insert(studyModes)
      .values({
        id: mode.id,
        code: mode.code,
        name: mode.name,
        description: mode.description ?? null,
        createdAt: mode.createdAt,
        updatedAt: mode.updatedAt,
      })
      .onConflictDoUpdate({
        target: studyModes.id,
        set: {
          code: mode.code,
          name: mode.name,
          description: mode.description ?? null,
          updatedAt: new Date(),
        },
      })
      .returning();

    if (!row) {
      throw new Error("Failed to save study mode");
    }

    return this.toDomain(row);
  }

  private toDomain = (row: StudyModeRow): DomainStudyMode =>
    new DomainStudyMode({
      id: row.id,
      code: row.code as DomainStudyMode["code"],
      name: row.name,
      description: row.description ?? undefined,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
}

