"use server";

import { deleteChapter } from "@/external/handler/material/material.command.server";
import {
  toChapterDetailPath,
  toMaterialDetailPath,
} from "@/features/materials/lib/paths";
import type { FormRedirect } from "@/features/materials/types/formState";

export async function deleteChapterAction(data: {
  chapterId: string;
  materialId: string;
  parentChapterId: string | null;
  ancestorChapterIds: string[];
}): Promise<{ success: boolean; message?: string; redirect?: FormRedirect }> {
  try {
    await deleteChapter({ chapterId: data.chapterId });

    return {
      success: true,
      redirect: data.parentChapterId
        ? toChapterDetailPath(data.parentChapterId)
        : toMaterialDetailPath(data.materialId),
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "章の削除に失敗しました。",
    };
  }
}
