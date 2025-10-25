export const questionKeys = {
  all: [{ scope: "questions" }] as const,
  detail: (questionId: string) =>
    [...questionKeys.all, { entity: "detail", questionId }] as const,
};
