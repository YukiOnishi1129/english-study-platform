"use server";

import { revalidatePath } from "next/cache";
import { ZodError } from "zod";
import { updateUnit } from "@/external/handler/material/material.command.server";
import {
  toChapterDetailPath,
  toMaterialDetailPath,
  toUnitDetailPath,
} from "@/features/materials/lib/paths";
import type { FormState } from "@/features/materials/types/formState";

export async function updateUnitAction(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const unitId = formData.get("unitId");
  const materialId = formData.get("materialId");
  const chapterId = formData.get("chapterId");
  const name = formData.get("name");
  const description = formData.get("description");

  const unitIdValue = typeof unitId === "string" ? unitId : "";
  const materialIdValue = typeof materialId === "string" ? materialId : "";
  const chapterIdValue = typeof chapterId === "string" ? chapterId : "";

  try {
    await updateUnit({
      unitId: unitIdValue,
      name: typeof name === "string" ? name : "",
      description:
        typeof description === "string" && description.length > 0
          ? description
          : undefined,
    });

    if (materialIdValue) {
      revalidatePath(toMaterialDetailPath(materialIdValue));
    }
    if (chapterIdValue) {
      revalidatePath(toChapterDetailPath(chapterIdValue));
    }
    if (unitIdValue) {
      revalidatePath(toUnitDetailPath(unitIdValue));
    }
    revalidatePath("/materials");

    return {
      status: "success",
      redirect: unitIdValue ? toUnitDetailPath(unitIdValue) : undefined,
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
        error instanceof Error ? error.message : "UNITの更新に失敗しました。",
    };
  }
}
