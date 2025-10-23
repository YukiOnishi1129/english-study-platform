import type { FormState } from "@/features/materials/types/formState";

export interface ReorderUnitsActionPayload {
  materialId: string;
  chapterId: string;
  orderedUnitIds: string[];
}

export type ReorderUnitsAction = (
  payload: ReorderUnitsActionPayload,
) => Promise<FormState>;
