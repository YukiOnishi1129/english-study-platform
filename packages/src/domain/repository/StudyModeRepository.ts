import type { StudyModeDefinition } from "../entities/StudyModeDefinition";
import type { StudyModeCode } from "../value-objects";

export interface StudyModeRepository {
  findById(id: string): Promise<StudyModeDefinition | null>;
  findByCode(code: StudyModeCode): Promise<StudyModeDefinition | null>;
  findAll(): Promise<StudyModeDefinition[]>;
  save(studyMode: StudyModeDefinition): Promise<StudyModeDefinition>;
}

