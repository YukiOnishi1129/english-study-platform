"use server";

import { deleteMaterial } from "@/external/handler/material/material.command.server";

export async function deleteMaterialAction(payload: {
  materialId: string;
}): Promise<{ success: boolean; message?: string }> {
  try {
    await deleteMaterial({ materialId: payload.materialId });
    return { success: true };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "教材の削除に失敗しました。",
    };
  }
}
