export const QUESTION_TYPES = ["phrase", "jp_to_en", "en_to_jp", "cloze", "free_sentence"] as const;

export type QuestionType = (typeof QUESTION_TYPES)[number];

export const isVocabularyQuestionType = (type: QuestionType): boolean =>
  type === "jp_to_en" || type === "en_to_jp" || type === "cloze" || type === "free_sentence";

export const isFreeFormQuestionType = (type: QuestionType): boolean => type === "free_sentence";
