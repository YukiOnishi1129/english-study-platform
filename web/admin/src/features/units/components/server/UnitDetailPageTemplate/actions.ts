"use server";

import { revalidatePath } from "next/cache";
import {
  deleteUnit,
  updateQuestionOrders,
} from "@/external/handler/material/material.command.server";
import {
  toChapterDetailPath,
  toMaterialDetailPath,
  toUnitDetailPath,
} from "@/features/materials/lib/paths";
import type { UnitDetailContentPresenterProps } from "@/features/units/components/client/UnitDetailContent";

export const deleteUnitAction: UnitDetailContentPresenterProps["onDeleteUnit"] =
  async (data) => {
    try {
      await deleteUnit({ unitId: data.unitId });

      revalidatePath("/materials");
      revalidatePath(toMaterialDetailPath(data.materialId));
      revalidatePath(toChapterDetailPath(data.chapterId));

      return { success: true, message: "UNITを削除しました。" };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "UNITの削除に失敗しました。",
      };
    }
  };

export const reorderUnitQuestionsAction: UnitDetailContentPresenterProps["onReorderQuestions"] =
  async (data) => {
    try {
      await updateQuestionOrders({
        unitId: data.unitId,
        orderedQuestionIds: data.orderedQuestionIds,
      });

      revalidatePath("/materials");
      revalidatePath(toMaterialDetailPath(data.materialId));

      const uniqueChapterIds = Array.from(new Set(data.chapterIds));
      for (const chapterId of uniqueChapterIds) {
        revalidatePath(toChapterDetailPath(chapterId));
      }

      revalidatePath(toUnitDetailPath(data.unitId));

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
  };
