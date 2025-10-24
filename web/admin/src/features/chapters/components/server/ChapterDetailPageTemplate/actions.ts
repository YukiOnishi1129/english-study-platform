"use server";

import { revalidatePath } from "next/cache";
import { ZodError } from "zod";
import {
  createChapter,
  createUnit,
  deleteChapter,
  updateUnitOrders,
} from "@/external/handler/material/material.command.server";
import {
  toChapterDetailPath,
  toMaterialDetailPath,
  toUnitDetailPath,
} from "@/features/materials/lib/paths";
import type {
  FormRedirect,
  FormState,
} from "@/features/materials/types/formState";
import type { ReorderUnitsActionPayload } from "@/features/materials/types/reorderUnitsAction";

export async function deleteChapterAction(data: {
  chapterId: string;
  materialId: string;
  parentChapterId: string | null;
  ancestorChapterIds: string[];
}): Promise<{ success: boolean; message?: string; redirect?: FormRedirect }> {
  try {
    await deleteChapter({ chapterId: data.chapterId });

    revalidatePath("/materials");
    revalidatePath(toMaterialDetailPath(data.materialId));

    const uniqueAncestorIds = Array.from(
      new Set(
        data.ancestorChapterIds.filter(
          (id): id is string => typeof id === "string" && id.length > 0,
        ),
      ),
    );

    for (const ancestorId of uniqueAncestorIds) {
      revalidatePath(toChapterDetailPath(ancestorId));
    }

    revalidatePath(toChapterDetailPath(data.chapterId));

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

export async function createChapterAction(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const materialId = formData.get("materialId");
  const parentChapterId = formData.get("parentChapterId");
  const name = formData.get("name");
  const description = formData.get("description");

  const materialIdValue = typeof materialId === "string" ? materialId : "";
  const parentChapterIdValue =
    typeof parentChapterId === "string" && parentChapterId.length > 0
      ? parentChapterId
      : undefined;

  try {
    await createChapter({
      materialId: materialIdValue,
      parentChapterId: parentChapterIdValue,
      name: typeof name === "string" ? name : "",
      description: typeof description === "string" ? description : undefined,
    });

    if (materialIdValue) {
      revalidatePath(toMaterialDetailPath(materialIdValue));
    }
    if (parentChapterIdValue) {
      revalidatePath(toChapterDetailPath(parentChapterIdValue));
    }

    revalidatePath("/materials");

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
