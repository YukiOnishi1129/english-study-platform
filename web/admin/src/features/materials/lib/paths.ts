import type { FormRedirect } from "@/features/materials/types/formState";

export function toMaterialDetailPath(materialId: string): FormRedirect {
  return `/materials/${materialId}`;
}

export function toUnitDetailPath(
  materialId: string,
  chapterId: string,
  unitId: string,
): FormRedirect {
  return `/materials/${materialId}/chapters/${chapterId}/units/${unitId}`;
}

export function toUnitEditPath(
  materialId: string,
  chapterId: string,
  unitId: string,
): FormRedirect {
  return `/materials/${materialId}/chapters/${chapterId}/units/${unitId}/edit`;
}
