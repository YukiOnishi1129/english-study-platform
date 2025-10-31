export const QUESTION_VARIANTS = ["vocabulary", "phrase", "conversation", "writing"] as const;

export type QuestionVariant = (typeof QUESTION_VARIANTS)[number];

export function isQuestionVariant(value: string): value is QuestionVariant {
  return (QUESTION_VARIANTS as readonly string[]).includes(value);
}

