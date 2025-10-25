"use server";

import { updateUnitOrders } from "@/external/handler/material/material.command.server";
import type { FormState } from "@/features/materials/types/formState";
import type { ReorderUnitsActionPayload } from "@/features/materials/types/reorderUnitsAction";

export async function reorderUnitsAction(
  payload: ReorderUnitsActionPayload,
): Promise<FormState> {
  try {
    await updateUnitOrders({
      chapterId: payload.chapterId,
      orderedUnitIds: payload.orderedUnitIds,
    });

    return {
      status: "success",
      message: "UNITの並び順を更新しました。",
    };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "UNITの並び順を更新できませんでした。",
    };
  }
}
