"use server";

import { deleteUnit } from "@/external/handler/material/material.command.server";
export async function deleteUnitAction(data: {
  unitId: string;
  chapterId: string;
  materialId: string;
}): Promise<{ success: boolean; message?: string }> {
  try {
    await deleteUnit({ unitId: data.unitId });

    return { success: true, message: "UNITを削除しました。" };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "UNITの削除に失敗しました。",
    };
  }
}
