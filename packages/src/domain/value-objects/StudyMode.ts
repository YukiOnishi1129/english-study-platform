export const STUDY_MODE_CODES = [
  "jp_to_en",
  "en_to_jp",
  "sentence",
  "conversation_roleplay",
  "listening_comprehension",
  "writing_review",
] as const;

// Backward compatibility alias
export const STUDY_MODES = STUDY_MODE_CODES;

export type StudyModeCode = (typeof STUDY_MODE_CODES)[number];

export type StudyMode = StudyModeCode;

export const QUESTION_STATISTICS_MODES = ["aggregate", ...STUDY_MODE_CODES] as const;

export type QuestionStatisticsMode = (typeof QUESTION_STATISTICS_MODES)[number];

export function isStudyModeCode(value: string): value is StudyModeCode {
  return (STUDY_MODE_CODES as readonly string[]).includes(value);
}
