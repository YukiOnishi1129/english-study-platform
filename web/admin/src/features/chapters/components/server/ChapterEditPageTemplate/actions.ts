"use server";

import { revalidatePath } from "next/cache";
import { ZodError } from "zod";
import { updateChapter } from "@/external/handler/material/material.command.server";
import {
  toChapterDetailPath,
  toMaterialDetailPath,
} from "@/features/materials/lib/paths";
import type { FormState } from "@/features/materials/types/formState";

export async function updateChapterAction(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const chapterId = formData.get("chapterId");
  const materialId = formData.get("materialId");
  const parentChapterId = formData.get("parentChapterId");
  const name = formData.get("name");
  const description = formData.get("description");

  const chapterIdValue = typeof chapterId === "string" ? chapterId : "";
  const materialIdValue = typeof materialId === "string" ? materialId : "";
  const parentChapterIdValue =
    typeof parentChapterId === "string" && parentChapterId.length > 0
      ? parentChapterId
      : undefined;

  try {
    await updateChapter({
      chapterId: chapterIdValue,
      name: typeof name === "string" ? name : "",
      description:
        typeof description === "string" && description.length > 0
          ? description
          : undefined,
    });

    revalidatePath("/materials");
    if (materialIdValue) {
      revalidatePath(toMaterialDetailPath(materialIdValue));
    }
    if (chapterIdValue) {
      revalidatePath(toChapterDetailPath(chapterIdValue));
    }
    if (parentChapterIdValue) {
      revalidatePath(toChapterDetailPath(parentChapterIdValue));
    }

    return {
      status: "success",
      redirect: chapterIdValue
        ? toChapterDetailPath(chapterIdValue)
        : undefined,
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
        error instanceof Error ? error.message : "章の更新に失敗しました。",
    };
  }
}
