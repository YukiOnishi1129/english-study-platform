"use server";

import { revalidatePath } from "next/cache";
import { ZodError } from "zod";
import {
  createChapter,
  createUnit,
  deleteMaterial,
  updateUnitOrders,
} from "@/external/handler/material/material.command.server";
import {
  toChapterDetailPath,
  toMaterialDetailPath,
  toUnitDetailPath,
} from "@/features/materials/lib/paths";
import type { FormState } from "@/features/materials/types/formState";
import type { ReorderUnitsActionPayload } from "@/features/materials/types/reorderUnitsAction";

export async function deleteMaterialAction(data: {
  materialId: string;
}): Promise<{ success: boolean; message?: string }> {
  try {
    await deleteMaterial({ materialId: data.materialId });

    revalidatePath("/materials");
    revalidatePath(toMaterialDetailPath(data.materialId));

    return { success: true };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "教材の削除に失敗しました。",
    };
  }
}

export async function createChapterAction(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const materialId = formData.get("materialId");
  const parentChapterId = formData.get("parentChapterId");
  const name = formData.get("name");
  const description = formData.get("description");

  const materialIdValue = typeof materialId === "string" ? materialId : "";

  try {
    await createChapter({
      materialId: materialIdValue,
      parentChapterId:
        typeof parentChapterId === "string" && parentChapterId.length > 0
          ? parentChapterId
          : undefined,
      name: typeof name === "string" ? name : "",
      description: typeof description === "string" ? description : undefined,
    });

    revalidatePath("/materials");
    if (materialIdValue) {
      revalidatePath(toMaterialDetailPath(materialIdValue));
    }
    if (typeof parentChapterId === "string" && parentChapterId.length > 0) {
      revalidatePath(toChapterDetailPath(parentChapterId));
    }

    return { status: "success" };
  } catch (error) {
    if (error instanceof ZodError) {
      const issues = error.issues ?? [];
      return {
        status: "error",
        message: issues[0]?.message ?? "入力内容を確認してください。",
      };
    }

    return {
      status: "error",
      message:
        error instanceof Error ? error.message : "章の作成に失敗しました。",
    };
  }
}

export async function createUnitAction(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const chapterIdEntry = formData.get("chapterId");
  const materialIdEntry = formData.get("materialId");
  const name = formData.get("name");
  const description = formData.get("description");

  const chapterId = typeof chapterIdEntry === "string" ? chapterIdEntry : "";
  const materialId = typeof materialIdEntry === "string" ? materialIdEntry : "";

  try {
    const unit = await createUnit({
      chapterId,
      name: typeof name === "string" ? name : "",
      description: typeof description === "string" ? description : undefined,
    });

    if (materialId) {
      revalidatePath(toMaterialDetailPath(materialId));
    }
    if (chapterId) {
      revalidatePath(toChapterDetailPath(chapterId));
    }
    revalidatePath("/materials");
    revalidatePath(toUnitDetailPath(unit.id));

    return {
      status: "success",
      redirect: toUnitDetailPath(unit.id),
    };
  } catch (error) {
    if (error instanceof ZodError) {
      const issues = error.issues ?? [];
      return {
        status: "error",
        message: issues[0]?.message ?? "入力内容を確認してください。",
      };
    }
    return {
      status: "error",
      message:
        error instanceof Error ? error.message : "UNITの作成に失敗しました。",
    };
  }
}

export async function reorderUnitsAction(
  payload: ReorderUnitsActionPayload,
): Promise<FormState> {
  try {
    await updateUnitOrders({
      chapterId: payload.chapterId,
      orderedUnitIds: payload.orderedUnitIds,
    });

    revalidatePath("/materials");
    revalidatePath(toMaterialDetailPath(payload.materialId));
    revalidatePath(toChapterDetailPath(payload.chapterId));

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
