import type { FormRedirect } from "@/features/materials/types/formState";

export function toMaterialDetailPath(materialId: string): FormRedirect {
  return `/materials/${materialId}`;
}

export function toChapterDetailPath(chapterId: string): FormRedirect {
  return `/chapters/${chapterId}`;
}

export function toUnitDetailPath(unitId: string): FormRedirect {
  return `/units/${unitId}`;
}

export function toUnitEditPath(unitId: string): FormRedirect {
  return `/units/${unitId}/edit`;
}
