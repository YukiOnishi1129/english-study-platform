"use server";

import { ZodError } from "zod";
import { createChapter } from "@/external/handler/material/material.command.server";
import type { FormState } from "@/features/materials/types/formState";

export async function createChapterAction(
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
