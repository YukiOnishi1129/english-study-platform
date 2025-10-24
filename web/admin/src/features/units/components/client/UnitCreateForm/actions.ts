"use server";

import { ZodError } from "zod";
import { createUnit } from "@/external/handler/material/material.command.server";
import { toUnitDetailPath } from "@/features/materials/lib/paths";
import type { FormState } from "@/features/materials/types/formState";

export async function createUnitAction(formData: FormData): Promise<FormState> {
  const chapterIdEntry = formData.get("chapterId");
  const name = formData.get("name");
  const description = formData.get("description");

  const chapterId = typeof chapterIdEntry === "string" ? chapterIdEntry : "";

  try {
    const unit = await createUnit({
      chapterId,
      name: typeof name === "string" ? name : "",
      description: typeof description === "string" ? description : undefined,
    });

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
