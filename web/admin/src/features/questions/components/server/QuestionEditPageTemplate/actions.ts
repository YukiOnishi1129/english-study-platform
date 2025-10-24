"use server";

import { revalidatePath } from "next/cache";
import { ZodError } from "zod";
import { updateQuestion } from "@/external/handler/material/material.command.server";
import {
  toChapterDetailPath,
  toMaterialDetailPath,
  toQuestionDetailPath,
  toUnitDetailPath,
} from "@/features/materials/lib/paths";
import type { FormState } from "@/features/materials/types/formState";

export async function updateQuestionAction(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const questionIdEntry = formData.get("questionId");
  const unitIdEntry = formData.get("unitId");
  const japaneseEntry = formData.get("japanese");
  const hintEntry = formData.get("hint");
  const explanationEntry = formData.get("explanation");
  const orderEntry = formData.get("order");
  const correctAnswersEntries = formData.getAll("correctAnswers");

  const questionId = typeof questionIdEntry === "string" ? questionIdEntry : "";
  const unitId = typeof unitIdEntry === "string" ? unitIdEntry : "";

  const correctAnswers = correctAnswersEntries
    .map((entry) => (typeof entry === "string" ? entry.trim() : ""))
    .filter((entry) => entry.length > 0);

  const orderNumber =
    typeof orderEntry === "string" && orderEntry.trim().length > 0
      ? Number(orderEntry)
      : undefined;

  try {
    if (!questionId || !unitId) {
      throw new Error("必要なIDが取得できませんでした。");
    }

    if (correctAnswers.length === 0) {
      throw new Error("英語正解を1件以上入力してください。");
    }

    const detail = await updateQuestion({
      questionId,
      unitId,
      japanese: typeof japaneseEntry === "string" ? japaneseEntry : "",
      hint:
        typeof hintEntry === "string" && hintEntry.length > 0
          ? hintEntry
          : undefined,
      explanation:
        typeof explanationEntry === "string" && explanationEntry.length > 0
          ? explanationEntry
          : undefined,
      order:
        typeof orderNumber === "number" && Number.isFinite(orderNumber)
          ? orderNumber
          : undefined,
      correctAnswers,
    });

    revalidatePath("/materials");
    revalidatePath(toMaterialDetailPath(detail.material.id));
    if (detail.chapterPath.length > 0) {
      const lastChapter = detail.chapterPath[detail.chapterPath.length - 1];
      revalidatePath(toChapterDetailPath(lastChapter.id));
    }
    revalidatePath(toUnitDetailPath(detail.unit.id));
    revalidatePath(toQuestionDetailPath(detail.question.id));

    return {
      status: "success",
      redirect: toQuestionDetailPath(detail.question.id),
      message: "問題を更新しました。",
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
        error instanceof Error ? error.message : "問題の更新に失敗しました。",
    } satisfies FormState;
  }
}
