import type { FormRedirect } from "@/features/materials/types/formState";

export function toMaterialDetailPath(materialId: string): FormRedirect {
  return `/materials/${materialId}`;
}

export function toChapterDetailPath(chapterId: string): FormRedirect {
  return `/chapters/${chapterId}`;
}

export function toChapterEditPath(chapterId: string): FormRedirect {
  return `/chapters/${chapterId}/edit`;
}

export function toUnitDetailPath(unitId: string): FormRedirect {
  return `/units/${unitId}`;
}

export function toUnitEditPath(unitId: string): FormRedirect {
  return `/units/${unitId}/edit`;
}

export function toQuestionDetailPath(questionId: string): FormRedirect {
  return `/questions/${questionId}`;
}

export function toQuestionEditPath(questionId: string): FormRedirect {
  return `/questions/${questionId}/edit`;
}
