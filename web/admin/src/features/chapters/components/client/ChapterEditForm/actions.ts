"use server";

import { ZodError } from "zod";
import { updateChapter } from "@/external/handler/material/material.command.server";
import { toChapterDetailPath } from "@/features/materials/lib/paths";
import type { FormState } from "@/features/materials/types/formState";

export async function updateChapterAction(
  formData: FormData,
): Promise<FormState> {
  const chapterId = formData.get("chapterId");
  const name = formData.get("name");
  const description = formData.get("description");

  const chapterIdValue = typeof chapterId === "string" ? chapterId : "";

  try {
    await updateChapter({
      chapterId: chapterIdValue,
      name: typeof name === "string" ? name : "",
      description:
        typeof description === "string" && description.length > 0
          ? description
          : undefined,
    });

    return {
      status: "success",
      redirect: chapterIdValue
        ? toChapterDetailPath(chapterIdValue)
        : undefined,
    } satisfies FormState;
  } catch (error) {
    if (error instanceof ZodError) {
      const issues = error.issues ?? [];
      return {
        status: "error",
        message: issues[0]?.message ?? "入力内容を確認してください。",
      } satisfies FormState;
    }

    return {
      status: "error",
      message:
        error instanceof Error ? error.message : "章の更新に失敗しました。",
    } satisfies FormState;
  }
}
