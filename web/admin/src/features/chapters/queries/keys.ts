export const chapterKeys = {
  all: [{ scope: "chapters" }] as const,
  detail: (chapterId: string) =>
    [...chapterKeys.all, { entity: "detail", chapterId }] as const,
};
