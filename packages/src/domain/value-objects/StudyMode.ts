export const STUDY_MODES = ["jp_to_en", "en_to_jp", "sentence", "default"] as const;

export type StudyMode = (typeof STUDY_MODES)[number];

export const QUESTION_STATISTICS_MODES = ["aggregate", ...STUDY_MODES] as const;

export type QuestionStatisticsMode = (typeof QUESTION_STATISTICS_MODES)[number];
