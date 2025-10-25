"use server";

import { updateQuestionOrders } from "@/external/handler/material/material.command.server";

export async function reorderQuestionsAction(data: {
  unitId: string;
  materialId: string;
  chapterIds: string[];
  orderedQuestionIds: string[];
}): Promise<{ success: boolean; message?: string }> {
  try {
    await updateQuestionOrders({
      unitId: data.unitId,
      orderedQuestionIds: data.orderedQuestionIds,
    });

    return { success: true, message: "問題の並び順を更新しました。" };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "問題の並び順更新に失敗しました。",
    };
  }
}
